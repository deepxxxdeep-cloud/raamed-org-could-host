'use client'

import { useEffect, useState } from 'react'
import { Film, Loader2 } from 'lucide-react'
import { MediaCard, SiteFooter, SiteHeader, SectionIntro } from '@/components/site-shell'
import { useLanguage } from '@/lib/language-context'
import type { GalleryItem } from '@/lib/product-media'

/**
 * Rammed media centre. Reads the Rammed gallery collection only — product /
 * tool media lives on /tools and never appears here. Until the admin uploads
 * event media, the original preview cards remain in place.
 */
export default function MediaPage() {
  const { t } = useLanguage()
  const [items, setItems] = useState<GalleryItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/gallery')
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setItems(Array.isArray(data) ? data : []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <main className="bg-[#f7fafb] text-[#102a43]">
      <SiteHeader />
      <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
        <SectionIntro
          eyebrow={t('mediaEyebrow')}
          title={t('mediaTitle')}
          text={t('mediaSubtitle')}
        />

        {loading ? (
          <div className="mt-14 flex items-center gap-3 text-sm text-slate-500">
            <Loader2 className="size-4 animate-spin" /> Loading media…
          </div>
        ) : items.length > 0 ? (
          <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <article
                key={item._id}
                className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="relative aspect-video bg-slate-900">
                  {item.type === 'image' ? (
                    <img
                      src={item.url}
                      alt={item.title || 'Rammed event'}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <video
                      src={item.url}
                      className="h-full w-full object-cover"
                      controls
                      playsInline
                      preload="metadata"
                    />
                  )}
                  {item.type === 'video' && (
                    <span className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-slate-900/70 px-2.5 py-1 text-[11px] font-bold text-white backdrop-blur">
                      <Film className="size-3" /> Video
                    </span>
                  )}
                </div>
                {(item.title || item.caption) && (
                  <div className="p-5">
                    {item.title && <h3 className="font-semibold">{item.title}</h3>}
                    {item.caption && <p className="mt-2 text-sm leading-6 text-slate-500">{item.caption}</p>}
                  </div>
                )}
              </article>
            ))}
          </div>
        ) : (
          <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            <MediaCard title={t('raamedInField')} type="Photo story" tone="bg-[#d9f2ef]" />
            <MediaCard title="Monitor setup, explained" type="Video" tone="bg-[#d9e8f7]" />
            <MediaCard title="Meet our regional teams" type="Photo story" tone="bg-[#f7dfcf]" />
            <MediaCard title="A better delivery day" type="Video" tone="bg-[#e8eef8]" />
            <MediaCard title="Questions clinicians ask us" type="Interview" tone="bg-[#e6f4e8]" />
            <MediaCard title="Inside our catalogue" type="Lookbook" tone="bg-[#f1eadf]" />
          </div>
        )}
      </section>
      <SiteFooter />
    </main>
  )
}
