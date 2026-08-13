'use client'

import { MediaCard, SiteFooter, SiteHeader, SectionIntro } from '@/components/site-shell'
import { useLanguage } from '@/lib/language-context'

export default function MediaPage() {
  const { t } = useLanguage()

  return (
    <main className="bg-[#f7fafb] text-[#102a43]">
      <SiteHeader />
      <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
        <SectionIntro
          eyebrow={t('mediaEyebrow')}
          title={t('mediaTitle')}
          text={t('mediaSubtitle')}
        />
        <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          <MediaCard title={t('raamedInField')} type="Photo story" tone="bg-[#d9f2ef]" />
          <MediaCard title="Monitor setup, explained" type="Video" tone="bg-[#d9e8f7]" />
          <MediaCard title="Meet our regional teams" type="Photo story" tone="bg-[#f7dfcf]" />
          <MediaCard title="A better delivery day" type="Video" tone="bg-[#e8eef8]" />
          <MediaCard title="Questions clinicians ask us" type="Interview" tone="bg-[#e6f4e8]" />
          <MediaCard title="Inside our catalogue" type="Lookbook" tone="bg-[#f1eadf]" />
        </div>
      </section>
      <SiteFooter />
    </main>
  )
}
