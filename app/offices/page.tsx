import { Building2, ExternalLink, MapPin, Phone } from 'lucide-react'
import { SiteFooter, SiteHeader, SectionIntro } from '@/components/site-shell'

export const metadata = {
  title: 'Branch Network & Locations | Raamed Medical Equipment',
  description: 'Find Raamed branches across India. Main Branch in Delhi (Laxmi Nagar), with branches in Patna (Bihar) and Lucknow (UP).',
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
    mobile: '+91 96259 70722',
    mapUrl: 'https://www.google.com/maps/search/?api=1&query=Ground+Floor+Gokul+Nagar+Patna+Bihar',
  },
  {
    city: 'Lucknow',
    state: 'Uttar Pradesh',
    label: 'Lucknow Branch',
    isMain: false,
    address: 'Near KGMC, Chowk, Lucknow-226003, Uttar Pradesh',
    mobile: '+91 96259 70722',
    mapUrl: 'https://www.google.com/maps/search/?api=1&query=Near+KGMC+Chowk+Lucknow+226003',
  },
]

export default function OfficesPage() {
  return (
    <main className="bg-[#f7fafb] text-[#102a43]">
      <SiteHeader />
      <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
        <SectionIntro
          eyebrow="Branch Network & Offices"
          title="Headquartered in Delhi, serving healthcare teams across India."
          text="Our Main Branch in Delhi and dedicated regional branches in Patna and Lucknow connect hospitals and clinics with rapid equipment delivery and responsive clinical support."
        />

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {regionalOffices.map((office) => (
            <article
              key={office.city}
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
                      {office.phone} (Landline HQ)
                    </a>
                  )}
                  {office.mobile && (
                    <a
                      href={`tel:${office.mobile.replaceAll(' ', '')}`}
                      className="inline-flex items-center gap-2 font-semibold text-[#102a43] hover:text-[#f36f2b]"
                    >
                      <Phone className="size-4 text-[#49a878]" />
                      {office.mobile} (Mobile / WhatsApp)
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
                  Open in Google Maps
                  <ExternalLink className="size-3.5 opacity-80" />
                </a>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-12 rounded-3xl bg-[#102a43] p-8 text-white sm:p-10">
          <p className="text-sm font-bold uppercase tracking-[.16em] text-orange-300">Need direct assistance?</p>
          <h2 className="mt-3 text-3xl font-semibold">Connect directly with our Main Branch or regional representatives.</h2>
          <p className="mt-2 max-w-xl text-sm leading-6 text-slate-300">We provide quick turnaround for clinical enquiries, product demos, and technical maintenance across Delhi, Bihar, and Uttar Pradesh.</p>
          <div className="mt-6 flex flex-wrap gap-4">
            <a href="tel:01136650267" className="rounded-full bg-[#f36f2b] px-6 py-3 font-bold text-white transition hover:bg-[#dd5b1d]">
              Call Delhi HQ: 011-36650267
            </a>
            <a href="mailto:Business@raamed.online" className="rounded-full border border-white/20 bg-white/10 px-6 py-3 font-bold text-white transition hover:bg-white/20">
              Email: Business@raamed.online
            </a>
          </div>
        </div>
      </section>
      <SiteFooter />
    </main>
  )
}
