'use client'

import { useEffect, useState } from 'react'
import { Building2, ExternalLink, MapPin, Phone } from 'lucide-react'
import { SiteFooter, SiteHeader, SectionIntro } from '@/components/site-shell'
import { useLanguage } from '@/lib/language-context'
import { DEFAULT_OFFICES, type OfficeItem } from '@/lib/offices-data'

export default function OfficesPage() {
  const { t } = useLanguage()
  const [offices, setOffices] = useState<OfficeItem[]>(DEFAULT_OFFICES)

  useEffect(() => {
    fetch('/api/offices')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setOffices(data)
        }
      })
      .catch(() => undefined)
  }, [])

  return (
    <main className="bg-[#f7fafb] text-[#102a43]">
      <SiteHeader />
      <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
        <SectionIntro
          eyebrow={t('branchNetworkEyebrow')}
          title={t('branchNetworkTitle')}
          text={t('branchNetworkSubtitle')}
        />

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {offices.map((office, idx) => (
            <article
              key={office._id || office.city || idx}
              className={`group flex flex-col justify-between rounded-3xl border bg-white p-7 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl ${
                office.isMain
                  ? 'border-[#f36f2b]/40 ring-2 ring-[#f36f2b]/20 shadow-orange-500/5'
                  : 'border-slate-200'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <span
                    className={`grid size-12 place-items-center rounded-2xl ${
                      office.isMain ? 'bg-[#fff0e8] text-[#f36f2b]' : 'bg-[#d9f2ef] text-[#0c6670]'
                    }`}
                  >
                    {office.isMain ? <Building2 className="size-6" /> : <MapPin className="size-6" />}
                  </span>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${
                      office.isMain
                        ? 'bg-[#f36f2b] text-white'
                        : 'bg-slate-100 text-[#0c6670]'
                    }`}
                  >
                    {office.label}
                  </span>
                </div>

                <h2 className="mt-6 text-2xl font-semibold">{office.city}</h2>
                {office.state && <p className="mt-0.5 text-xs font-bold uppercase tracking-wider text-slate-400">{office.state}</p>}

                <p className="mt-4 text-sm font-medium leading-6 text-slate-600">
                  {office.address}
                </p>
              </div>

              <div className="mt-8 space-y-3 border-t border-slate-100 pt-5">
                <div className="flex flex-col gap-1 text-sm">
                  {office.phone && (
                    <a
                      href={`tel:${office.phone.replaceAll('-', '').replaceAll(' ', '')}`}
                      className="inline-flex items-center gap-2 font-semibold text-[#102a43] hover:text-[#f36f2b]"
                    >
                      <Phone className="size-4 text-[#f36f2b]" />
                      {office.phone} {t('landlineHq')}
                    </a>
                  )}
                  {office.mobile && (
                    <a
                      href={`tel:${office.mobile.replaceAll(' ', '')}`}
                      className="inline-flex items-center gap-2 font-semibold text-[#102a43] hover:text-[#f36f2b]"
                    >
                      <Phone className="size-4 text-[#49a878]" />
                      {office.mobile} {t('mobileWhatsapp')}
                    </a>
                  )}
                </div>

                <a
                  href={office.mapUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#0c6670] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#094d54]"
                >
                  <MapPin className="size-4 text-orange-300" />
                  {t('openInGoogleMaps')}
                  <ExternalLink className="size-3.5 opacity-80" />
                </a>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-12 rounded-3xl bg-[#102a43] p-8 text-white sm:p-10">
          <p className="text-sm font-bold uppercase tracking-[.16em] text-orange-300">{t('needDirectAssistance')}</p>
          <h2 className="mt-3 text-3xl font-semibold">{t('connectDirectly')}</h2>
          <p className="mt-2 max-w-xl text-sm leading-6 text-slate-300">{t('quickTurnaroundText')}</p>
          <div className="mt-6 flex flex-wrap gap-4">
            <a href="tel:01136650267" className="rounded-full bg-[#f36f2b] px-6 py-3 font-bold text-white transition hover:bg-[#dd5b1d]">
              {t('callDelhiHqBtn')}
            </a>
            <a href="mailto:Business@raamed.online" className="rounded-full border border-white/20 bg-white/10 px-6 py-3 font-bold text-white transition hover:bg-white/20">
              {t('emailBtn')}
            </a>
          </div>
        </div>
      </section>
      <SiteFooter />
    </main>
  )
}
