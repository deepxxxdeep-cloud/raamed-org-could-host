import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'
import {
  DEFAULT_FESTIVAL_SETTINGS,
  isFestivalLive,
  normalizeFestivalSettings,
  type FestivalSettings,
} from '@/lib/festival'

export const dynamic = 'force-dynamic'

type FestivalDoc = { _id: string } & Partial<FestivalSettings>

/**
 * Public read for the site-wide decorations. Returns the live settings, or the
 * inactive default whenever event mode is off / outside its scheduled window,
 * so the public site never learns about an unpublished celebration.
 */
export async function GET() {
  try {
    const db = await getDb()
    const doc = await db.collection<FestivalDoc>('settings').findOne({ _id: 'festival' })
    if (!doc) return NextResponse.json(DEFAULT_FESTIVAL_SETTINGS)
    const settings = normalizeFestivalSettings(doc)
    return NextResponse.json(isFestivalLive(settings) ? settings : DEFAULT_FESTIVAL_SETTINGS)
  } catch {
    return NextResponse.json(DEFAULT_FESTIVAL_SETTINGS)
  }
}
