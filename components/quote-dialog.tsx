'use client'

import { FormEvent, useState } from 'react'
import { CheckCircle2, Loader2, X } from 'lucide-react'

export function QuoteDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [error, setError] = useState('')
  if (!open) return null
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setStatus('loading'); setError('')
    const form = new FormData(event.currentTarget)
    const response = await fetch('/api/quotes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(Object.fromEntries(form)) })
    const data = await response.json()
    if (!response.ok) { setError(data.error || 'Unable to submit.'); setStatus('error'); return }
    setStatus('success')
  }
  return <div className="fixed inset-0 z-50 grid place-items-center bg-[#102a43]/55 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="quote-title">
    <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl sm:p-8">
      <div className="flex items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[.18em] text-[#f36f2b]">Talk to Raamed</p><h2 id="quote-title" className="mt-2 text-3xl font-semibold tracking-tight text-[#102a43]">Request a quotation</h2><p className="mt-2 text-sm text-slate-500">Share your details and our team will contact you.</p></div><button onClick={onClose} aria-label="Close quote form" className="rounded-full p-2 text-slate-500 hover:bg-slate-100"><X /></button></div>
      {status === 'success' ? <div className="flex flex-col items-center gap-4 py-14 text-center"><CheckCircle2 className="size-14 text-[#49a878]" /><h3 className="text-2xl font-semibold text-[#102a43]">Enquiry received</h3><p className="max-w-sm text-slate-600">Thank you. Our team will review your request and get back to you shortly.</p><button onClick={onClose} className="rounded-full bg-[#f36f2b] px-6 py-3 font-bold text-white">Done</button></div> : <form onSubmit={submit} className="mt-7 grid gap-4 sm:grid-cols-2"><label className="grid gap-2 text-sm font-semibold text-[#102a43]">Full name *<input required name="name" className="rounded-xl border border-slate-300 px-4 py-3 font-normal outline-none focus:border-[#f36f2b]" placeholder="Your name" /></label><label className="grid gap-2 text-sm font-semibold text-[#102a43]">Phone number *<input required name="phone" type="tel" className="rounded-xl border border-slate-300 px-4 py-3 font-normal outline-none focus:border-[#f36f2b]" placeholder="+91 ..." /></label><label className="grid gap-2 text-sm font-semibold text-[#102a43]">Email address *<input required name="email" type="email" className="rounded-xl border border-slate-300 px-4 py-3 font-normal outline-none focus:border-[#f36f2b]" placeholder="you@company.com" /></label><label className="grid gap-2 text-sm font-semibold text-[#102a43]">Hospital / organisation<input name="organization" className="rounded-xl border border-slate-300 px-4 py-3 font-normal outline-none focus:border-[#f36f2b]" placeholder="Organisation name" /></label><label className="grid gap-2 text-sm font-semibold text-[#102a43] sm:col-span-2">Address *<textarea required name="address" rows={2} className="rounded-xl border border-slate-300 px-4 py-3 font-normal outline-none focus:border-[#f36f2b]" placeholder="Delivery or office address" /></label><label className="grid gap-2 text-sm font-semibold text-[#102a43] sm:col-span-2">What do you need?<textarea name="message" rows={3} className="rounded-xl border border-slate-300 px-4 py-3 font-normal outline-none focus:border-[#f36f2b]" placeholder="Equipment, quantity, or question" /></label>{error && <p className="sm:col-span-2 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}<button disabled={status === 'loading'} className="sm:col-span-2 flex items-center justify-center gap-2 rounded-xl bg-[#f36f2b] px-5 py-3.5 font-bold text-white transition hover:bg-[#dd5b1d] disabled:opacity-60">{status === 'loading' && <Loader2 className="size-4 animate-spin" />}Send enquiry</button></form>}
    </div>
  </div>
}
