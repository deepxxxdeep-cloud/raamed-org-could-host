'use client'

import Link from 'next/link'
import { useState } from 'react'
import { ChevronDown, Menu, Phone, X } from 'lucide-react'
import { LanguageSwitcher } from '@/components/language-switcher'
import { useLanguage } from '@/lib/language-context'

export const logoUrl = 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/PHOTO-2026-08-12-23-29-19-OFiaaaEdldyaqskkb6zBFH5NGFacxz.jpg'

export function SiteHeader({ onQuote }: { onQuote?: () => void }) {
  const [open, setOpen] = useState(false)
  const { t } = useLanguage()

  const links = [
    [t('aboutUs'), '/about'],
    [t('branchNetwork'), '/offices'],
    [t('customers'), '/customers'],
  ]
  const productLinks = [
    [t('patientMonitoring'), '/products#monitoring'],
    [t('surgicalSystems'), '/products#surgical'],
    [t('endoscopySystems'), '/products#diagnostics'],
    [t('respiratoryCare'), '/products#critical-care'],
    [t('sterilizationReprocessing'), '/products#care-systems'],
  ]

  return (
    <header className="sticky top-0 z-40 overflow-visible border-b border-slate-200/80 bg-white/95 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-5 py-3 lg:gap-6 lg:px-8">
        <Link href="/" className="group flex min-w-0 shrink-0 items-center gap-3" aria-label="Raamed home">
          <span className="flex h-14 w-44 shrink-0 items-center overflow-hidden rounded-2xl bg-white p-1 shadow-sm ring-1 ring-slate-200 transition group-hover:-translate-y-0.5 group-hover:shadow-md sm:h-16 sm:w-52">
            <img src={logoUrl} alt="Raamed logo" className="h-full w-full object-contain" />
          </span>
        </Link>
        <nav className="hidden min-w-0 flex-1 items-center justify-center gap-7 text-[13px] font-semibold text-slate-600 lg:flex">
          <div className="group relative">
            <button className="flex items-center gap-1 whitespace-nowrap transition hover:text-[#f36f2b]">
              {t('products')} <ChevronDown className="size-3.5 transition group-hover:rotate-180" />
            </button>
            <div className="invisible absolute left-1/2 top-full z-50 w-64 -translate-x-1/2 translate-y-2 rounded-2xl border border-slate-200 bg-white p-2 opacity-0 shadow-xl transition duration-200 group-hover:visible group-hover:translate-y-1 group-hover:opacity-100">
              {productLinks.map(([label, href]) => (
                <Link key={href} href={href} className="block rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-700 hover:bg-orange-50 hover:text-[#f36f2b]">
                  {label}
                </Link>
              ))}
              <Link href="/products" className="mt-1 block rounded-xl border-t border-slate-100 px-3 py-2.5 text-sm font-bold text-[#0c6670]">
                {t('viewAllEquipment')}
              </Link>
            </div>
          </div>
          {links.map(([label, href]) => (
            <Link key={href} href={href} className="whitespace-nowrap transition hover:text-[#f36f2b]">
              {label}
            </Link>
          ))}
        </nav>
        <div className="hidden shrink-0 items-center gap-3 lg:flex">
          <LanguageSwitcher />
          <a href="tel:+919625970722" className="flex items-center gap-2 text-sm font-semibold text-[#102a43]">
            <Phone className="size-4 text-[#f36f2b]" />+91 96259 70722
          </a>
          <button onClick={onQuote} className="whitespace-nowrap rounded-full bg-[#f36f2b] px-4 py-3 text-sm font-bold text-white shadow-lg shadow-orange-500/15 transition hover:-translate-y-0.5 hover:bg-[#dd5b1d]">
            {t('requestQuote')}
          </button>
        </div>
        <div className="flex items-center gap-2 lg:hidden">
          <LanguageSwitcher />
          <button className="rounded-xl border border-slate-200 bg-white p-2 text-[#102a43] shadow-sm" onClick={() => setOpen(!open)} aria-label="Toggle navigation">
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </div>
      {open && (
        <nav className="flex flex-col gap-1 border-t border-slate-200 bg-white px-5 py-4 lg:hidden">
          <Link href="/products" onClick={() => setOpen(false)} className="rounded-xl px-3 py-3 font-bold text-[#0c6670] hover:bg-orange-50">
            {t('products')}
          </Link>
          {productLinks.map(([label, href]) => (
            <Link key={href} href={href} onClick={() => setOpen(false)} className="rounded-xl px-3 py-2 pl-6 text-sm font-semibold text-slate-600 hover:bg-orange-50 hover:text-[#f36f2b]">
              {label}
            </Link>
          ))}
          {links.map(([label, href]) => (
            <Link key={href} href={href} onClick={() => setOpen(false)} className="rounded-xl px-3 py-3 font-semibold text-slate-700 hover:bg-orange-50 hover:text-[#f36f2b]">
              {label}
            </Link>
          ))}
          <button onClick={() => { setOpen(false); onQuote?.() }} className="mt-2 rounded-xl bg-[#f36f2b] px-4 py-3 text-center font-bold text-white">
            {t('requestQuote')}
          </button>
        </nav>
      )}
    </header>
  )
}

export function SiteFooter() {
  const { t } = useLanguage()
  return (
    <footer className="bg-[#102a43] px-5 py-14 text-white lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-[1.3fr_1fr_1fr]">
        <div>
          <img src={logoUrl} alt="Raamed logo - RAAMED / RAMMED Medical Equipment" className="h-16 w-56 rounded-xl bg-white object-contain p-1" />
          <p className="mt-5 max-w-sm text-sm leading-7 text-slate-300">
            {t('raamedDescription')}
          </p>
        </div>
        <div>
          <p className="font-bold text-orange-300">{t('exploreRaamed')}</p>
          <div className="mt-4 flex flex-col gap-3 text-sm text-slate-300">
            <Link href="/about">{t('aboutUs')}</Link>
            <Link href="/offices">{t('branchNetwork')}</Link>
            <Link href="/customers">{t('customers')}</Link>
            <Link href="/products">{t('products')}</Link>
            <Link href="/media">{t('mediaCentre')}</Link>
          </div>
        </div>
        <div>
          <p className="font-bold text-orange-300">{t('talkToTeam')}</p>
          <div className="mt-4 flex flex-col gap-3 text-sm text-slate-300">
            <a href="tel:01136650267">011-36650267 ({t('delhiHq')})</a>
            <a href="tel:+919625970722">+91 96259 70722</a>
            <a href="mailto:Business@raamed.online">Business@raamed.online</a>
            <p>{t('monSatHours')}</p>
          </div>
        </div>
      </div>
      <div className="mx-auto mt-12 max-w-7xl border-t border-white/15 pt-5 text-xs text-slate-400">
        <span>{t('copyright')}</span>
        <span className="mt-2 block text-[11px] text-slate-500">
          Made by <a href="https://aiwebify.site" target="_blank" rel="noreferrer" className="underline underline-offset-2 transition hover:text-orange-300">aiwebify.site</a>
        </span>
      </div>
    </footer>
  )
}

export function SectionIntro({ eyebrow, title, text }: { eyebrow: string; title: string; text: string }) {
  return <div className="max-w-3xl"><p className="text-sm font-bold uppercase tracking-[.18em] text-[#f36f2b]">{eyebrow}</p><h1 className="mt-3 text-balance text-4xl font-semibold tracking-[-.05em] text-[#102a43] sm:text-6xl">{title}</h1><p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">{text}</p></div>
}

export function MediaCard({ title, type, tone = 'bg-[#d9f2ef]' }: { title: string; type: string; tone?: string }) {
  const { t } = useLanguage()
  return (
    <article className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">
      <div className={`relative flex h-52 items-center justify-center ${tone}`}>
        <div className="rounded-2xl border border-white/70 bg-white/65 px-5 py-4 text-center shadow-lg backdrop-blur">
          <p className="text-xs font-bold uppercase tracking-[.18em] text-[#0c6670]">{type}</p>
          <p className="mt-2 font-semibold text-[#102a43]">Raamed media</p>
        </div>
        <span className="absolute bottom-4 left-4 rounded-full bg-white/80 px-3 py-1 text-xs font-bold text-[#102a43]">
          {t('previewComingSoon')}
        </span>
      </div>
      <div className="p-5">
        <h3 className="font-semibold text-[#102a43]">{title}</h3>
        <p className="mt-2 text-sm leading-6 text-slate-500">{t('mediaDescription')}</p>
      </div>
    </article>
  )
}

export const regionalOffices = [
  {
    city: 'Delhi (NCR)',
    state: 'Delhi',
    label: 'Main Branch (Headquarters)',
    isMain: true,
    address: 'DDA BUILDING, LAXMI NAGAR COMMERCIAL COMPLEX, DELHI 110092',
    phone: '011-36650267',
    mobile: '+91 96259 70722',
    mapUrl: 'https://www.google.com/maps/search/?api=1&query=DDA+BUILDING+LAXMI+NAGAR+COMMERCIAL+COMPLEX+DELHI+110092',
  },
  {
    city: 'Patna',
    state: 'Bihar',
    label: 'Patna Branch',
    isMain: false,
    address: 'Ground Floor, Gokul Nagar, Patna, Bihar',
    phone: '+91 96259 70722',
    mapUrl: 'https://www.google.com/maps/search/?api=1&query=Ground+Floor+Gokul+Nagar+Patna+Bihar',
  },
  {
    city: 'Lucknow',
    state: 'Uttar Pradesh',
    label: 'Lucknow Branch',
    isMain: false,
    address: 'Near KGMC, Chowk, Lucknow-226003, Uttar Pradesh',
    phone: '+91 96259 70722',
    mapUrl: 'https://www.google.com/maps/search/?api=1&query=Near+KGMC+Chowk+Lucknow+226003',
  },
]

export const reviews = [
  ['Dr. Meera Kulkarni', 'Medical Director, Asterline Hospital', 'Raamed helped us standardise our monitoring equipment across three departments. The team understood our workflow before recommending anything.'],
  ['Dr. Arjun Malhotra', 'Consultant Surgeon, Northview Clinic', 'Clear documentation, responsive service, and equipment that performs consistently. It is rare to get all three from one partner.'],
  ['Sonal Iyer', 'Procurement Lead, CareBridge Network', 'Their regional support makes a real difference. We can get a practical answer quickly, even after installation.'],
]
