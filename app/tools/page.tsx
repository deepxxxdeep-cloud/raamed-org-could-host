'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { ArrowRight, Boxes, Film, ImageIcon, Loader2 } from 'lucide-react'
import { SiteFooter, SiteHeader, SectionIntro } from '@/components/site-shell'
import { QuoteDialog } from '@/components/quote-dialog'
import type { ToolProduct } from '@/lib/product-media'

/** Products / Tools gallery. Shows only product media — never Rammed event media. */
export default function ToolsGalleryPage() {
  const [products, setProducts] = useState<ToolProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [failed, setFailed] = useState(false)
  const [quoteOpen, setQuoteOpen] = useState(false)

  useEffect(() => {
    fetch('/api/product-media')
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error('failed'))))
      .then((items) => setProducts(Array.isArray(items) ? items : []))
      .catch(() => setFailed(true))
      .finally(() => setLoading(false))
  }, [])

  return (
    <main className="bg-[#f7fafb] text-[#102a43]">
      <SiteHeader onQuote={() => setQuoteOpen(true)} />
      <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
        <SectionIntro
          eyebrow="Products & tools"
          title="Our equipment, in pictures and film"
          text="Browse photos and videos of the tools we supply and support. Open any product to see its full media."
        />

        {loading ? (
          <div className="mt-14 flex items-center gap-3 text-sm text-slate-500">
            <Loader2 className="size-4 animate-spin" /> Loading products…
          </div>
        ) : failed ? (
          <p className="mt-14 rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-600">
            We could not load the product gallery just now. Please refresh the page.
          </p>
        ) : !products.length ? (
          <div className="mt-14 rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center">
            <Boxes className="mx-auto size-10 text-slate-300" />
            <p className="mt-4 text-lg font-semibold">Product media is on its way</p>
            <p className="mt-2 text-slate-600">
              We are adding photos and videos for our equipment range. In the meantime, browse the{' '}
              <Link href="/products" className="font-bold text-[#0c6670] underline-offset-4 hover:underline">
                full catalogue
              </Link>
              .
            </p>
          </div>
        ) : (
          <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => {
              const cover = product.media.find((item) => item.type === 'image')
              const video = product.media.find((item) => item.type === 'video')
              const images = product.media.filter((item) => item.type === 'image').length
              const videos = product.media.filter((item) => item.type === 'video').length
              return (
                <Link
                  key={product.slug}
                  href={`/tools/${product.slug}`}
                  className="group flex flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className="relative aspect-video bg-slate-900">
                    {cover ? (
                      <img
                        src={cover.url}
                        alt={product.title}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                    ) : video ? (
                      <video src={video.url} className="h-full w-full object-cover" muted playsInline preload="metadata" />
                    ) : (
                      <div className="grid h-full w-full place-items-center bg-[#d9f2ef]">
                        <ImageIcon className="size-8 text-[#0c6670]" />
                      </div>
                    )}
                    <span className="absolute bottom-3 left-3 flex gap-2 text-[11px] font-bold text-white">
                      {images > 0 && (
                        <span className="rounded-full bg-slate-900/70 px-2.5 py-1 backdrop-blur">
                          {images} photo{images === 1 ? '' : 's'}
                        </span>
                      )}
                      {videos > 0 && (
                        <span className="flex items-center gap-1 rounded-full bg-slate-900/70 px-2.5 py-1 backdrop-blur">
                          <Film className="size-3" /> {videos} video{videos === 1 ? '' : 's'}
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col p-6">
                    <h2 className="text-xl font-semibold">{product.title}</h2>
                    {product.description && (
                      <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600">{product.description}</p>
                    )}
                    <span className="mt-4 inline-flex items-center gap-1 font-bold text-[#0c6670] transition group-hover:text-[#f36f2b]">
                      View media <ArrowRight className="size-4" />
                    </span>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </section>
      <SiteFooter />
      <QuoteDialog open={quoteOpen} onClose={() => setQuoteOpen(false)} />
    </main>
  )
}
