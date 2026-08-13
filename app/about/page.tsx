'use client'

import { SiteFooter, SiteHeader, SectionIntro, MediaCard } from '@/components/site-shell'
import { useLanguage } from '@/lib/language-context'

export default function AboutPage() {
  const { t } = useLanguage()

  const features = [
    [t('practicalExpertise'), t('practicalExpertiseText')],
    [t('humanSupport'), t('humanSupportText')],
    [t('longTermThinking'), t('longTermThinkingText')],
  ]

  return (
    <main className="bg-[#f7fafb] text-[#102a43]">
      <SiteHeader />
      <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
        <SectionIntro
          eyebrow={t('aboutEyebrow')}
          title={t('aboutTitle')}
          text={t('aboutSubtitle')}
        />
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {features.map(([title, text]) => (
            <article key={title} className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
              <div className="mb-8 size-3 rounded-full bg-[#f36f2b]" />
              <h2 className="text-xl font-semibold">{title}</h2>
              <p className="mt-3 leading-7 text-slate-600">{text}</p>
            </article>
          ))}
        </div>
        <div className="mt-20 grid gap-5 md:grid-cols-2">
          <MediaCard title={t('peopleBehindTitle')} type="Photo story" tone="bg-[#d9f2ef]" />
          <MediaCard title={t('prepareDeliveryTitle')} type="Video" tone="bg-[#e8eef8]" />
        </div>
      </section>
      <SiteFooter />
    </main>
  )
}
