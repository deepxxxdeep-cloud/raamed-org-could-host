'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { SiteFooter, SiteHeader } from '@/components/site-shell'
import { QuoteDialog } from '@/components/quote-dialog'
import { useLanguage } from '@/lib/language-context'
import type { MediaItem, ToolProduct } from '@/lib/product-media'

/** Detail page for one product / tool, showing every media item in admin order. */
export default function ToolDetailPage() {
  const params = useParams<{ slug: string }>()
  const slug = typeof params?.slug === 'string' ? params.slug : ''
  const { t } = useLanguage()
  const [product, setProduct] = useState<ToolProduct | null>(null)
  const [loading, setLoading] = useState(true)
  const [active, setActive] = useState<MediaItem | null>(null)
  const [quoteOpen, setQuoteOpen] = useState(false)

  useEffect(() => {
    if (!slug) return
    fetch('/api/product-media')
      .then((res) => (res.ok ? res.json() : []))
      .then((items: ToolProduct[]) => {
        const match = Array.isArray(items) ? items.find((item) => item.slug === slug) : null
        setProduct(match || null)
        setActive(match?.media?.[0] || null)
      })
      .catch(() => setProduct(null))
      .finally(() => setLoading(false))
  }, [slug])

  return (
    <main className="bg-[#f7fafb] text-[#102a43]">
      <SiteHeader onQuote={() => setQuoteOpen(true)} />
      <section className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
        <Link href="/tools" className="inline-flex items-center gap-2 text-sm font-bold text-[#0c6670] hover:text-[#f36f2b]">
          <ArrowLeft className="size-4" /> All products & tools
        </Link>

        {loading ? (
          <div className="mt-10 flex items-center gap-3 text-sm text-slate-500">
            <Loader2 className="size-4 animate-spin" /> Loading product…
          </div>
        ) : !product ? (
          <div className="mt-10 rounded-3xl border border-slate-200 bg-white p-12 text-center">
            <p className="text-lg font-semibold">This product is not available</p>
            <p className="mt-2 text-slate-600">
              It may have been renamed or removed. Please browse the{' '}
              <Link href="/tools" className="font-bold text-[#0c6670] underline-offset-4 hover:underline">
                products gallery
              </Link>
              .
            </p>
          </div>
        ) : (
          <>
            <h1 className="mt-6 text-balance text-4xl font-semibold tracking-[-.04em] sm:text-5xl">{product.title}</h1>
            {product.description && (
              <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600">{product.description}</p>
            )}

            {!product.media.length ? (
              <p className="mt-10 rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-600">
                Photos and videos for this product are coming soon.
              </p>
            ) : (
              <div className="mt-10 grid gap-6 lg:grid-cols-[1.4fr_1fr] lg:items-start">
                <div className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-900">
                  {active?.type === 'video' ? (
                    <video
                      key={active.url}
                      src={active.url}
                      className="aspect-video w-full bg-black"
                      controls
                      autoPlay
                      muted
                      loop
                      playsInline
                      preload="metadata"
                    />
                  ) : active ? (
                    <img src={active.url} alt={product.title} className="aspect-video w-full object-contain" />
                  ) : null}
                </div>

                <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-3">
                  {product.media.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setActive(item)}
                      className={`relative aspect-video overflow-hidden rounded-xl border-2 bg-slate-900 transition ${
                        active?.id === item.id
                          ? 'border-[#f36f2b] ring-1 ring-[#f36f2b]'
                          : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                      aria-label={`Show ${item.type}`}
                    >
                      {item.type === 'image' ? (
                        <img src={item.url} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <>
                          <video src={item.url} className="h-full w-full object-cover" muted playsInline preload="metadata" />
                          <span className="absolute bottom-1 left-1 rounded bg-slate-900/80 px-1.5 py-0.5 text-[9px] font-bold uppercase text-white">
                            video
                          </span>
                        </>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={() => setQuoteOpen(true)}
              className="mt-10 rounded-full bg-[#f36f2b] px-6 py-3.5 font-bold text-white transition hover:-translate-y-0.5 hover:bg-[#dd5b1d]"
            >
              {t('requestQuote')}
            </button>
          </>
        )}
      </section>
      <SiteFooter />
      <QuoteDialog open={quoteOpen} onClose={() => setQuoteOpen(false)} productName={product?.title} />
    </main>
  )
}
