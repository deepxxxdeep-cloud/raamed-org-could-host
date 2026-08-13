'use client'

import { FormEvent, useState } from 'react'
import { ArrowRight, LockKeyhole, Stethoscope } from 'lucide-react'

export default function AdminLogin() {
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setPending(true)
    const form = new FormData(event.currentTarget)
    const response = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: form.get('email'), password: form.get('password') }),
    })
    const result = await response.json().catch(() => ({}))
    if (!response.ok) {
      setError(result.error || 'Unable to sign in.')
      setPending(false)
      return
    }
    window.location.assign('/admin')
  }

  return <main className="grid min-h-screen place-items-center bg-[#f6f9fa] px-5 text-[#102a43]"><div className="w-full max-w-md rounded-3xl border border-[#dce8eb] bg-white p-8 shadow-xl"><a href="/" className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-xl bg-[#f36f2b] text-white"><Stethoscope /></span><span><strong className="block">Raamed</strong><small className="text-xs text-[#6f8793]">Admin workspace</small></span></a><div className="mt-12"><div className="grid size-12 place-items-center rounded-2xl bg-[#fff0e8] text-[#f36f2b]"><LockKeyhole /></div><h1 className="mt-5 text-3xl font-semibold tracking-[-.03em]">Welcome back.</h1><p className="mt-2 text-sm leading-6 text-[#6f8793]">Sign in to manage equipment, enquiries, and your care catalogue.</p></div><form onSubmit={submit} className="mt-8 flex flex-col gap-4"><label className="flex flex-col gap-2 text-sm font-medium">Email address<input required name="email" type="email" placeholder="admin@raamed.online" className="rounded-xl border border-[#dce8eb] px-4 py-3 outline-none focus:border-[#f36f2b]" /></label><label className="flex flex-col gap-2 text-sm font-medium">Password<input required name="password" type="password" placeholder="Enter your password" className="rounded-xl border border-[#dce8eb] px-4 py-3 outline-none focus:border-[#f36f2b]" /></label>{error && <p role="alert" className="text-sm text-red-600">{error}</p>}<button disabled={pending} className="mt-2 rounded-full bg-[#f36f2b] px-5 py-3.5 font-semibold text-white hover:bg-[#dd5b1d] disabled:cursor-wait disabled:opacity-70">{pending ? 'Signing in…' : 'Sign in'} {!pending && <ArrowRight className="ml-2 inline size-4" />}</button></form><p className="mt-6 text-center text-xs leading-5 text-[#6f8793]">Admin access is protected by encrypted project environment variables.</p></div></main>
}
