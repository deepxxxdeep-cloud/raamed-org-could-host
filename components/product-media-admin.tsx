'use client'

import { useEffect, useRef, useState } from 'react'
import { upload } from '@vercel/blob/client'
import {
  ArrowDown,
  ArrowUp,
  Boxes,
  Check,
  ExternalLink,
  Film,
  ImageIcon,
  Loader2,
  PlusCircle,
  Trash2,
  Upload,
  X,
} from 'lucide-react'
import {
  MEDIA_CONTENT_TYPES,
  MEDIA_MAX_BYTES,
  formatBytes,
  mediaKindFromType,
  slugify,
  type MediaItem,
  type ToolProduct,
} from '@/lib/product-media'

const inputClass =
  'w-full rounded-xl border border-[#dce8eb] bg-white p-3 text-sm outline-none focus:border-[#f36f2b]'

/** Files above this size are uploaded in parallel parts, with retries. */
const MULTIPART_THRESHOLD = 8 * 1024 * 1024

type UploadTask = { name: string; percent: number; error?: string }

export function ProductMediaAdmin() {
  const [products, setProducts] = useState<ToolProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const [newTitle, setNewTitle] = useState('')
  const [newDescription, setNewDescription] = useState('')
  const [creating, setCreating] = useState(false)

  const [openId, setOpenId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [savingDetails, setSavingDetails] = useState(false)
  const [uploads, setUploads] = useState<UploadTask[]>([])
  const [busyMediaId, setBusyMediaId] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const openProduct = products.find((product) => product._id === openId) || null

  async function load() {
    try {
      const res = await fetch('/api/admin/product-media')
      if (!res.ok) throw new Error('load failed')
      setProducts(await res.json())
    } catch {
      setError('Could not load products. Please refresh the page.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  function notify(text: string) {
    setMessage(text)
    setError('')
  }

  async function createProduct(event: React.FormEvent) {
    event.preventDefault()
    const title = newTitle.trim()
    if (!title) {
      setError('Please enter a product title.')
      return
    }
    setCreating(true)
    setError('')
    try {
      const res = await fetch('/api/admin/product-media', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description: newDescription.trim() }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Could not create the product.')
      setProducts((current) => [data, ...current])
      setNewTitle('')
      setNewDescription('')
      setOpenId(data._id)
      setEditTitle(data.title)
      setEditDescription(data.description || '')
      notify(`"${data.title}" created. Now upload its photos and videos.`)
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : 'Could not create the product.')
    } finally {
      setCreating(false)
    }
  }

  /** Every media write goes through here, so the product's list stays the single source of truth. */
  async function patchProduct(id: string, payload: Record<string, unknown>, successText?: string) {
    const res = await fetch('/api/admin/product-media', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...payload }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data?.error || 'Could not save the changes.')
    setProducts((current) => current.map((product) => (product._id === id ? data : product)))
    if (successText) notify(successText)
    return data as ToolProduct
  }

  async function handleFiles(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files || [])
    event.target.value = ''
    if (!files.length || !openProduct?._id) return

    setError('')
    setMessage('')
    setUploads(files.map((file) => ({ name: file.name, percent: 0 })))

    const uploaded: MediaItem[] = []
    for (const file of files) {
      const contentType = file.type || 'application/octet-stream'
      if (!MEDIA_CONTENT_TYPES.includes(contentType)) {
        setUploads((current) =>
          current.map((task) =>
            task.name === file.name ? { ...task, error: `Unsupported file type (${contentType || 'unknown'})` } : task,
          ),
        )
        continue
      }
      if (file.size > MEDIA_MAX_BYTES) {
        setUploads((current) =>
          current.map((task) =>
            task.name === file.name ? { ...task, error: `Too large (${formatBytes(file.size)})` } : task,
          ),
        )
        continue
      }

      try {
        const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '-')
        const blob = await upload(`products/${openProduct.slug}/${Date.now()}-${safeName}`, file, {
          access: 'public',
          handleUploadUrl: '/api/admin/product-media/upload',
          contentType,
          multipart: file.size > MULTIPART_THRESHOLD,
          onUploadProgress: ({ percentage }) => {
            setUploads((current) =>
              current.map((task) => (task.name === file.name ? { ...task, percent: percentage } : task)),
            )
          },
        })
        uploaded.push({
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          url: blob.url,
          type: mediaKindFromType(contentType),
          name: file.name,
          size: file.size,
          createdAt: new Date().toISOString(),
        })
      } catch (uploadError) {
        console.error('[v0] Media upload failed', uploadError)
        setUploads((current) =>
          current.map((task) => (task.name === file.name ? { ...task, error: 'Upload failed' } : task)),
        )
      }
    }

    if (uploaded.length) {
      try {
        await patchProduct(
          openProduct._id,
          { media: [...openProduct.media, ...uploaded] },
          `${uploaded.length} file${uploaded.length > 1 ? 's' : ''} added to "${openProduct.title}" and live on the website.`,
        )
      } catch (saveError) {
        setError(saveError instanceof Error ? saveError.message : 'Uploaded, but could not save to the product.')
      }
    }
    if (uploaded.length !== files.length) {
      setError('Some files could not be uploaded — see the list below.')
    }
    setTimeout(() => setUploads([]), uploaded.length === files.length ? 2500 : 12000)
  }

  async function moveMedia(product: ToolProduct, index: number, direction: -1 | 1) {
    const target = index + direction
    if (!product._id || target < 0 || target >= product.media.length) return
    const media = [...product.media]
    ;[media[index], media[target]] = [media[target], media[index]]
    setBusyMediaId(media[target].id)
    try {
      await patchProduct(product._id, { media })
    } catch (moveError) {
      setError(moveError instanceof Error ? moveError.message : 'Could not re-order the media.')
    } finally {
      setBusyMediaId(null)
    }
  }

  async function removeMedia(product: ToolProduct, item: MediaItem) {
    if (!product._id) return
    if (!confirm(`Remove this ${item.type} from "${product.title}"?`)) return
    setBusyMediaId(item.id)
    try {
      await patchProduct(
        product._id,
        { media: product.media.filter((entry) => entry.id !== item.id) },
        'Media removed.',
      )
    } catch (removeError) {
      setError(removeError instanceof Error ? removeError.message : 'Could not remove the media.')
    } finally {
      setBusyMediaId(null)
    }
  }

  async function saveDetails(product: ToolProduct) {
    if (!product._id) return
    setSavingDetails(true)
    setError('')
    try {
      await patchProduct(
        product._id,
        { title: editTitle, description: editDescription },
        'Product details saved.',
      )
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Could not save the details.')
    } finally {
      setSavingDetails(false)
    }
  }

  async function deleteProduct(product: ToolProduct) {
    if (!product._id) return
    if (!confirm(`Delete "${product.title}" and all ${product.media.length} media items?`)) return
    try {
      const res = await fetch(`/api/admin/product-media?id=${product._id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('delete failed')
      setProducts((current) => current.filter((entry) => entry._id !== product._id))
      if (openId === product._id) setOpenId(null)
      notify(`"${product.title}" deleted.`)
    } catch {
      setError('Could not delete the product.')
    }
  }

  function toggleOpen(product: ToolProduct) {
    if (openId === product._id) {
      setOpenId(null)
      return
    }
    setOpenId(product._id || null)
    setEditTitle(product.title)
    setEditDescription(product.description || '')
    setUploads([])
  }

  if (loading) {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-[#dce8eb] bg-white p-6 text-sm text-[#6f8793]">
        <Loader2 className="size-4 animate-spin" /> Loading products…
      </div>
    )
  }

  return (
    <div className="grid gap-6 text-[#102a43]">
      <div className="rounded-2xl border border-[#dce8eb] bg-white p-5 sm:p-6">
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <Boxes className="size-5 text-[#f36f2b]" /> Add a product / tool
        </h2>
        <p className="mt-1 text-sm text-[#6f8793]">
          Create the product once (for example “Sono Scope”). Every photo and video you upload later stays under this
          exact title — it can never appear in another product or in the Rammed gallery.
        </p>
        <form onSubmit={createProduct} className="mt-4 grid gap-4">
          <label className="grid gap-2 text-sm font-medium">
            Product title <span className="font-normal text-[#6f8793]">(required, must be unique)</span>
            <input
              value={newTitle}
              onChange={(event) => setNewTitle(event.target.value)}
              className={inputClass}
              placeholder="Sono Scope"
              maxLength={120}
            />
            {newTitle.trim() && (
              <span className="text-xs font-normal text-[#6f8793]">Page address: /tools/{slugify(newTitle)}</span>
            )}
          </label>
          <label className="grid gap-2 text-sm font-medium">
            Description / caption <span className="font-normal text-[#6f8793]">(optional)</span>
            <textarea
              value={newDescription}
              onChange={(event) => setNewDescription(event.target.value)}
              className={`${inputClass} min-h-20 resize-y`}
              placeholder="Short introduction shown on the product page."
              maxLength={2000}
            />
          </label>
          <div>
            <button
              type="submit"
              disabled={creating}
              className="inline-flex items-center gap-2 rounded-xl bg-[#f36f2b] px-5 py-3 font-semibold text-white transition hover:bg-[#dd5b1d] disabled:opacity-60"
            >
              {creating ? <Loader2 className="size-4 animate-spin" /> : <PlusCircle className="size-4" />}
              {creating ? 'Creating…' : 'Create product'}
            </button>
          </div>
        </form>
      </div>

      {(message || error) && (
        <div
          className={`rounded-xl px-4 py-3 text-sm font-semibold ${
            error ? 'bg-red-50 text-red-700' : 'bg-[#e5f4f2] text-[#0c6670]'
          }`}
        >
          {error || message}
        </div>
      )}

      {!products.length ? (
        <div className="rounded-2xl border border-dashed border-[#dce8eb] bg-white p-10 text-center">
          <Boxes className="mx-auto size-8 text-[#c3d4d9]" />
          <p className="mt-3 font-semibold">No products yet</p>
          <p className="mt-1 text-sm text-[#6f8793]">
            Create your first product above, then upload its photos and videos.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {products.map((product) => {
            const isOpen = openId === product._id
            const images = product.media.filter((item) => item.type === 'image').length
            const videos = product.media.filter((item) => item.type === 'video').length
            return (
              <div key={product._id} className="rounded-2xl border border-[#dce8eb] bg-white">
                <div className="flex flex-wrap items-center justify-between gap-3 p-5">
                  <button
                    type="button"
                    onClick={() => toggleOpen(product)}
                    className="flex min-w-0 flex-1 items-center gap-4 text-left"
                  >
                    <span className="grid size-12 shrink-0 place-items-center overflow-hidden rounded-xl bg-[#f1f6f7]">
                      {product.media[0]?.type === 'image' ? (
                        <img src={product.media[0].url} alt="" className="h-full w-full object-cover" />
                      ) : product.media[0]?.type === 'video' ? (
                        <Film className="size-5 text-[#0c6670]" />
                      ) : (
                        <ImageIcon className="size-5 text-[#c3d4d9]" />
                      )}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate font-semibold">{product.title}</span>
                      <span className="block text-xs text-[#6f8793]">
                        {images} photo{images === 1 ? '' : 's'} · {videos} video{videos === 1 ? '' : 's'} · /tools/
                        {product.slug}
                      </span>
                    </span>
                  </button>
                  <div className="flex items-center gap-2">
                    <a
                      href={`/tools/${product.slug}`}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-xl border border-[#dce8eb] p-2.5 text-[#5a7484] transition hover:text-[#f36f2b]"
                      aria-label={`Open ${product.title} page`}
                    >
                      <ExternalLink className="size-4" />
                    </a>
                    <button
                      type="button"
                      onClick={() => deleteProduct(product)}
                      className="rounded-xl border border-red-200 p-2.5 text-red-600 transition hover:bg-red-50"
                      aria-label={`Delete ${product.title}`}
                    >
                      <Trash2 className="size-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleOpen(product)}
                      className="rounded-xl bg-[#e5f4f2] px-4 py-2.5 text-sm font-semibold text-[#0c6670]"
                    >
                      {isOpen ? 'Close' : 'Manage media'}
                    </button>
                  </div>
                </div>

                {isOpen && (
                  <div className="border-t border-[#eef4f5] p-5">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <label className="grid gap-2 text-sm font-medium">
                        Title
                        <input
                          value={editTitle}
                          onChange={(event) => setEditTitle(event.target.value)}
                          className={inputClass}
                          maxLength={120}
                        />
                      </label>
                      <label className="grid gap-2 text-sm font-medium">
                        Description
                        <textarea
                          value={editDescription}
                          onChange={(event) => setEditDescription(event.target.value)}
                          className={`${inputClass} min-h-11 resize-y`}
                          maxLength={2000}
                        />
                      </label>
                    </div>
                    <button
                      type="button"
                      onClick={() => saveDetails(product)}
                      disabled={savingDetails}
                      className="mt-3 inline-flex items-center gap-2 rounded-xl border border-[#dce8eb] px-4 py-2.5 text-sm font-semibold disabled:opacity-60"
                    >
                      {savingDetails ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
                      Save details
                    </button>

                    <div className="mt-6">
                      <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        accept="image/*,video/*"
                        onChange={handleFiles}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploads.some((task) => !task.error && task.percent < 100)}
                        className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[#dce8eb] px-4 py-6 text-sm font-semibold text-[#5a7484] transition hover:border-[#f36f2b] hover:text-[#f36f2b] disabled:opacity-60"
                      >
                        <Upload className="size-4" />
                        Upload photos & videos to “{product.title}”
                      </button>
                      <p className="mt-2 text-center text-xs text-[#6f8793]">
                        Select several files at once. Large intro videos are supported (up to 2GB each).
                      </p>

                      {uploads.length > 0 && (
                        <div className="mt-4 grid gap-2">
                          {uploads.map((task) => (
                            <div key={task.name} className="rounded-xl border border-[#dce8eb] p-3">
                              <div className="flex items-center justify-between gap-3 text-xs font-semibold">
                                <span className="truncate">{task.name}</span>
                                <span className={task.error ? 'text-red-600' : 'text-[#0c6670]'}>
                                  {task.error || `${Math.round(task.percent)}%`}
                                </span>
                              </div>
                              {!task.error && (
                                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#edf2f3]">
                                  <div
                                    className="h-full rounded-full bg-[#f36f2b] transition-all"
                                    style={{ width: `${task.percent}%` }}
                                  />
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {product.media.length > 0 ? (
                      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {product.media.map((item, index) => (
                          <div key={item.id} className="overflow-hidden rounded-xl border border-[#dce8eb]">
                            <div className="relative aspect-video bg-slate-900">
                              {item.type === 'image' ? (
                                <img src={item.url} alt={item.name || ''} className="h-full w-full object-cover" />
                              ) : (
                                <video src={item.url} className="h-full w-full object-cover" controls preload="metadata" />
                              )}
                              <span className="absolute left-2 top-2 rounded-full bg-slate-900/80 px-2 py-0.5 text-[10px] font-bold uppercase text-white">
                                {item.type} · #{index + 1}
                              </span>
                            </div>
                            <div className="flex items-center justify-between gap-2 p-2">
                              <span className="min-w-0 truncate text-[11px] text-[#6f8793]">
                                {item.name || 'media'} {item.size ? `· ${formatBytes(item.size)}` : ''}
                              </span>
                              <span className="flex shrink-0 items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => moveMedia(product, index, -1)}
                                  disabled={index === 0 || busyMediaId === item.id}
                                  className="rounded-lg p-1.5 text-[#5a7484] transition hover:bg-slate-100 disabled:opacity-30"
                                  aria-label="Move earlier"
                                >
                                  <ArrowUp className="size-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => moveMedia(product, index, 1)}
                                  disabled={index === product.media.length - 1 || busyMediaId === item.id}
                                  className="rounded-lg p-1.5 text-[#5a7484] transition hover:bg-slate-100 disabled:opacity-30"
                                  aria-label="Move later"
                                >
                                  <ArrowDown className="size-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => removeMedia(product, item)}
                                  disabled={busyMediaId === item.id}
                                  className="rounded-lg p-1.5 text-red-600 transition hover:bg-red-50 disabled:opacity-30"
                                  aria-label="Delete media"
                                >
                                  <X className="size-3.5" />
                                </button>
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="mt-6 rounded-xl bg-slate-50 px-4 py-6 text-center text-sm text-[#6f8793]">
                        No media yet for this product. Upload photos or videos above.
                      </p>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
