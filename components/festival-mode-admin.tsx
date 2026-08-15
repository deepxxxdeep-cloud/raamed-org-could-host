'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { upload } from '@vercel/blob/client'
import { CalendarDays, Film, Loader2, Sparkles, Trash2, Upload } from 'lucide-react'
import { FestivalPreview } from '@/components/festival-decorations'
import {
  DEFAULT_FESTIVAL_SETTINGS,
  FESTIVAL_OPTIONS,
  FESTIVAL_VIDEO_MAX_BYTES,
  FESTIVAL_VIDEO_TYPES,
  isFestivalLive,
  normalizeFestivalSettings,
  todayInIndia,
  type FestivalSettings,
} from '@/lib/festival'

const inputClass = 'rounded-xl border border-[#dce8eb] bg-white p-3 text-sm outline-none focus:border-[#f36f2b]'

export function FestivalModeAdmin() {
  const [form, setForm] = useState<FestivalSettings>(DEFAULT_FESTIVAL_SETTINGS)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetch('/api/admin/festival')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) setForm(normalizeFestivalSettings(data))
      })
      .catch(() => setError('Could not load the saved festival settings.'))
      .finally(() => setLoading(false))
  }, [])

  const update = <K extends keyof FestivalSettings>(key: K, value: FestivalSettings[K]) => {
    setForm((current) => ({ ...current, [key]: value }))
    setMessage('')
  }

  const scheduleState = useMemo(() => {
    if (!form.isEventModeActive) return 'Festival mode is switched off — the public site looks completely normal.'
    const today = todayInIndia()
    if (form.startDate && today < form.startDate) return `Scheduled — decorations start automatically on ${form.startDate}.`
    if (form.endDate && today > form.endDate) return `Finished — the schedule ended on ${form.endDate}, so the site is back to normal.`
    return 'Live right now — visitors can see the festival decorations.'
  }, [form.isEventModeActive, form.startDate, form.endDate])

  async function handleVideoSelect(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    setError('')
    setMessage('')

    if (!FESTIVAL_VIDEO_TYPES.includes(file.type)) {
      setError('Please choose an MP4 or WEBM video file.')
      return
    }
    if (file.size > FESTIVAL_VIDEO_MAX_BYTES) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1)
      setError(`That video is ${sizeMB}MB. Please upload a video under 20MB so the site stays fast.`)
      return
    }

    setUploading(true)
    try {
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '-')
      const blob = await upload(`festival/${Date.now()}-${safeName}`, file, {
        access: 'public',
        handleUploadUrl: '/api/admin/festival-video',
        contentType: file.type,
      })
      setForm((current) => ({ ...current, wishingVideoUrl: blob.url }))
      setMessage('Video uploaded. Remember to press Save to publish it.')
    } catch (uploadError) {
      console.error('[v0] Festival video upload failed', uploadError)
      setError('Video upload failed. Please check your connection and try again.')
    } finally {
      setUploading(false)
    }
  }

  async function save(event: React.FormEvent) {
    event.preventDefault()
    setSaving(true)
    setError('')
    setMessage('')
    try {
      const res = await fetch('/api/admin/festival', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error('save failed')
      const data = await res.json()
      if (data?.settings) setForm(normalizeFestivalSettings(data.settings))
      setMessage(
        isFestivalLive(form)
          ? 'Saved. The festival look is now live on raamed.online.'
          : 'Saved. The public site stays normal until this is switched on or the start date arrives.',
      )
    } catch {
      setError('Could not save the festival settings. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-[#dce8eb] bg-white p-6 text-sm text-[#6f8793]">
        <Loader2 className="size-4 animate-spin" /> Loading festival settings…
      </div>
    )
  }

  return (
    <form
      onSubmit={save}
      className="grid gap-6 text-[#102a43] xl:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] xl:items-start"
    >
      <div className="grid gap-6">
        {/* Master switch */}
        <div className="rounded-2xl border border-[#dce8eb] bg-white p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="min-w-0">
              <h2 className="flex items-center gap-2 text-lg font-semibold">
                <Sparkles className="size-5 text-[#f36f2b]" /> Enable Festival Mode
              </h2>
              <p className="mt-1 text-sm text-[#6f8793]">
                Turns the festive decorations, offer banner and wishing video on for every visitor.
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={form.isEventModeActive}
              aria-label="Enable festival mode"
              onClick={() => update('isEventModeActive', !form.isEventModeActive)}
              className={`relative h-8 w-14 shrink-0 rounded-full transition ${
                form.isEventModeActive ? 'bg-[#f36f2b]' : 'bg-slate-300'
              }`}
            >
              <span
                className={`absolute top-1 size-6 rounded-full bg-white shadow transition-all ${
                  form.isEventModeActive ? 'left-7' : 'left-1'
                }`}
              />
            </button>
          </div>
          <p
            className={`mt-4 rounded-xl px-4 py-3 text-sm font-medium ${
              isFestivalLive(form) ? 'bg-[#e5f4f2] text-[#0c6670]' : 'bg-slate-50 text-[#5a7484]'
            }`}
          >
            {scheduleState}
          </p>
        </div>

        {/* Festival choice */}
        <div className="rounded-2xl border border-[#dce8eb] bg-white p-5 sm:p-6">
          <h2 className="text-lg font-semibold">Which festival?</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2 text-sm font-medium">
              Festival
              <select
                value={form.selectedFestival}
                onChange={(e) => update('selectedFestival', e.target.value as FestivalSettings['selectedFestival'])}
                className={inputClass}
              >
                {FESTIVAL_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            {form.selectedFestival === 'custom' && (
              <label className="grid gap-2 text-sm font-medium">
                Custom festival name
                <input
                  value={form.customFestivalName}
                  onChange={(e) => update('customFestivalName', e.target.value)}
                  className={inputClass}
                  placeholder="e.g. Raamed Foundation Day"
                  maxLength={60}
                />
              </label>
            )}
          </div>
        </div>

        {/* Offer announcement */}
        <div className="rounded-2xl border border-[#dce8eb] bg-white p-5 sm:p-6">
          <h2 className="text-lg font-semibold">Offer announcement</h2>
          <p className="mt-1 text-sm text-[#6f8793]">
            Shown as a colourful banner at the very top of every public page. Leave empty to hide the banner.
          </p>
          <div className="mt-4 grid gap-4">
            <label className="grid gap-2 text-sm font-medium">
              Announcement message
              <textarea
                value={form.offerText}
                onChange={(e) => update('offerText', e.target.value)}
                className={`${inputClass} min-h-24 resize-y`}
                placeholder="Get the best quote & offer now on this product!"
                maxLength={200}
              />
              <span className="text-xs font-normal text-[#6f8793]">{form.offerText.length}/200 characters</span>
            </label>
            <label className="grid gap-2 text-sm font-medium">
              Banner link (optional)
              <input
                value={form.offerLinkUrl}
                onChange={(e) => update('offerLinkUrl', e.target.value)}
                className={inputClass}
                placeholder="/products or https://raamed.online/products"
              />
            </label>
          </div>
        </div>

        {/* Wishing video */}
        <div className="rounded-2xl border border-[#dce8eb] bg-white p-5 sm:p-6">
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <Film className="size-5 text-[#f36f2b]" /> Wishing video
          </h2>
          <p className="mt-1 text-sm text-[#6f8793]">
            MP4 or WEBM, up to 20MB. Keep it short so mobile visitors are not kept waiting.
          </p>

          <input
            ref={fileInputRef}
            type="file"
            accept="video/mp4,video/webm"
            onChange={handleVideoSelect}
            className="hidden"
          />

          {form.wishingVideoUrl ? (
            <div className="mt-4 grid gap-4 sm:grid-cols-[minmax(0,14rem)_1fr] sm:items-center">
              <video
                src={form.wishingVideoUrl}
                className="aspect-video w-full rounded-xl bg-black"
                controls
                playsInline
                preload="metadata"
              />
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="rounded-xl border border-[#dce8eb] px-4 py-2.5 text-sm font-semibold text-[#102a43] disabled:opacity-60"
                >
                  Replace video
                </button>
                <button
                  type="button"
                  onClick={() => update('wishingVideoUrl', '')}
                  className="flex items-center gap-2 rounded-xl border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600"
                >
                  <Trash2 className="size-4" /> Remove
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[#dce8eb] px-4 py-8 text-sm font-semibold text-[#5a7484] transition hover:border-[#f36f2b] hover:text-[#f36f2b] disabled:opacity-60"
            >
              {uploading ? (
                <>
                  <Loader2 className="size-4 animate-spin" /> Uploading video…
                </>
              ) : (
                <>
                  <Upload className="size-4" /> Upload wishing video
                </>
              )}
            </button>
          )}

          <fieldset className="mt-5 grid gap-3">
            <legend className="text-sm font-medium">How should the video appear?</legend>
            {(
              [
                ['popup', 'Show as popup', 'Opens once per visit, with a close button.'],
                ['section', 'Show in homepage section', 'Embedded on the homepage, no interruption.'],
              ] as const
            ).map(([value, label, hint]) => (
              <label
                key={value}
                className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 text-sm transition ${
                  form.videoDisplayMode === value
                    ? 'border-[#f36f2b] bg-[#fff5ef]'
                    : 'border-[#dce8eb] hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="videoDisplayMode"
                  value={value}
                  checked={form.videoDisplayMode === value}
                  onChange={() => update('videoDisplayMode', value)}
                  className="mt-0.5 accent-[#f36f2b]"
                />
                <span>
                  <span className="block font-semibold">{label}</span>
                  <span className="block text-xs text-[#6f8793]">{hint}</span>
                </span>
              </label>
            ))}
          </fieldset>
        </div>

        {/* Scheduling */}
        <div className="rounded-2xl border border-[#dce8eb] bg-white p-5 sm:p-6">
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <CalendarDays className="size-5 text-[#f36f2b]" /> Auto schedule (optional)
          </h2>
          <p className="mt-1 text-sm text-[#6f8793]">
            Set the dates and the decorations switch themselves on and off. Leave both empty to control it only with
            the toggle above.
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2 text-sm font-medium">
              Start date
              <input
                type="date"
                value={form.startDate}
                onChange={(e) => update('startDate', e.target.value)}
                className={inputClass}
              />
            </label>
            <label className="grid gap-2 text-sm font-medium">
              End date
              <input
                type="date"
                value={form.endDate}
                min={form.startDate || undefined}
                onChange={(e) => update('endDate', e.target.value)}
                className={inputClass}
              />
            </label>
          </div>
          {form.startDate && form.endDate && form.endDate < form.startDate && (
            <p className="mt-3 text-sm font-semibold text-red-600">The end date cannot be before the start date.</p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <button
            type="submit"
            disabled={saving || uploading}
            className="flex items-center gap-2 rounded-xl bg-[#f36f2b] px-6 py-3 font-semibold text-white transition hover:bg-[#dd5b1d] disabled:opacity-60"
          >
            {saving && <Loader2 className="size-4 animate-spin" />}
            {saving ? 'Saving…' : 'Save festival settings'}
          </button>
          {message && <p className="text-sm font-semibold text-[#0c6670]">{message}</p>}
          {error && <p className="text-sm font-semibold text-red-600">{error}</p>}
        </div>
      </div>

      {/* Live preview */}
      <div className="rounded-2xl border border-[#dce8eb] bg-white p-5 sm:p-6 xl:sticky xl:top-6">
        <h2 className="text-lg font-semibold">Live preview</h2>
        <p className="mt-1 text-sm text-[#6f8793]">A miniature of the public homepage with your current choices.</p>
        <div className="mt-4">
          <FestivalPreview settings={form} />
        </div>
        {form.updatedAt && (
          <p className="mt-4 text-xs text-[#6f8793]">
            Last saved {new Date(form.updatedAt).toLocaleString('en-IN')}
          </p>
        )}
        <a
          href="/"
          target="_blank"
          rel="noreferrer"
          className="mt-4 inline-block text-sm font-semibold text-[#f36f2b]"
        >
          Open the live website ↗
        </a>
      </div>
    </form>
  )
}
