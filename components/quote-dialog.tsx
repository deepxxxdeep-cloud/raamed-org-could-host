'use client'

import { FormEvent, useState } from 'react'
import { CheckCircle2, ChevronDown, Loader2, X } from 'lucide-react'
import { useLanguage } from '@/lib/language-context'

export type CountryCode = {
  code: string
  dial: string
  name: string
  flag: string
}

export const COUNTRY_CODES: CountryCode[] = [
  { code: 'IN', dial: '+91', name: 'India', flag: '🇮🇳' },
  { code: 'US', dial: '+1', name: 'United States', flag: '🇺🇸' },
  { code: 'GB', dial: '+44', name: 'United Kingdom', flag: '🇬🇧' },
  { code: 'AE', dial: '+971', name: 'United Arab Emirates', flag: '🇦🇪' },
  { code: 'SA', dial: '+966', name: 'Saudi Arabia', flag: '🇸🇦' },
  { code: 'QA', dial: '+974', name: 'Qatar', flag: '🇶🇦' },
  { code: 'KW', dial: '+965', name: 'Kuwait', flag: '🇰🇼' },
  { code: 'OM', dial: '+968', name: 'Oman', flag: '🇴🇲' },
  { code: 'BH', dial: '+973', name: 'Bahrain', flag: '🇧🇭' },
  { code: 'SG', dial: '+65', name: 'Singapore', flag: '🇸🇬' },
  { code: 'MY', dial: '+60', name: 'Malaysia', flag: '🇲🇾' },
  { code: 'AU', dial: '+61', name: 'Australia', flag: '🇦🇺' },
  { code: 'CA', dial: '+1', name: 'Canada', flag: '🇨🇦' },
  { code: 'DE', dial: '+49', name: 'Germany', flag: '🇩🇪' },
  { code: 'FR', dial: '+33', name: 'France', flag: '🇫🇷' },
  { code: 'ES', dial: '+34', name: 'Spain', flag: '🇪🇸' },
  { code: 'IT', dial: '+39', name: 'Italy', flag: '🇮🇹' },
  { code: 'JP', dial: '+81', name: 'Japan', flag: '🇯🇵' },
  { code: 'NP', dial: '+977', name: 'Nepal', flag: '🇳🇵' },
  { code: 'BD', dial: '+880', name: 'Bangladesh', flag: '🇧🇩' },
  { code: 'LK', dial: '+94', name: 'Sri Lanka', flag: '🇱🇰' },
  { code: 'ZA', dial: '+27', name: 'South Africa', flag: '🇿🇦' },
  { code: 'NG', dial: '+234', name: 'Nigeria', flag: '🇳🇬' },
  { code: 'KE', dial: '+254', name: 'Kenya', flag: '🇰🇪' },
  { code: 'BR', dial: '+55', name: 'Brazil', flag: '🇧🇷' },
  { code: 'MX', dial: '+52', name: 'Mexico', flag: '🇲🇽' },
  { code: 'RU', dial: '+7', name: 'Russia', flag: '🇷🇺' },
]

export function QuoteDialog({ open, onClose, productName }: { open: boolean; onClose: () => void; productName?: string }) {
  const { t } = useLanguage()
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [error, setError] = useState('')
  const [selectedCountry, setSelectedCountry] = useState<CountryCode>(COUNTRY_CODES[0])
  const [countryDropdownOpen, setCountryDropdownOpen] = useState(false)
  const [phoneRaw, setPhoneRaw] = useState('')

  if (!open) return null

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setStatus('loading')
    setError('')
    
    const form = new FormData(event.currentTarget)
    const payload = Object.fromEntries(form)
    
    const fullPhone = `${selectedCountry.dial} ${phoneRaw.trim()}`
    payload.phone = fullPhone
    if (productName) {
      payload.productName = productName
    }

    const response = await fetch('/api/quotes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    const data = await response.json()
    if (!response.ok) {
      setError(data.error || 'Unable to submit.')
      setStatus('error')
      return
    }
    setStatus('success')
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-[#102a43]/55 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="quote-title">
      <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <p className="text-xs font-bold uppercase tracking-[.18em] text-[#f36f2b]">Talk to Raamed</p>
              {productName && (
                <span className="rounded-full bg-orange-100 px-2.5 py-0.5 text-[11px] font-bold text-[#f36f2b]">
                  {productName}
                </span>
              )}
            </div>
            <h2 id="quote-title" className="mt-2 text-3xl font-semibold tracking-tight text-[#102a43]">
              {t('requestQuote')}
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              {productName ? `Inquiring for "${productName}". Share your details below.` : 'Share your details and our team will contact you.'}
            </p>
          </div>
          <button onClick={onClose} aria-label="Close quote form" className="rounded-full p-2 text-slate-500 hover:bg-slate-100">
            <X />
          </button>
        </div>

        {status === 'success' ? (
          <div className="flex flex-col items-center gap-4 py-14 text-center">
            <CheckCircle2 className="size-14 text-[#49a878]" />
            <h3 className="text-2xl font-semibold text-[#102a43]">Enquiry received</h3>
            <p className="max-w-sm text-slate-600">Thank you. Our team will review your request and get back to you shortly.</p>
            <button onClick={onClose} className="rounded-full bg-[#f36f2b] px-6 py-3 font-bold text-white">
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={submit} className="mt-7 grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2 text-sm font-semibold text-[#102a43]">
              Full name *
              <input required name="name" className="rounded-xl border border-slate-300 px-4 py-3 font-normal outline-none focus:border-[#f36f2b]" placeholder="Your name" />
            </label>

            <div className="grid gap-2 text-sm font-semibold text-[#102a43]">
              Phone number *
              <div className="relative flex rounded-xl border border-slate-300 focus-within:border-[#f36f2b]">
                <button
                  type="button"
                  onClick={() => setCountryDropdownOpen(!countryDropdownOpen)}
                  className="flex items-center gap-1 shrink-0 rounded-l-xl border-r border-slate-200 bg-slate-50 px-3 py-3 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                >
                  <span>{selectedCountry.flag}</span>
                  <span>{selectedCountry.dial}</span>
                  <ChevronDown className="size-3.5 text-slate-500" />
                </button>

                <input
                  required
                  type="tel"
                  value={phoneRaw}
                  onChange={(e) => setPhoneRaw(e.target.value)}
                  className="w-full rounded-r-xl px-4 py-3 font-normal outline-none"
                  placeholder="98765 43210"
                />

                {countryDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setCountryDropdownOpen(false)} />
                    <div className="absolute left-0 top-full z-50 mt-1 max-h-56 w-64 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-1.5 shadow-2xl">
                      {COUNTRY_CODES.map((country) => (
                        <button
                          key={`${country.code}-${country.dial}`}
                          type="button"
                          onClick={() => {
                            setSelectedCountry(country)
                            setCountryDropdownOpen(false)
                          }}
                          className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-medium transition ${
                            selectedCountry.code === country.code ? 'bg-orange-50 text-[#f36f2b]' : 'hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <span className="flex items-center gap-2">
                            <span>{country.flag}</span>
                            <span>{country.name}</span>
                          </span>
                          <span className="font-mono text-slate-400">{country.dial}</span>
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            <label className="grid gap-2 text-sm font-semibold text-[#102a43]">
              Email address *
              <input required name="email" type="email" className="rounded-xl border border-slate-300 px-4 py-3 font-normal outline-none focus:border-[#f36f2b]" placeholder="you@company.com" />
            </label>

            <label className="grid gap-2 text-sm font-semibold text-[#102a43]">
              Hospital / organisation
              <input name="organization" className="rounded-xl border border-slate-300 px-4 py-3 font-normal outline-none focus:border-[#f36f2b]" placeholder="Organisation name" />
            </label>

            <label className="grid gap-2 text-sm font-semibold text-[#102a43] sm:col-span-2">
              Address *
              <textarea required name="address" rows={2} className="rounded-xl border border-slate-300 px-4 py-3 font-normal outline-none focus:border-[#f36f2b]" placeholder="Delivery or office address" />
            </label>

            <label className="grid gap-2 text-sm font-semibold text-[#102a43] sm:col-span-2">
              What do you need?
              <textarea name="message" rows={3} className="rounded-xl border border-slate-300 px-4 py-3 font-normal outline-none focus:border-[#f36f2b]" placeholder="Equipment, quantity, or question" />
            </label>

            {error && <p className="sm:col-span-2 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}

            <button disabled={status === 'loading'} className="sm:col-span-2 flex items-center justify-center gap-2 rounded-xl bg-[#f36f2b] px-5 py-3.5 font-bold text-white transition hover:bg-[#dd5b1d] disabled:opacity-60">
              {status === 'loading' && <Loader2 className="size-4 animate-spin" />}
              {t('requestQuote')}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
