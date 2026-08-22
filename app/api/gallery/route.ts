import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'
import { RAMMED_GALLERY_COLLECTION, normalizeGalleryItem } from '@/lib/product-media'

export const dynamic = 'force-dynamic'
export const revalidate = 0

/** Public read for the Rammed media centre. Never returns product media. */
export async function GET() {
  try {
    const db = await getDb()
    const docs = await db.collection(RAMMED_GALLERY_COLLECTION).find().sort({ createdAt: -1 }).toArray()
    return NextResponse.json(docs.map(normalizeGalleryItem).filter(Boolean))
  } catch {
    return NextResponse.json([])
  }
}
