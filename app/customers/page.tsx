'use client'

import { useState } from 'react'
import { QuoteDialog } from '@/components/quote-dialog'
import { SiteFooter, SiteHeader, SectionIntro } from '@/components/site-shell'
import { useLanguage } from '@/lib/language-context'

const customerReviews = [
  ['Dr. Meera Kulkarni', 'Medical Director, Asterline Hospital', 'Raamed understood our workflow before recommending equipment. The transition across three departments was calm, practical, and well supported.'],
  ['Dr. Arjun Malhotra', 'Consultant Surgeon, Northview Clinic', 'The documentation is clear, the service team is responsive, and the systems perform consistently when the clinical team needs them.'],
  ['Sonal Iyer', 'Procurement Lead, CareBridge Network', 'Raamed gives our regional teams one reliable point of contact for equipment, installation, and after-sales support.'],
  ['Dr. Kavita Rao', 'Chief of Clinical Services, Meridian Care', 'Their team speaks the language of clinical operations. We received a recommendation that fit our rooms, staff, and patient volume.'],
]

export default function CustomersPage() {
  const { t } = useLanguage()
  const [quoteOpen, setQuoteOpen] = useState(false)

  return (
    <main className="min-h-screen bg-[#f7fafb] text-[#102a43]">
      <SiteHeader onQuote={() => setQuoteOpen(true)} />
      <section className="mx-auto max-w-7xl px-5 pb-14 pt-16 lg:px-8">
        <SectionIntro
          eyebrow={t('customersEyebrow')}
          title={t('customersTitle')}
          text={t('customersSubtitle')}
        />
      </section>
      <section className="mx-auto max-w-7xl px-5 pb-20 lg:px-8">
        <div className="grid gap-6 md:grid-cols-2">
          {customerReviews.map(([name, role, review]) => (
            <article key={name} className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold">{name}</h2>
                  <p className="mt-1 text-sm text-[#0c6670]">{role}</p>
                </div>
                <div className="text-2xl tracking-widest text-[#f36f2b]" aria-label="Five stars">★★★★★</div>
              </div>
              <p className="mt-6 text-lg leading-8 text-slate-600">“{review}”</p>
            </article>
          ))}
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-5 pb-20 lg:px-8">
        <div className="rounded-[2rem] bg-[#102a43] p-8 text-white md:p-12">
          <p className="text-sm font-bold uppercase tracking-[.18em] text-orange-300">{t('workWithRaamed')}</p>
          <h2 className="mt-3 max-w-2xl text-3xl font-semibold tracking-tight md:text-4xl">
            {t('planningNewDepartment')}
          </h2>
          <button onClick={() => setQuoteOpen(true)} className="mt-7 rounded-full bg-[#f36f2b] px-6 py-3.5 font-bold text-white transition hover:bg-[#dd5b1d]">
            {t('talkToOurTeam')}
          </button>
        </div>
      </section>
      <SiteFooter />
      <QuoteDialog open={quoteOpen} onClose={() => setQuoteOpen(false)} />
    </main>
  )
}
