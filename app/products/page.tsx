'use client'

import { useEffect, useState } from 'react'
import { ArrowRight, Search, SlidersHorizontal } from 'lucide-react'
import { QuoteDialog } from '@/components/quote-dialog'
import { MediaCard, SiteFooter, SiteHeader } from '@/components/site-shell'

type CatalogItem = {
  name: string
  category: string
  description: string
  image?: string
  images?: string[]
}


function ProductCard({ item, onQuote }: { item: CatalogItem; onQuote: () => void }) {
  const imagesList = item.images && item.images.length > 0 ? item.images : (item.image ? [item.image] : [])
  const [activeIdx, setActiveIdx] = useState(0)
  const currentImage = imagesList[activeIdx] || item.image || '/raamed-logo.jpg'

  return (
    <article className="group flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">
      <div>
        <div className="relative h-56 w-full overflow-hidden bg-slate-100">
          <img
            src={currentImage}
            alt={item.name}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
          {imagesList.length > 1 && (
            <span className="absolute top-3 right-3 rounded-full bg-slate-900/80 px-2.5 py-1 text-[11px] font-bold text-white backdrop-blur">
              {activeIdx + 1} / {imagesList.length} photos
            </span>
          )}
        </div>

        {imagesList.length > 1 && (
          <div className="flex gap-2 border-b border-slate-100 bg-slate-50/80 p-2 overflow-x-auto">
            {imagesList.map((imgUrl, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveIdx(idx)}
                className={`relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border-2 transition ${
                  activeIdx === idx ? 'border-[#f36f2b] ring-1 ring-[#f36f2b]' : 'border-transparent opacity-60 hover:opacity-100'
                }`}
              >
                <img src={imgUrl} alt={`${item.name} thumbnail ${idx + 1}`} className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        )}

        <div className="p-6">
          <p className="text-xs font-bold uppercase tracking-[.14em] text-[#f36f2b]">{item.category}</p>
          <h2 className="mt-2 text-2xl font-semibold">{item.name}</h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">{item.description}</p>
        </div>
      </div>

      <div className="p-6 pt-0">
        <button
          onClick={onQuote}
          className="mt-2 inline-flex items-center gap-1 font-bold text-[#0c6670] transition hover:text-[#f36f2b]"
        >
          Discuss this range <ArrowRight className="size-4" />
        </button>
      </div>
    </article>
  )
}

export default function ProductsPage() {
  const [quoteOpen, setQuoteOpen] = useState(false)
  const [liveCatalog, setLiveCatalog] = useState<CatalogItem[]>([])

  useEffect(() => {
    fetch('/api/products')
      .then((response) => (response.ok ? response.json() : []))
      .then((items) => {
        if (Array.isArray(items)) setLiveCatalog(items)
      })
      .catch(() => undefined)
  }, [])

  const [filter, setFilter] = useState('All equipment')
  const categories = ['All equipment', ...Array.from(new Set(liveCatalog.map((item) => item.category)))]
  const items = filter === 'All equipment' ? liveCatalog : liveCatalog.filter((item) => item.category === filter)

  return (
    <main className="min-h-screen bg-[#f7fafb] text-[#102a43]">
      <SiteHeader onQuote={() => setQuoteOpen(true)} />

      <section className="mx-auto max-w-7xl px-5 pb-10 pt-16 lg:px-8">
        <p className="text-sm font-bold uppercase tracking-[.18em] text-[#f36f2b]">Equipment catalogue</p>
        <h1 className="mt-3 max-w-3xl text-balance text-5xl font-semibold tracking-[-.06em] sm:text-6xl">
          Equipment selected for real clinical work.
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
          Explore Raamed&apos;s equipment categories. Tell us what your team is planning and we&apos;ll help you find the right fit.
        </p>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-20 lg:px-8">
        <div className="mb-8 flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
          <SlidersHorizontal className="ml-2 size-4 text-[#f36f2b]" />
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setFilter(category)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                filter === category ? 'bg-[#102a43] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {category}
            </button>
          ))}
          <div className="ml-auto hidden items-center gap-2 pr-3 text-sm text-slate-400 md:flex">
            <Search className="size-4" />
            Browse by category
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <ProductCard key={item.name} item={item} onQuote={() => setQuoteOpen(true)} />
          ))}
        </div>

        {items.length === 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
            <p className="text-lg font-semibold text-slate-700">No equipment found matching your selection.</p>
            <p className="mt-1 text-sm text-slate-500">Try selecting another category or check back later.</p>
          </div>
        )}
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-20 lg:px-8">
        <div className="grid gap-6 md:grid-cols-3">
          <MediaCard title="Equipment in practice" type="Photo gallery" />
          <MediaCard title="How our systems work" type="Video library" tone="bg-[#fff0e8]" />
          <MediaCard title="Clinical support, clearly" type="Case studies" tone="bg-[#e9eef8]" />
        </div>
      </section>

      <SiteFooter />
      <QuoteDialog open={quoteOpen} onOpenChange={setQuoteOpen} />
    </main>
  )
}
