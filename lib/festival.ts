export type FestivalKey =
  | 'holi'
  | 'diwali'
  | 'christmas'
  | 'new_year'
  | 'independence_day'
  | 'republic_day'
  | 'custom'

export type VideoDisplayMode = 'popup' | 'section'

export type FestivalSettings = {
  isEventModeActive: boolean
  selectedFestival: FestivalKey
  customFestivalName: string
  offerText: string
  offerLinkUrl: string
  wishingVideoUrl: string
  videoDisplayMode: VideoDisplayMode
  startDate: string
  endDate: string
  updatedAt?: string
}

export const DEFAULT_FESTIVAL_SETTINGS: FestivalSettings = {
  isEventModeActive: false,
  selectedFestival: 'diwali',
  customFestivalName: '',
  offerText: '',
  offerLinkUrl: '',
  wishingVideoUrl: '',
  videoDisplayMode: 'popup',
  startDate: '',
  endDate: '',
}

export type FestivalTheme = {
  label: string
  greeting: string
  bannerFrom: string
  bannerVia: string
  bannerTo: string
  bannerText: string
  accent: string
}

export const FESTIVAL_THEMES: Record<FestivalKey, FestivalTheme> = {
  holi: {
    label: 'Holi',
    greeting: 'Happy Holi',
    bannerFrom: '#e5195f',
    bannerVia: '#8a3ffc',
    bannerTo: '#f7a325',
    bannerText: '#ffffff',
    accent: '#e5195f',
  },
  diwali: {
    label: 'Diwali',
    greeting: 'Happy Diwali',
    bannerFrom: '#4b1d8f',
    bannerVia: '#b8380a',
    bannerTo: '#f0a608',
    bannerText: '#fff8e6',
    accent: '#f0a608',
  },
  christmas: {
    label: 'Christmas',
    greeting: 'Merry Christmas',
    bannerFrom: '#0f5132',
    bannerVia: '#127a45',
    bannerTo: '#b4232b',
    bannerText: '#ffffff',
    accent: '#b4232b',
  },
  new_year: {
    label: 'New Year',
    greeting: 'Happy New Year',
    bannerFrom: '#101a3d',
    bannerVia: '#3b2a86',
    bannerTo: '#d4a017',
    bannerText: '#fff6d8',
    accent: '#d4a017',
  },
  independence_day: {
    label: 'Independence Day',
    greeting: 'Happy Independence Day',
    bannerFrom: '#ff9933',
    bannerVia: '#ffffff',
    bannerTo: '#138808',
    bannerText: '#102a43',
    accent: '#138808',
  },
  republic_day: {
    label: 'Republic Day',
    greeting: 'Happy Republic Day',
    bannerFrom: '#ff9933',
    bannerVia: '#ffffff',
    bannerTo: '#138808',
    bannerText: '#102a43',
    accent: '#000080',
  },
  custom: {
    label: 'Custom',
    greeting: 'Celebrating with you',
    bannerFrom: '#0c6670',
    bannerVia: '#128a97',
    bannerTo: '#f36f2b',
    bannerText: '#ffffff',
    accent: '#f36f2b',
  },
}

export const FESTIVAL_OPTIONS: { value: FestivalKey; label: string }[] = (
  Object.keys(FESTIVAL_THEMES) as FestivalKey[]
).map((value) => ({ value, label: FESTIVAL_THEMES[value].label }))

/** Today's date in India, as YYYY-MM-DD, so scheduling behaves the same on server and client. */
export function todayInIndia() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(new Date())
}

/** True when event mode is switched on AND today falls inside the optional schedule. */
export function isFestivalLive(settings: FestivalSettings, today = todayInIndia()) {
  if (!settings.isEventModeActive) return false
  if (settings.startDate && today < settings.startDate) return false
  if (settings.endDate && today > settings.endDate) return false
  return true
}

export function festivalDisplayName(settings: FestivalSettings) {
  if (settings.selectedFestival === 'custom') {
    return settings.customFestivalName.trim() || 'Celebration'
  }
  return FESTIVAL_THEMES[settings.selectedFestival].label
}

export function festivalGreeting(settings: FestivalSettings) {
  if (settings.selectedFestival === 'custom') {
    const name = settings.customFestivalName.trim()
    return name ? `Happy ${name}` : FESTIVAL_THEMES.custom.greeting
  }
  return FESTIVAL_THEMES[settings.selectedFestival].greeting
}

/** Coerce anything read from the database (or posted by the form) into a complete settings object. */
export function normalizeFestivalSettings(input: unknown): FestivalSettings {
  const raw = (input || {}) as Record<string, unknown>
  const festival = String(raw.selectedFestival || '') as FestivalKey
  const mode = raw.videoDisplayMode === 'section' ? 'section' : 'popup'
  const text = (value: unknown) => (typeof value === 'string' ? value.trim() : '')
  const date = (value: unknown) => {
    const candidate = text(value)
    return /^\d{4}-\d{2}-\d{2}$/.test(candidate) ? candidate : ''
  }
  return {
    isEventModeActive: raw.isEventModeActive === true,
    selectedFestival: FESTIVAL_THEMES[festival] ? festival : DEFAULT_FESTIVAL_SETTINGS.selectedFestival,
    customFestivalName: text(raw.customFestivalName).slice(0, 60),
    offerText: text(raw.offerText).slice(0, 200),
    offerLinkUrl: text(raw.offerLinkUrl).slice(0, 500),
    wishingVideoUrl: text(raw.wishingVideoUrl).slice(0, 500),
    videoDisplayMode: mode,
    startDate: date(raw.startDate),
    endDate: date(raw.endDate),
    updatedAt: typeof raw.updatedAt === 'string' ? raw.updatedAt : undefined,
  }
}

export const FESTIVAL_VIDEO_MAX_BYTES = 20 * 1024 * 1024
export const FESTIVAL_VIDEO_TYPES = ['video/mp4', 'video/webm']
