export type MediaKind = 'image' | 'video'

export type MediaItem = {
  id: string
  url: string
  type: MediaKind
  name?: string
  size?: number
  createdAt?: string
}

/** A product / tool (e.g. "Sono Scope") and every media item that belongs to it. */
export type ToolProduct = {
  _id?: string
  title: string
  slug: string
  description?: string
  media: MediaItem[]
  createdAt?: string
  updatedAt?: string
}

/** A Rammed event photo or video. Deliberately a separate shape and collection. */
export type GalleryItem = {
  _id?: string
  url: string
  type: MediaKind
  title?: string
  caption?: string
  createdAt?: string
}

export const PRODUCT_MEDIA_COLLECTION = 'productMedia'
export const RAMMED_GALLERY_COLLECTION = 'galleryMedia'

/** 2GB per file: large intro videos are expected, so this is a practical ceiling, not a limit. */
export const MEDIA_MAX_BYTES = 2 * 1024 * 1024 * 1024

export const IMAGE_CONTENT_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/avif',
  'image/heic',
  'image/heif',
]

export const VIDEO_CONTENT_TYPES = [
  'video/mp4',
  'video/webm',
  'video/quicktime',
  'video/x-matroska',
  'video/x-msvideo',
  'video/mpeg',
  'video/ogg',
  'video/3gpp',
]

export const MEDIA_CONTENT_TYPES = [...IMAGE_CONTENT_TYPES, ...VIDEO_CONTENT_TYPES]

/** Stable, URL-safe identity for a product. Two products can never share one. */
export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}

export function mediaKindFromType(contentType: string): MediaKind {
  return contentType.startsWith('video/') ? 'video' : 'image'
}

export function isSupportedMediaType(contentType: string) {
  return MEDIA_CONTENT_TYPES.includes(contentType)
}

export function formatBytes(bytes?: number) {
  if (!bytes || bytes <= 0) return ''
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`
}

function textOf(value: unknown, max: number) {
  return typeof value === 'string' ? value.trim().slice(0, max) : ''
}

export function normalizeMediaItem(input: unknown): MediaItem | null {
  const raw = (input || {}) as Record<string, unknown>
  const url = textOf(raw.url, 800)
  if (!url) return null
  return {
    id: textOf(raw.id, 60) || `${Date.now()}-${Math.round(Number(raw.size) || 0)}`,
    url,
    type: raw.type === 'video' ? 'video' : 'image',
    name: textOf(raw.name, 200) || undefined,
    size: typeof raw.size === 'number' && raw.size > 0 ? raw.size : undefined,
    createdAt: textOf(raw.createdAt, 40) || undefined,
  }
}

export function normalizeMediaList(input: unknown): MediaItem[] {
  if (!Array.isArray(input)) return []
  return input.map(normalizeMediaItem).filter((item): item is MediaItem => item !== null)
}

/** Coerce a database document (or a request body) into a complete product. */
export function normalizeToolProduct(input: unknown): ToolProduct {
  const raw = (input || {}) as Record<string, unknown>
  const title = textOf(raw.title, 120)
  return {
    _id: raw._id ? String(raw._id) : undefined,
    title,
    slug: textOf(raw.slug, 80) || slugify(title),
    description: textOf(raw.description, 2000) || undefined,
    media: normalizeMediaList(raw.media),
    createdAt: raw.createdAt ? String(raw.createdAt) : undefined,
    updatedAt: raw.updatedAt ? String(raw.updatedAt) : undefined,
  }
}

export function normalizeGalleryItem(input: unknown): GalleryItem | null {
  const raw = (input || {}) as Record<string, unknown>
  const url = textOf(raw.url, 800)
  if (!url) return null
  return {
    _id: raw._id ? String(raw._id) : undefined,
    url,
    type: raw.type === 'video' ? 'video' : 'image',
    title: textOf(raw.title, 160) || undefined,
    caption: textOf(raw.caption, 500) || undefined,
    createdAt: raw.createdAt ? String(raw.createdAt) : undefined,
  }
}
