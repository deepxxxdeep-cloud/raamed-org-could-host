'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { X } from 'lucide-react'
import {
  DEFAULT_FESTIVAL_SETTINGS,
  FESTIVAL_THEMES,
  festivalDisplayName,
  festivalGreeting,
  isFestivalLive,
  normalizeFestivalSettings,
  type FestivalSettings,
} from '@/lib/festival'

/**
 * Every decoration below is pure CSS/SVG so nothing extra is downloaded and the
 * main thread stays free. Layers are purely decorative: they never receive
 * pointer events, and particle counts drop on small screens.
 */
const FESTIVAL_CSS = `
.rf-layer{position:fixed;inset:0;pointer-events:none;overflow:hidden;--rf-travel:115vh;--rf-lift:-70vh}
.rf-layer--back{z-index:30}
.rf-layer--front{z-index:45}
.rf-contained .rf-layer{position:absolute;--rf-travel:300px;--rf-lift:-260px}
.rf-contained .rf-layer--back{z-index:1}
.rf-contained .rf-layer--front{z-index:2}
.rf-particle{position:absolute;top:-12%;border-radius:9999px;opacity:0}

/* Holi */
.rf-gulal{width:var(--rf-size);height:var(--rf-size);left:var(--rf-x);background:var(--rf-color);filter:blur(.5px);animation:rf-drift var(--rf-dur) linear var(--rf-delay) infinite}
.rf-blob{position:absolute;width:38vw;max-width:420px;aspect-ratio:1;border-radius:9999px;filter:blur(70px);opacity:.28;animation:rf-pulse 9s ease-in-out infinite}
.rf-contained .rf-blob{width:130px;filter:blur(38px);opacity:.35}

/* Christmas + custom confetti */
/* Ringed rather than plain white: the site background is near-white, so pure
   white flakes would be invisible. */
.rf-snow{width:var(--rf-size);height:var(--rf-size);left:var(--rf-x);background:var(--rf-color,rgba(255,255,255,.95));box-shadow:0 0 0 1px var(--rf-ring,rgba(120,165,215,.55)),0 0 8px var(--rf-ring,rgba(120,165,215,.5));animation:rf-fall var(--rf-dur) linear var(--rf-delay) infinite}
.rf-confetti{width:var(--rf-size);height:calc(var(--rf-size) * 1.8);left:var(--rf-x);border-radius:2px;background:var(--rf-color);animation:rf-fall-spin var(--rf-dur) linear var(--rf-delay) infinite}

/* Diwali */
.rf-spark{width:var(--rf-size);height:var(--rf-size);left:var(--rf-x);top:auto;bottom:-6%;background:var(--rf-color);box-shadow:0 0 8px var(--rf-color);animation:rf-rise var(--rf-dur) ease-out var(--rf-delay) infinite}
.rf-diya{position:absolute;bottom:12px;width:54px;animation:rf-glow 3.2s ease-in-out infinite}
.rf-flame{transform-origin:50% 100%;animation:rf-flicker 1.1s ease-in-out infinite}

/* String lights (Diwali + Christmas) */
.rf-lights{position:absolute;top:0;left:0;right:0;display:flex;justify-content:space-around;align-items:flex-start}
.rf-bulb{width:9px;height:13px;border-radius:0 0 9999px 9999px;background:var(--rf-color);box-shadow:0 0 10px var(--rf-color);animation:rf-twinkle 2.4s ease-in-out var(--rf-delay) infinite}
.rf-wire{position:absolute;top:0;left:0;right:0;height:3px;background:linear-gradient(90deg,rgba(15,23,42,.35),rgba(15,23,42,.15))}

/* New Year fireworks */
.rf-burst{position:absolute;width:4px;height:4px}
.rf-burst i{position:absolute;left:0;top:0;width:4px;height:4px;border-radius:9999px;background:var(--rf-color);box-shadow:0 0 8px var(--rf-color);animation:rf-explode var(--rf-dur) ease-out var(--rf-delay) infinite}

/* Tricolor (Independence / Republic Day) */
.rf-tricolor{position:absolute;left:0;right:0;height:6px;background:linear-gradient(90deg,#ff9933 0 33.33%,#ffffff 33.33% 66.66%,#138808 66.66% 100%)}
.rf-ribbon{position:absolute;width:120px;height:8px;border-radius:9999px;background:linear-gradient(90deg,#ff9933,#ffffff,#138808);opacity:.75;animation:rf-wave 6s ease-in-out var(--rf-delay) infinite}
.rf-chakra{position:absolute;animation:rf-spin 24s linear infinite}

@keyframes rf-drift{0%{opacity:0;transform:translate3d(0,0,0) scale(.7)}10%{opacity:.85}90%{opacity:.5}100%{opacity:0;transform:translate3d(var(--rf-shift),var(--rf-travel),0) scale(1.15)}}
@keyframes rf-fall{0%{opacity:0;transform:translate3d(0,0,0)}10%{opacity:.9}100%{opacity:.35;transform:translate3d(var(--rf-shift),var(--rf-travel),0)}}
@keyframes rf-fall-spin{0%{opacity:0;transform:translate3d(0,0,0) rotate(0)}10%{opacity:1}100%{opacity:.4;transform:translate3d(var(--rf-shift),var(--rf-travel),0) rotate(540deg)}}
@keyframes rf-rise{0%{opacity:0;transform:translate3d(0,0,0) scale(.5)}20%{opacity:1}100%{opacity:0;transform:translate3d(var(--rf-shift),var(--rf-lift),0) scale(1)}}
@keyframes rf-pulse{0%,100%{transform:scale(1);opacity:.22}50%{transform:scale(1.18);opacity:.34}}
@keyframes rf-twinkle{0%,100%{opacity:1}50%{opacity:.35}}
@keyframes rf-flicker{0%,100%{transform:scaleY(1) rotate(-2deg)}50%{transform:scaleY(1.18) rotate(2deg)}}
@keyframes rf-glow{0%,100%{filter:drop-shadow(0 0 6px rgba(240,166,8,.55))}50%{filter:drop-shadow(0 0 14px rgba(240,166,8,.9))}}
@keyframes rf-explode{0%{opacity:0;transform:translate3d(0,0,0) scale(.4)}12%{opacity:1}100%{opacity:0;transform:translate3d(var(--rf-dx),var(--rf-dy),0) scale(1)}}
@keyframes rf-wave{0%,100%{transform:translateY(0) rotate(-4deg)}50%{transform:translateY(14px) rotate(4deg)}}
@keyframes rf-spin{to{transform:rotate(360deg)}}

@media (max-width:640px){.rf-lite{display:none}.rf-blob{width:60vw;filter:blur(50px)}.rf-diya{width:42px}}
@media (prefers-reduced-motion:reduce){.rf-layer *{animation:none !important}.rf-particle{opacity:.5}}
@media print{.rf-layer,.rf-banner,.rf-video-section{display:none !important}}
`

/**
 * Deterministic pseudo-random in [0, 1). Uses integer-only arithmetic (and a
 * fixed rounding) rather than Math.sin, whose last bits differ between Node and
 * browser engines and would produce React hydration mismatches.
 */
function seeded(index: number, salt: number) {
  let x = (index + 1) * 1836311903 + (salt + 1) * 2654435761
  x = (x ^ (x >>> 13)) >>> 0
  x = (x * 1664525 + 1013904223) >>> 0
  return Math.round((x % 100000) / 100) / 1000
}

type ParticleStyle = React.CSSProperties & Record<`--rf-${string}`, string>

function particleStyle(values: Record<string, string>) {
  return values as unknown as ParticleStyle
}

const HOLI_COLORS = ['#e5195f', '#8a3ffc', '#f7a325', '#12a150', '#1f7ae0', '#ff5fa2']
const DIWALI_COLORS = ['#f0a608', '#ff7a18', '#ffd66b', '#ff4d4d']
const CONFETTI_COLORS = ['#f36f2b', '#0c6670', '#f0a608', '#e5195f', '#12a150']
const NEW_YEAR_COLORS = ['#ffd166', '#ff6b6b', '#8ecae6', '#fff1a8']

function StringLights({ color }: { color: 'warm' | 'christmas' }) {
  const palette = color === 'warm' ? DIWALI_COLORS : ['#ff4d4d', '#ffffff', '#2fbf71', '#ffd166']
  return (
    <div className="rf-lights">
      <span className="rf-wire" />
      {Array.from({ length: 22 }).map((_, i) => (
        <span
          key={i}
          className={`rf-bulb${i % 2 ? ' rf-lite' : ''}`}
          style={particleStyle({
            '--rf-color': palette[i % palette.length],
            '--rf-delay': `${(i % 6) * 0.28}s`,
          })}
        />
      ))}
    </div>
  )
}

function Diya({ className }: { className: string }) {
  return (
    <svg className={`rf-diya ${className}`} viewBox="0 0 64 48" fill="none" aria-hidden="true">
      <path className="rf-flame" d="M32 6c4 6 6.5 9 6.5 13a6.5 6.5 0 1 1-13 0C25.5 15 28 12 32 6Z" fill="#ffb703" />
      <path className="rf-flame" d="M32 13c2 3 3.2 4.6 3.2 6.6a3.2 3.2 0 1 1-6.4 0c0-2 1.2-3.6 3.2-6.6Z" fill="#fff3bf" />
      <path d="M6 30h52c0 8-11 14-26 14S6 38 6 30Z" fill="#b5551f" />
      <path d="M6 30h52c0 2.4-1 4.6-2.8 6.5H8.8C7 34.6 6 32.4 6 30Z" fill="#8c3d12" />
      <ellipse cx="32" cy="30" rx="14" ry="4" fill="#e08b3a" />
    </svg>
  )
}

function AshokaChakra({ className, size }: { className: string; size: number }) {
  return (
    <svg className={`rf-chakra ${className}`} width={size} height={size} viewBox="0 0 100 100" aria-hidden="true">
      <circle cx="50" cy="50" r="44" fill="none" stroke="#000080" strokeWidth="3" opacity=".5" />
      <circle cx="50" cy="50" r="7" fill="#000080" opacity=".5" />
      {Array.from({ length: 24 }).map((_, i) => (
        <line
          key={i}
          x1="50"
          y1="50"
          x2="50"
          y2="8"
          stroke="#000080"
          strokeWidth="2"
          opacity=".4"
          transform={`rotate(${i * 15} 50 50)`}
        />
      ))}
    </svg>
  )
}

/**
 * The animated layers for a festival. `contained` renders them inside a
 * positioned parent (used by the admin live preview) instead of the viewport.
 */
export function FestivalOverlay({ settings }: { settings: FestivalSettings }) {
  const festival = settings.selectedFestival

  if (festival === 'holi') {
    return (
      <>
        <div className="rf-layer rf-layer--back">
          <span className="rf-blob" style={{ left: '-8%', top: '-6%', background: '#e5195f' }} />
          <span className="rf-blob rf-lite" style={{ right: '-10%', top: '4%', background: '#8a3ffc' }} />
          <span className="rf-blob rf-lite" style={{ left: '35%', top: '-14%', background: '#f7a325' }} />
          {Array.from({ length: 16 }).map((_, i) => (
            <span
              key={i}
              className={`rf-particle rf-gulal${i % 2 ? ' rf-lite' : ''}`}
              style={particleStyle({
                '--rf-x': `${seeded(i, 1) * 100}%`,
                '--rf-size': `${6 + seeded(i, 2) * 12}px`,
                '--rf-color': HOLI_COLORS[i % HOLI_COLORS.length],
                '--rf-dur': `${9 + seeded(i, 3) * 8}s`,
                '--rf-delay': `${seeded(i, 4) * 9}s`,
                '--rf-shift': `${(seeded(i, 5) - 0.5) * 160}px`,
              })}
            />
          ))}
        </div>
        <div className="rf-layer rf-layer--front">
          <span className="rf-tricolor" style={{ top: 0, background: 'linear-gradient(90deg,#e5195f,#f7a325,#12a150,#8a3ffc,#1f7ae0)' }} />
        </div>
      </>
    )
  }

  if (festival === 'diwali') {
    return (
      <>
        <div className="rf-layer rf-layer--back">
          {Array.from({ length: 18 }).map((_, i) => (
            <span
              key={i}
              className={`rf-particle rf-spark${i % 2 ? ' rf-lite' : ''}`}
              style={particleStyle({
                '--rf-x': `${seeded(i, 6) * 100}%`,
                '--rf-size': `${3 + seeded(i, 7) * 4}px`,
                '--rf-color': DIWALI_COLORS[i % DIWALI_COLORS.length],
                '--rf-dur': `${5 + seeded(i, 8) * 5}s`,
                '--rf-delay': `${seeded(i, 9) * 7}s`,
                '--rf-shift': `${(seeded(i, 10) - 0.5) * 120}px`,
              })}
            />
          ))}
          <Diya className="left-3 sm:left-8" />
          <Diya className="right-3 sm:right-8 rf-lite" />
        </div>
        <div className="rf-layer rf-layer--front">
          <StringLights color="warm" />
        </div>
      </>
    )
  }

  if (festival === 'christmas') {
    return (
      <>
        <div className="rf-layer rf-layer--back">
          {Array.from({ length: 22 }).map((_, i) => (
            <span
              key={i}
              className={`rf-particle rf-snow${i % 2 ? ' rf-lite' : ''}`}
              style={particleStyle({
                '--rf-x': `${seeded(i, 11) * 100}%`,
                '--rf-size': `${3 + seeded(i, 12) * 6}px`,
                '--rf-dur': `${10 + seeded(i, 13) * 10}s`,
                '--rf-delay': `${seeded(i, 14) * 10}s`,
                '--rf-shift': `${(seeded(i, 15) - 0.5) * 140}px`,
              })}
            />
          ))}
          <span className="rf-blob" style={{ left: '-10%', bottom: '-20%', background: '#2fbf71' }} />
          <span className="rf-blob rf-lite" style={{ right: '-12%', top: '-10%', background: '#b4232b' }} />
        </div>
        <div className="rf-layer rf-layer--front">
          <StringLights color="christmas" />
        </div>
      </>
    )
  }

  if (festival === 'new_year') {
    return (
      <>
        <div className="rf-layer rf-layer--back">
          {Array.from({ length: 5 }).map((_, burst) => (
            <span
              key={burst}
              className={`rf-burst${burst > 2 ? ' rf-lite' : ''}`}
              style={{ left: `${12 + seeded(burst, 16) * 74}%`, top: `${10 + seeded(burst, 17) * 45}%` }}
            >
              {Array.from({ length: 12 }).map((_, i) => {
                const angle = (i / 12) * Math.PI * 2
                const radius = 60 + seeded(burst, 18) * 50
                // Rounded so the trigonometry cannot differ between Node and the browser.
                const dx = Math.round(Math.cos(angle) * radius * 100) / 100
                const dy = Math.round(Math.sin(angle) * radius * 100) / 100
                return (
                  <i
                    key={i}
                    style={particleStyle({
                      '--rf-color': NEW_YEAR_COLORS[burst % NEW_YEAR_COLORS.length],
                      '--rf-dx': `${dx}px`,
                      '--rf-dy': `${dy}px`,
                      '--rf-dur': '2.4s',
                      '--rf-delay': `${burst * 1.1}s`,
                    })}
                  />
                )
              })}
            </span>
          ))}
          {Array.from({ length: 14 }).map((_, i) => (
            <span
              key={`t${i}`}
              className={`rf-particle rf-snow${i % 2 ? ' rf-lite' : ''}`}
              style={particleStyle({
                '--rf-color': '#e0a90b',
                '--rf-ring': 'rgba(212,160,23,.55)',
                '--rf-x': `${seeded(i, 19) * 100}%`,
                '--rf-size': `${2 + seeded(i, 20) * 4}px`,
                '--rf-dur': `${8 + seeded(i, 21) * 7}s`,
                '--rf-delay': `${seeded(i, 22) * 8}s`,
                '--rf-shift': `${(seeded(i, 23) - 0.5) * 100}px`,
              })}
            />
          ))}
        </div>
        <div className="rf-layer rf-layer--front">
          <span className="rf-tricolor" style={{ top: 0, background: 'linear-gradient(90deg,#d4a017,#fff6d8,#d4a017)' }} />
        </div>
      </>
    )
  }

  if (festival === 'independence_day' || festival === 'republic_day') {
    return (
      <>
        <div className="rf-layer rf-layer--back">
          {Array.from({ length: 4 }).map((_, i) => (
            <span
              key={i}
              className={`rf-ribbon${i % 2 ? ' rf-lite' : ''}`}
              style={particleStyle({
                left: `${seeded(i, 24) * 80}%`,
                top: `${12 + seeded(i, 25) * 60}%`,
                '--rf-delay': `${i * 0.9}s`,
              } as unknown as Record<string, string>)}
            />
          ))}
          {festival === 'republic_day' && (
            <AshokaChakra className="right-4 top-24 opacity-25 sm:right-12" size={110} />
          )}
          <span className="rf-blob" style={{ left: '-10%', top: '-8%', background: '#ff9933' }} />
          <span className="rf-blob rf-lite" style={{ right: '-10%', bottom: '-16%', background: '#138808' }} />
        </div>
        <div className="rf-layer rf-layer--front">
          <span className="rf-tricolor" style={{ top: 0 }} />
          <span className="rf-tricolor" style={{ bottom: 0 }} />
        </div>
      </>
    )
  }

  return (
    <>
      <div className="rf-layer rf-layer--back">
        {Array.from({ length: 20 }).map((_, i) => (
          <span
            key={i}
            className={`rf-particle rf-confetti${i % 2 ? ' rf-lite' : ''}`}
            style={particleStyle({
              '--rf-x': `${seeded(i, 26) * 100}%`,
              '--rf-size': `${4 + seeded(i, 27) * 5}px`,
              '--rf-color': CONFETTI_COLORS[i % CONFETTI_COLORS.length],
              '--rf-dur': `${8 + seeded(i, 28) * 8}s`,
              '--rf-delay': `${seeded(i, 29) * 8}s`,
              '--rf-shift': `${(seeded(i, 30) - 0.5) * 150}px`,
            })}
          />
        ))}
      </div>
      <div className="rf-layer rf-layer--front">
        <span className="rf-tricolor" style={{ top: 0, background: 'linear-gradient(90deg,#0c6670,#f36f2b,#f0a608)' }} />
      </div>
    </>
  )
}

function FestivalStyles() {
  return <style>{FESTIVAL_CSS}</style>
}

function OfferBanner({
  settings,
  onDismiss,
}: {
  settings: FestivalSettings
  onDismiss: () => void
}) {
  const theme = FESTIVAL_THEMES[settings.selectedFestival]
  const content = (
    <>
      <span className="rounded-full bg-white/25 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider">
        {festivalDisplayName(settings)}
      </span>
      <span className="text-sm font-semibold sm:text-[15px]">{settings.offerText}</span>
      {settings.offerLinkUrl && (
        <span className="hidden rounded-full bg-white/25 px-3 py-1 text-xs font-bold sm:inline">
          View offer
        </span>
      )}
    </>
  )

  return (
    <div
      className="rf-banner relative z-[46] w-full"
      style={{
        background: `linear-gradient(90deg, ${theme.bannerFrom}, ${theme.bannerVia}, ${theme.bannerTo})`,
        color: theme.bannerText,
      }}
    >
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-2.5 pr-12 sm:px-8">
        {settings.offerLinkUrl ? (
          <a
            href={settings.offerLinkUrl}
            className="flex flex-1 flex-wrap items-center gap-2 sm:gap-3"
            target={settings.offerLinkUrl.startsWith('http') ? '_blank' : undefined}
            rel="noreferrer"
          >
            {content}
          </a>
        ) : (
          <div className="flex flex-1 flex-wrap items-center gap-2 sm:gap-3">{content}</div>
        )}
      </div>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss festival offer"
        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1.5 transition hover:bg-white/25"
        style={{ color: theme.bannerText }}
      >
        <X className="size-4" />
      </button>
    </div>
  )
}

function WishingVideoModal({
  settings,
  onClose,
}: {
  settings: FestivalSettings
  onClose: () => void
}) {
  const theme = FESTIVAL_THEMES[settings.selectedFestival]
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/70 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div
          className="px-5 py-3 pr-12 text-sm font-bold"
          style={{
            background: `linear-gradient(90deg, ${theme.bannerFrom}, ${theme.bannerTo})`,
            color: theme.bannerText,
          }}
        >
          {festivalGreeting(settings)} from Raamed
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close wishing video"
          className="absolute right-3 top-2.5 rounded-full bg-white/25 p-1.5 text-white transition hover:bg-white/40"
        >
          <X className="size-4" />
        </button>
        <video
          src={settings.wishingVideoUrl}
          className="aspect-video w-full bg-black"
          controls
          autoPlay
          muted
          playsInline
          preload="metadata"
        />
        {settings.offerText && (
          <p className="px-5 py-4 text-sm font-semibold text-[#102a43]">{settings.offerText}</p>
        )}
      </div>
    </div>
  )
}

function WishingVideoSection({
  settings,
  onDismiss,
}: {
  settings: FestivalSettings
  onDismiss: () => void
}) {
  const theme = FESTIVAL_THEMES[settings.selectedFestival]
  return (
    <section className="rf-video-section relative z-[36] bg-[#f7fafb] px-5 py-8 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:grid-cols-[1.1fr_1fr] md:items-center md:p-7">
        <div>
          <p
            className="inline-block rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider"
            style={{
              background: `linear-gradient(90deg, ${theme.bannerFrom}, ${theme.bannerTo})`,
              color: theme.bannerText,
            }}
          >
            {festivalDisplayName(settings)}
          </p>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-[#102a43] sm:text-3xl">
            {festivalGreeting(settings)} from Raamed
          </h2>
          {settings.offerText && (
            <p className="mt-3 max-w-md text-sm leading-7 text-slate-600">{settings.offerText}</p>
          )}
          {settings.offerLinkUrl && (
            <a
              href={settings.offerLinkUrl}
              target={settings.offerLinkUrl.startsWith('http') ? '_blank' : undefined}
              rel="noreferrer"
              className="mt-5 inline-block rounded-full px-5 py-3 text-sm font-bold text-white"
              style={{ background: theme.accent }}
            >
              View this offer
            </a>
          )}
        </div>
        <div className="relative">
          <video
            src={settings.wishingVideoUrl}
            className="aspect-video w-full rounded-2xl bg-black"
            controls
            playsInline
            preload="metadata"
          />
          <button
            type="button"
            onClick={onDismiss}
            aria-label="Hide wishing video"
            className="absolute -right-2 -top-2 rounded-full bg-white p-1.5 text-slate-600 shadow-md transition hover:text-slate-900"
          >
            <X className="size-4" />
          </button>
        </div>
      </div>
    </section>
  )
}

/**
 * Scaled, self-contained rendering of the public homepage used by the admin
 * live preview. Shares the exact overlay code the real site runs.
 */
export function FestivalPreview({ settings }: { settings: FestivalSettings }) {
  const theme = FESTIVAL_THEMES[settings.selectedFestival]
  // Matches the public site exactly, schedule included.
  const live = isFestivalLive(settings)

  return (
    <div className="rf-contained relative h-64 w-full overflow-hidden rounded-2xl border border-[#dce8eb] bg-[#f7fafb]">
      <FestivalStyles />
      {live && <FestivalOverlay settings={settings} />}
      {live && settings.offerText && (
        <div
          className="relative z-[3] px-3 py-1.5 text-[10px] font-semibold"
          style={{
            background: `linear-gradient(90deg, ${theme.bannerFrom}, ${theme.bannerVia}, ${theme.bannerTo})`,
            color: theme.bannerText,
          }}
        >
          {settings.offerText}
        </div>
      )}
      <div className="relative z-[3] flex items-center justify-between border-b border-slate-200 bg-white/95 px-3 py-2">
        <div className="h-5 w-16 rounded bg-[#102a43]/85" />
        <div className="flex gap-2">
          <div className="h-2 w-8 rounded bg-slate-300" />
          <div className="h-2 w-8 rounded bg-slate-300" />
          <div className="h-2 w-8 rounded bg-slate-300" />
        </div>
        <div className="h-4 w-12 rounded-full bg-[#f36f2b]" />
      </div>
      <div className="relative z-[3] px-4 py-5">
        <div className="h-2.5 w-24 rounded bg-[#f36f2b]/70" />
        <div className="mt-2.5 h-4 w-3/4 rounded bg-[#102a43]/80" />
        <div className="mt-2 h-3 w-2/3 rounded bg-slate-300" />
        <div className="mt-4 flex gap-2">
          <div className="h-5 w-20 rounded-full bg-[#f36f2b]" />
          <div className="h-5 w-20 rounded-full border border-slate-300 bg-white" />
        </div>
        {live && settings.wishingVideoUrl && (
          <div className="mt-4 flex h-12 items-center justify-center rounded-lg bg-slate-900 text-[10px] font-semibold text-white">
            {settings.videoDisplayMode === 'popup' ? 'Wishing video popup' : 'Wishing video section'}
          </div>
        )}
      </div>
      {!live && (
        <div className="absolute inset-x-0 bottom-0 z-[4] bg-slate-900/80 px-3 py-1.5 text-center text-[10px] font-semibold text-white">
          {settings.isEventModeActive
            ? 'Outside the scheduled dates — the site looks completely normal'
            : 'Festival mode is OFF — the site looks completely normal'}
        </div>
      )}
    </div>
  )
}

/** One shared request per page load, however many festival pieces are mounted. */
let settingsRequest: Promise<FestivalSettings> | null = null

function loadFestivalSettings() {
  if (!settingsRequest) {
    settingsRequest = fetch('/api/festival')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => (data ? normalizeFestivalSettings(data) : DEFAULT_FESTIVAL_SETTINGS))
      .catch(() => DEFAULT_FESTIVAL_SETTINGS)
  }
  return settingsRequest
}

function remember(key: string) {
  try {
    sessionStorage.setItem(key, '1')
  } catch {
    // Private browsing: the dismissal just lasts for this page view.
  }
}

function wasDismissed(key: string) {
  try {
    return sessionStorage.getItem(key) === '1'
  } catch {
    return false
  }
}

/** Loads the live settings, or keeps the inactive defaults. */
function useFestivalSettings() {
  const [settings, setSettings] = useState<FestivalSettings>(DEFAULT_FESTIVAL_SETTINGS)
  useEffect(() => {
    let cancelled = false
    loadFestivalSettings().then((next) => {
      if (!cancelled && isFestivalLive(next)) setSettings(next)
    })
    return () => {
      cancelled = true
    }
  }, [])
  return settings
}

/**
 * The wishing video embedded in the homepage, for admins who pick "Show in
 * homepage section" instead of the popup. Mounted inside the homepage itself so
 * it sits within the normal page flow, below the header.
 */
export function FestivalHomepageVideo() {
  const settings = useFestivalSettings()
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    if (settings.wishingVideoUrl) setDismissed(wasDismissed(`rf-video:${settings.wishingVideoUrl}`))
  }, [settings.wishingVideoUrl])

  if (!isFestivalLive(settings)) return null
  if (!settings.wishingVideoUrl || settings.videoDisplayMode !== 'section' || dismissed) return null

  return (
    <>
      <FestivalStyles />
      <WishingVideoSection
        settings={settings}
        onDismiss={() => {
          setDismissed(true)
          remember(`rf-video:${settings.wishingVideoUrl}`)
        }}
      />
    </>
  )
}

/**
 * Site-wide entry point. Mounted once in the root layout; renders nothing at
 * all when festival mode is off or outside its scheduled window.
 */
export function FestivalDecorations() {
  const pathname = usePathname()
  const settings = useFestivalSettings()
  const [bannerDismissed, setBannerDismissed] = useState(false)
  const [videoDismissed, setVideoDismissed] = useState(false)

  useEffect(() => {
    setBannerDismissed(wasDismissed(`rf-banner:${settings.offerText}`))
    setVideoDismissed(wasDismissed(`rf-video:${settings.wishingVideoUrl}`))
  }, [settings.offerText, settings.wishingVideoUrl])

  // The admin dashboard stays undecorated so festival settings can be reviewed cleanly.
  if (!isFestivalLive(settings) || pathname?.startsWith('/admin')) return null

  const showBanner = Boolean(settings.offerText) && !bannerDismissed
  // The "section" mode is rendered by FestivalHomepageVideo, inside the homepage.
  const showPopup =
    Boolean(settings.wishingVideoUrl) && !videoDismissed && settings.videoDisplayMode === 'popup'

  return (
    <>
      <FestivalStyles />
      <FestivalOverlay settings={settings} />
      {showBanner && (
        <OfferBanner
          settings={settings}
          onDismiss={() => {
            setBannerDismissed(true)
            remember(`rf-banner:${settings.offerText}`)
          }}
        />
      )}
      {showPopup && (
        <WishingVideoModal
          settings={settings}
          onClose={() => {
            setVideoDismissed(true)
            remember(`rf-video:${settings.wishingVideoUrl}`)
          }}
        />
      )}
    </>
  )
}
