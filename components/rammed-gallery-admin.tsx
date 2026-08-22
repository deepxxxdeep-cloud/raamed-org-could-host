'use client'

import { useEffect, useRef, useState } from 'react'
import { upload } from '@vercel/blob/client'
import { Camera, Film, Loader2, Trash2, Upload } from 'lucide-react'
import {
  MEDIA_CONTENT_TYPES,
  MEDIA_MAX_BYTES,
  formatBytes,
  mediaKindFromType,
  type GalleryItem,
} from '@/lib/product-media'

const inputClass =
  'w-full rounded-xl border border-[#dce8eb] bg-white p-3 text-sm outline-none focus:border-[#f36f2b]'

const MULTIPART_THRESHOLD = 8 * 1024 * 1024

type UploadTask = { name: string; percent: number; error?: string }

/**
 * Rammed event media only. This writes to its own collection and its own blob
 * prefix, completely separate from the product / tools manager.
 */
export function RammedGalleryAdmin() {
  const [items, setItems] = useState<GalleryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [caption, setCaption] = useState('')
  const [eventTitle, setEventTitle] = useState('')
  const [uploads, setUploads] = useState<UploadTask[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function load() {
    try {
      const res = await fetch('/api/admin/gallery')
      if (!res.ok) throw new Error('load failed')
      setItems(await res.json())
    } catch {
      setError('Could not load the Rammed gallery. Please refresh the page.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  async function handleFiles(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files || [])
    event.target.value = ''
    if (!files.length) return

    setError('')
    setMessage('')
    setUploads(files.map((file) => ({ name: file.name, percent: 0 })))

    const uploaded: GalleryItem[] = []
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
        const blob = await upload(`rammed-gallery/${Date.now()}-${safeName}`, file, {
          access: 'public',
          handleUploadUrl: '/api/admin/gallery/upload',
          contentType,
          multipart: file.size > MULTIPART_THRESHOLD,
          onUploadProgress: ({ percentage }) => {
            setUploads((current) =>
              current.map((task) => (task.name === file.name ? { ...task, percent: percentage } : task)),
            )
          },
        })
        uploaded.push({
          url: blob.url,
          type: mediaKindFromType(contentType),
          title: eventTitle.trim(),
          caption: caption.trim(),
        })
      } catch (uploadError) {
        console.error('[v0] Rammed media upload failed', uploadError)
        setUploads((current) =>
          current.map((task) => (task.name === file.name ? { ...task, error: 'Upload failed' } : task)),
        )
      }
    }

    if (uploaded.length) {
      try {
        const res = await fetch('/api/admin/gallery', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items: uploaded }),
        })
        if (!res.ok) throw new Error('save failed')
        setMessage(
          `${uploaded.length} item${uploaded.length > 1 ? 's' : ''} added to the Rammed gallery and live on /media.`,
        )
        setCaption('')
        setEventTitle('')
        await load()
      } catch {
        setError('Uploaded, but could not save to the gallery. Please try again.')
      }
    }
    if (uploaded.length !== files.length) {
      setError('Some files could not be uploaded — see the list below.')
    }
    setTimeout(() => setUploads([]), uploaded.length === files.length ? 2500 : 12000)
  }

  async function removeItem(item: GalleryItem) {
    if (!item._id) return
    if (!confirm('Remove this item from the Rammed gallery?')) return
    try {
      const res = await fetch(`/api/admin/gallery?id=${item._id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('delete failed')
      setItems((current) => current.filter((entry) => entry._id !== item._id))
      setMessage('Item removed from the Rammed gallery.')
    } catch {
      setError('Could not remove the item.')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-[#dce8eb] bg-white p-6 text-sm text-[#6f8793]">
        <Loader2 className="size-4 animate-spin" /> Loading Rammed gallery…
      </div>
    )
  }

  const uploading = uploads.some((task) => !task.error && task.percent < 100)

  return (
    <div className="grid gap-6 text-[#102a43]">
      <div className="rounded-2xl border border-[#dce8eb] bg-white p-5 sm:p-6">
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <Camera className="size-5 text-[#f36f2b]" /> Upload Rammed event media
        </h2>
        <p className="mt-1 text-sm text-[#6f8793]">
          Photos and videos uploaded here appear only in the Rammed media centre on <strong>/media</strong>. They are
          never shown under any product.
        </p>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="grid gap-2 text-sm font-medium">
            Event name <span className="font-normal text-[#6f8793]">(optional)</span>
            <input
              value={eventTitle}
              onChange={(event) => setEventTitle(event.target.value)}
              className={inputClass}
              placeholder="Rammed expo, Delhi"
              maxLength={160}
            />
          </label>
          <label className="grid gap-2 text-sm font-medium">
            Caption <span className="font-normal text-[#6f8793]">(optional)</span>
            <input
              value={caption}
              onChange={(event) => setCaption(event.target.value)}
              className={inputClass}
              placeholder="Applied to the files in this upload."
              maxLength={500}
            />
          </label>
        </div>

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
          disabled={uploading}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[#dce8eb] px-4 py-6 text-sm font-semibold text-[#5a7484] transition hover:border-[#f36f2b] hover:text-[#f36f2b] disabled:opacity-60"
        >
          <Upload className="size-4" /> Upload photos & videos to the Rammed gallery
        </button>

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
                    <div className="h-full rounded-full bg-[#f36f2b] transition-all" style={{ width: `${task.percent}%` }} />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {(message || error) && (
          <div
            className={`mt-4 rounded-xl px-4 py-3 text-sm font-semibold ${
              error ? 'bg-red-50 text-red-700' : 'bg-[#e5f4f2] text-[#0c6670]'
            }`}
          >
            {error || message}
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-[#dce8eb] bg-white p-5 sm:p-6">
        <h2 className="text-lg font-semibold">Rammed gallery ({items.length})</h2>
        {!items.length ? (
          <div className="mt-4 rounded-xl border border-dashed border-[#dce8eb] px-4 py-10 text-center">
            <Camera className="mx-auto size-8 text-[#c3d4d9]" />
            <p className="mt-3 font-semibold">No Rammed media yet</p>
            <p className="mt-1 text-sm text-[#6f8793]">Upload event photos or videos above to fill the media centre.</p>
          </div>
        ) : (
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <div key={item._id} className="overflow-hidden rounded-xl border border-[#dce8eb]">
                <div className="relative aspect-video bg-slate-900">
                  {item.type === 'image' ? (
                    <img src={item.url} alt={item.title || 'Rammed event'} className="h-full w-full object-cover" />
                  ) : (
                    <video src={item.url} className="h-full w-full object-cover" controls preload="metadata" />
                  )}
                  <span className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-slate-900/80 px-2 py-0.5 text-[10px] font-bold uppercase text-white">
                    {item.type === 'video' ? <Film className="size-3" /> : <Camera className="size-3" />} {item.type}
                  </span>
                </div>
                <div className="flex items-start justify-between gap-2 p-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{item.title || 'Rammed event'}</p>
                    {item.caption && <p className="truncate text-xs text-[#6f8793]">{item.caption}</p>}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(item)}
                    className="shrink-0 rounded-lg p-1.5 text-red-600 transition hover:bg-red-50"
                    aria-label="Delete media"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
