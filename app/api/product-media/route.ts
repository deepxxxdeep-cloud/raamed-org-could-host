import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'
import { PRODUCT_MEDIA_COLLECTION, normalizeToolProduct } from '@/lib/product-media'

export const dynamic = 'force-dynamic'
export const revalidate = 0

/** Public read for the tools gallery and the landing-page video marquee. */
export async function GET() {
  try {
    const db = await getDb()
    const docs = await db.collection(PRODUCT_MEDIA_COLLECTION).find().sort({ createdAt: -1 }).toArray()
    return NextResponse.json(docs.map(normalizeToolProduct))
  } catch {
    return NextResponse.json([])
  }
}
