import { NextResponse } from 'next/server'
import { ObjectId, type Collection, type Document, type Filter } from 'mongodb'
import { getDb } from '@/lib/mongodb'
import {
  PRODUCT_MEDIA_COLLECTION,
  normalizeMediaList,
  normalizeToolProduct,
  slugify,
} from '@/lib/product-media'

export const dynamic = 'force-dynamic'
export const revalidate = 0

async function productsCollection(): Promise<Collection<Document>> {
  const db = await getDb()
  const collection = db.collection(PRODUCT_MEDIA_COLLECTION)
  // Idempotent: guarantees one product per slug even across concurrent admins.
  await collection.createIndex({ slug: 1 }, { unique: true }).catch(() => undefined)
  return collection
}

/** Products created here carry ObjectId ids; the string branch covers hand-seeded documents. */
function idFilter(id: string): Filter<Document> {
  const conditions: Record<string, unknown>[] = [{ _id: id }]
  if (ObjectId.isValid(id)) conditions.unshift({ _id: new ObjectId(id) })
  return { $or: conditions } as Filter<Document>
}

export async function GET() {
  try {
    const collection = await productsCollection()
    const docs = await collection.find().sort({ createdAt: -1 }).toArray()
    return NextResponse.json(docs.map(normalizeToolProduct))
  } catch (error) {
    console.error('[v0] Product media list failed', error)
    return NextResponse.json([])
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const title = typeof body.title === 'string' ? body.title.trim() : ''
    if (!title) {
      return NextResponse.json({ error: 'Product title is required.' }, { status: 400 })
    }
    const slug = slugify(title)
    if (!slug) {
      return NextResponse.json({ error: 'Please use letters or numbers in the title.' }, { status: 400 })
    }

    const collection = await productsCollection()
    const existing = await collection.findOne({ slug })
    if (existing) {
      return NextResponse.json(
        { error: `A product called "${existing.title}" already exists. Add the new media to it instead.` },
        { status: 409 },
      )
    }

    const now = new Date().toISOString()
    const product = {
      title,
      slug,
      description: typeof body.description === 'string' ? body.description.trim().slice(0, 2000) : '',
      media: normalizeMediaList(body.media),
      createdAt: now,
      updatedAt: now,
    }
    const result = await collection.insertOne(product)
    return NextResponse.json(normalizeToolProduct({ ...product, _id: result.insertedId }))
  } catch (error) {
    console.error('[v0] Product create failed', error)
    return NextResponse.json({ error: 'Could not create the product.' }, { status: 500 })
  }
}

/** Updates title/description and/or replaces the media list (used for adding, deleting and re-ordering). */
export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const id = typeof body.id === 'string' ? body.id : ''
    if (!id) return NextResponse.json({ error: 'Missing product id.' }, { status: 400 })

    const collection = await productsCollection()
    const update: Record<string, unknown> = { updatedAt: new Date().toISOString() }

    if (typeof body.title === 'string') {
      const title = body.title.trim()
      if (!title) return NextResponse.json({ error: 'Product title is required.' }, { status: 400 })
      const slug = slugify(title)
      const clash = await collection.findOne({ slug })
      if (clash && String(clash._id) !== id) {
        return NextResponse.json({ error: `"${clash.title}" already uses that title.` }, { status: 409 })
      }
      update.title = title
      update.slug = slug
    }
    if (typeof body.description === 'string') {
      update.description = body.description.trim().slice(0, 2000)
    }
    if (Array.isArray(body.media)) {
      update.media = normalizeMediaList(body.media)
    }

    const result = await collection.findOneAndUpdate(
      idFilter(id),
      { $set: update },
      { returnDocument: 'after' },
    )
    if (!result) return NextResponse.json({ error: 'Product not found.' }, { status: 404 })
    return NextResponse.json(normalizeToolProduct(result))
  } catch (error) {
    console.error('[v0] Product update failed', error)
    return NextResponse.json({ error: 'Could not save the product.' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const id = new URL(request.url).searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'Missing product id.' }, { status: 400 })
    const collection = await productsCollection()
    const result = await collection.deleteOne(idFilter(id))
    return NextResponse.json({ ok: true, deletedCount: result.deletedCount })
  } catch (error) {
    console.error('[v0] Product delete failed', error)
    return NextResponse.json({ error: 'Could not delete the product.' }, { status: 500 })
  }
}
