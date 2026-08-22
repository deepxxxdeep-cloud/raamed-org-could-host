'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { ArrowRight, PlayCircle } from 'lucide-react'
import type { MediaItem, ToolProduct } from '@/lib/product-media'

type VideoEntry = { product: ToolProduct; video: MediaItem }

/**
 * Continuous right-to-left showcase of product videos.
 * The track is duplicated once and shifted by exactly -50%, so the loop is
 * seamless. With 1-2 videos there is nothing to scroll, so they are shown as a
 * plain static row instead — no animation, no duplication.
 */
const MARQUEE_CSS = `
.pv-marquee{overflow:hidden;-webkit-mask-image:linear-gradient(90deg,transparent,#000 6%,#000 94%,transparent);mask-image:linear-gradient(90deg,transparent,#000 6%,#000 94%,transparent)}
.pv-track{display:flex;width:max-content;gap:1.25rem;animation:pv-scroll var(--pv-duration,40s) linear infinite}
.pv-marquee:hover .pv-track{animation-play-state:paused}
@keyframes pv-scroll{from{transform:translate3d(0,0,0)}to{transform:translate3d(-50%,0,0)}}
@media (prefers-reduced-motion:reduce){
  .pv-marquee{overflow-x:auto;-webkit-mask-image:none;mask-image:none}
  .pv-track{animation:none}
}
`

function VideoCard({ entry }: { entry: VideoEntry }) {
  const { product, video } = entry
  return (
    <Link
      href={`/tools/${product.slug}`}
      className="group w-[260px] shrink-0 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl sm:w-[320px]"
    >
      <div className="relative aspect-video bg-slate-900">
        <video
          src={video.url}
          className="h-full w-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
        />
        <span className="absolute bottom-3 left-3 flex items-center gap-1.5 rounded-full bg-slate-900/70 px-3 py-1 text-[11px] font-bold text-white backdrop-blur">
          <PlayCircle className="size-3.5" /> Watch
        </span>
      </div>
      <div className="p-4">
        <h3 className="truncate font-semibold text-[#102a43]">{product.title}</h3>
        {product.description && (
          <p className="mt-1 line-clamp-2 text-sm leading-6 text-slate-600">{product.description}</p>
        )}
        <span className="mt-3 inline-flex items-center gap-1 text-sm font-bold text-[#0c6670] transition group-hover:text-[#f36f2b]">
          View product <ArrowRight className="size-4" />
        </span>
      </div>
    </Link>
  )
}

export function ProductVideoMarquee() {
  const [entries, setEntries] = useState<VideoEntry[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    let cancelled = false
    fetch('/api/product-media')
      .then((res) => (res.ok ? res.json() : []))
      .then((products: ToolProduct[]) => {
        if (cancelled || !Array.isArray(products)) return
        // One video per product keeps the row varied rather than dominated by a single tool.
        const list = products
          .map((product) => {
            const video = product.media?.find((item) => item.type === 'video')
            return video ? { product, video } : null
          })
          .filter((entry): entry is VideoEntry => entry !== null)
        setEntries(list)
      })
      .catch(() => undefined)
      .finally(() => {
        if (!cancelled) setLoaded(true)
      })
    return () => {
      cancelled = true
    }
  }, [])

  // Nothing to show yet: stay completely out of the page.
  if (!loaded || !entries.length) return null

  const isStatic = entries.length <= 2

  return (
    <section className="border-y border-slate-200 bg-white py-12">
      <style>{MARQUEE_CSS}</style>
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-[.18em] text-[#f36f2b]">Product films</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-[-.03em] text-[#102a43]">
              See our tools in action
            </h2>
          </div>
          <Link href="/tools" className="inline-flex items-center gap-1 font-bold text-[#0c6670] hover:text-[#f36f2b]">
            Browse all products <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>

      <div className="mt-8">
        {isStatic ? (
          <div className="mx-auto flex max-w-7xl flex-wrap gap-5 px-5 lg:px-8">
            {entries.map((entry) => (
              <VideoCard key={entry.product.slug} entry={entry} />
            ))}
          </div>
        ) : (
          <div className="pv-marquee">
            <div className="pv-track" style={{ ['--pv-duration' as string]: `${entries.length * 9}s` }}>
              {[...entries, ...entries].map((entry, index) => (
                <VideoCard key={`${entry.product.slug}-${index}`} entry={entry} />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
