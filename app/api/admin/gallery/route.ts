import { NextResponse } from 'next/server'
import { ObjectId } from 'mongodb'
import { getDb } from '@/lib/mongodb'
import { RAMMED_GALLERY_COLLECTION, normalizeGalleryItem, type GalleryItem } from '@/lib/product-media'

export const dynamic = 'force-dynamic'
export const revalidate = 0

async function galleryCollection() {
  return (await getDb()).collection(RAMMED_GALLERY_COLLECTION)
}

export async function GET() {
  try {
    const docs = await (await galleryCollection()).find().sort({ createdAt: -1 }).toArray()
    return NextResponse.json(docs.map(normalizeGalleryItem).filter(Boolean))
  } catch (error) {
    console.error('[v0] Rammed gallery list failed', error)
    return NextResponse.json([])
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const rawItems: unknown[] = Array.isArray(body.items) ? body.items : [body]
    const normalized = rawItems
      .map(normalizeGalleryItem)
      .filter((item): item is GalleryItem => item !== null)
      .map((item) => ({
        url: item.url,
        type: item.type,
        title: item.title || '',
        caption: item.caption || '',
        createdAt: new Date().toISOString(),
      }))

    if (!normalized.length) {
      return NextResponse.json({ error: 'Please upload at least one photo or video.' }, { status: 400 })
    }

    const result = await (await galleryCollection()).insertMany(normalized)
    return NextResponse.json({ ok: true, insertedCount: result.insertedCount })
  } catch (error) {
    console.error('[v0] Rammed gallery save failed', error)
    return NextResponse.json({ error: 'Could not save the gallery media.' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const id = typeof body.id === 'string' ? body.id : ''
    if (!id) return NextResponse.json({ error: 'Missing media id.' }, { status: 400 })
    const filter = ObjectId.isValid(id) ? { _id: new ObjectId(id) } : { _id: id as unknown as ObjectId }
    await (await galleryCollection()).updateOne(filter, {
      $set: {
        title: typeof body.title === 'string' ? body.title.trim().slice(0, 160) : '',
        caption: typeof body.caption === 'string' ? body.caption.trim().slice(0, 500) : '',
      },
    })
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('[v0] Rammed gallery update failed', error)
    return NextResponse.json({ error: 'Could not update the media.' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const id = new URL(request.url).searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'Missing media id.' }, { status: 400 })
    const filter = ObjectId.isValid(id) ? { _id: new ObjectId(id) } : { _id: id as unknown as ObjectId }
    const result = await (await galleryCollection()).deleteOne(filter)
    return NextResponse.json({ ok: true, deletedCount: result.deletedCount })
  } catch (error) {
    console.error('[v0] Rammed gallery delete failed', error)
    return NextResponse.json({ error: 'Could not delete the media.' }, { status: 500 })
  }
}
