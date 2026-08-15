import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'
import {
  DEFAULT_FESTIVAL_SETTINGS,
  normalizeFestivalSettings,
  type FestivalSettings,
} from '@/lib/festival'

type FestivalDoc = { _id: string } & Partial<FestivalSettings>

async function festivalCollection() {
  return (await getDb()).collection<FestivalDoc>('settings')
}

export async function GET() {
  try {
    const doc = await (await festivalCollection()).findOne({ _id: 'festival' })
    return NextResponse.json(doc ? normalizeFestivalSettings(doc) : DEFAULT_FESTIVAL_SETTINGS)
  } catch {
    return NextResponse.json(DEFAULT_FESTIVAL_SETTINGS)
  }
}

export async function PUT(req: Request) {
  try {
    const settings = normalizeFestivalSettings(await req.json())
    const updatedAt = new Date().toISOString()
    await (await festivalCollection()).updateOne(
      { _id: 'festival' },
      { $set: { ...settings, updatedAt } },
      { upsert: true },
    )
    return NextResponse.json({ ok: true, settings: { ...settings, updatedAt } })
  } catch (error) {
    console.error('[v0] Festival settings save failed', error)
    return NextResponse.json({ error: 'Could not save festival settings.' }, { status: 500 })
  }
}
