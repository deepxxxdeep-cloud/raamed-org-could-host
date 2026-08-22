'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { ArrowRight, CheckCircle2, MessageCircle, Phone, ShieldCheck } from 'lucide-react'
import { MedicalHero } from '@/components/medical-hero'
import { MediaCard, SiteFooter, SiteHeader } from '@/components/site-shell'
import { QuoteDialog } from '@/components/quote-dialog'
import { FestivalHomepageVideo } from '@/components/festival-decorations'
import { ProductVideoMarquee } from '@/components/product-video-marquee'

import { useLanguage } from '@/lib/language-context'

type ProductItem = {
  _id?: string
  name: string
  category: string
  description: string
  image?: string
  images?: string[]
}

const whatsappNumber = '919625970722'

export default function Page() {
  const { t } = useLanguage()
  const [quoteOpen, setQuoteOpen] = useState(false)
  const [liveProducts, setLiveProducts] = useState<ProductItem[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    fetch('/api/products')
      .then((res) => (res.ok ? res.json() : []))
      .then((items) => {
        if (Array.isArray(items)) {
          setLiveProducts(items)
          setLoaded(true)
        }
      })
      .catch(() => setLoaded(true))
  }, [])

  return (
    <main className="min-h-screen bg-[#f7fafb] text-[#102a43]">
      <SiteHeader onQuote={() => setQuoteOpen(true)} />

      <FestivalHomepageVideo />

      <section className="mx-auto grid max-w-7xl gap-10 px-5 pb-20 pt-14 lg:grid-cols-[.9fr_1.1fr] lg:items-center lg:px-8 lg:pt-20">
        <div>
          <p className="flex items-center gap-2 text-sm font-bold uppercase tracking-[.18em] text-[#f36f2b]">
            <span className="size-2 rounded-full bg-[#49a878]" /> {t('trustedPartners')}
          </p>
          <h1 className="mt-5 max-w-2xl text-balance text-5xl font-semibold leading-[1.02] tracking-[-.06em] sm:text-7xl">
            {t('heroTitle')}
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
            {t('heroSubtitle')}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="#products" className="rounded-full bg-[#f36f2b] px-6 py-3.5 font-bold text-white shadow-lg shadow-orange-500/15 transition hover:-translate-y-0.5 hover:bg-[#dd5b1d]">
              {t('exploreEquipment')} <ArrowRight className="ml-2 inline size-4" />
            </Link>
            <button onClick={() => setQuoteOpen(true)} className="rounded-full border border-slate-300 bg-white px-6 py-3.5 font-bold text-[#0c6670] transition hover:-translate-y-0.5 hover:border-[#f36f2b]">
              {t('requestQuote')}
            </button>
          </div>
          <div className="mt-9 flex flex-wrap gap-6 text-sm font-semibold text-slate-600">
            <span><ShieldCheck className="mr-2 inline size-4 text-[#49a878]" />{t('qualityChecked')}</span>
            <span><CheckCircle2 className="mr-2 inline size-4 text-[#49a878]" />{t('regionalSupport')}</span>
          </div>
        </div>
        <MedicalHero />
      </section>

      <section className="border-y border-slate-200 bg-white px-5 py-7 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-5 sm:grid-cols-3">
          <div><p className="text-3xl font-semibold text-[#102a43]">15+</p><p className="mt-1 text-sm text-slate-500">{t('yearsExpText')}</p></div>
          <div><p className="text-3xl font-semibold text-[#102a43]">3</p><p className="mt-1 text-sm text-slate-500">{t('keyBranchesText')}</p></div>
          <div><p className="text-3xl font-semibold text-[#102a43]">24h</p><p className="mt-1 text-sm text-slate-500">{t('responseWindowText')}</p></div>
        </div>
      </section>

      <ProductVideoMarquee />

      <section id="products" className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="text-sm font-bold uppercase tracking-[.18em] text-[#f36f2b]">{t('equipmentDesk')}</p>
            <h2 className="mt-3 text-4xl font-semibold tracking-tight">{t('builtAroundCare')}</h2>
          </div>
          <Link href="/products" className="font-bold text-[#0c6670]">
            {t('seeFullCatalogue')} <ArrowRight className="ml-1 inline size-4" />
          </Link>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {liveProducts.slice(0, 6).map((product, index) => {
            const imgSrc = (product.images && product.images.length > 0 ? product.images[0] : product.image) || '/raamed-logo.jpg'
            return (
              <article key={product._id || product.name || index} className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl flex flex-col justify-between">
                <div>
                  <div className={`relative flex h-48 items-center justify-center ${index % 2 === 1 ? 'bg-[#fff0e8]' : 'bg-[#d9f2ef]'}`}>
                    <img src={imgSrc} alt={product.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                  </div>
                  <div className="p-6">
                    <p className="text-xs font-bold uppercase tracking-[.16em] text-[#0c6670]">{product.category}</p>
                    <h3 className="mt-2 text-xl font-semibold">{product.name}</h3>
                    <p className="mt-3 text-sm leading-6 text-slate-600">{product.description}</p>
                  </div>
                </div>
                <div className="p-6 pt-0">
                  <button onClick={() => setQuoteOpen(true)} className="mt-2 font-bold text-[#f36f2b] inline-flex items-center">
                    {t('enquireAboutThis')} <ArrowRight className="ml-1 inline size-4" />
                  </button>
                </div>
              </article>
            )
          })}
        </div>

        {loaded && liveProducts.length === 0 && (
          <div className="mt-10 rounded-2xl border border-slate-200 bg-white p-12 text-center">
            <p className="text-lg font-semibold text-slate-700">{t('noEquipmentFound')}</p>
            <p className="mt-1 text-sm text-slate-500">{t('checkBackLater')}</p>
          </div>
        )}
      </section>

      <section className="bg-[#e9f5f3] px-5 py-20 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1fr_.8fr] lg:items-center">
          <div>
            <p className="text-sm font-bold uppercase tracking-[.18em] text-[#f36f2b]">{t('betterHandover')}</p>
            <h2 className="mt-3 text-4xl font-semibold tracking-tight">{t('equipmentBeginning')}</h2>
            <p className="mt-5 max-w-xl text-lg leading-8 text-slate-600">
              {t('handoverSubtitle')}
            </p>
            <button onClick={() => setQuoteOpen(true)} className="mt-7 rounded-full bg-[#102a43] px-6 py-3.5 font-bold text-white transition hover:-translate-y-0.5">
              {t('talkToSpecialist')}
            </button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <MediaCard title={t('insideClinicalSupport')} type="Video" tone="bg-[#102a43]" />
            <MediaCard title={t('raamedInField')} type="Photo" tone="bg-[#fff0e8]" />
          </div>
        </div>
      </section>

      <SiteFooter />

      <div className="fixed bottom-5 right-5 z-40 flex flex-col gap-3">
        <a href={`https://wa.me/${whatsappNumber}`} target="_blank" rel="noreferrer" aria-label="Chat on WhatsApp" className="grid size-14 place-items-center rounded-full bg-[#25d366] text-white shadow-xl transition hover:-translate-y-1">
          <MessageCircle />
        </a>
        <a href="tel:01136650267" aria-label="Call Raamed" className="grid size-14 place-items-center rounded-full bg-[#49a878] text-white shadow-xl transition hover:-translate-y-1">
          <Phone />
        </a>
      </div>

      <QuoteDialog open={quoteOpen} onClose={() => setQuoteOpen(false)} />
    </main>
  )
}

