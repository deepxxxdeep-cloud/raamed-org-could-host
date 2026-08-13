import { NextResponse } from 'next/server'
import { ObjectId } from 'mongodb'
import { getDb } from '@/lib/mongodb'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  try {
    const db = await getDb()
    const products = await db.collection('products').find().sort({ createdAt: -1 }).toArray()
    return NextResponse.json(products)
  } catch {
    return NextResponse.json([])
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const images = Array.isArray(body.images) && body.images.length > 0
      ? body.images.map(String)
      : (body.image ? [String(body.image)] : [])

    if (!body.name || !body.category || !body.description || images.length === 0) {
      return NextResponse.json(
        { error: 'Name, category, description, and at least 1 image (max 5) are required' },
        { status: 400 }
      )
    }

    const primaryImage = images[0]
    const db = await getDb()
    const result = await db.collection('products').insertOne({
      name: String(body.name),
      category: String(body.category),
      description: String(body.description),
      image: primaryImage,
      images: images.slice(0, 5),
      clicks: 0,
      createdAt: new Date(),
    })
    return NextResponse.json({
      _id: result.insertedId,
      name: body.name,
      category: body.category,
      description: body.description,
      image: primaryImage,
      images: images.slice(0, 5),
    })
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Database error'
    return NextResponse.json({ error: errorMsg }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const params = new URL(request.url).searchParams
    const id = params.get('id')
    const name = params.get('name')
    if (!id && !name) {
      return NextResponse.json({ error: 'Missing product identifier' }, { status: 400 })
    }
    const filterConditions: Record<string, unknown>[] = []
    if (id) {
      if (ObjectId.isValid(id)) {
        filterConditions.push({ _id: new ObjectId(id) })
      }
      filterConditions.push({ _id: id })
    }
    if (name) {
      filterConditions.push({ name: name })
    }
    const filter = filterConditions.length === 1 ? filterConditions[0] : { $or: filterConditions }
    const db = await getDb()
    const result = await db.collection('products').deleteOne(filter)
    return NextResponse.json({ ok: true, deletedCount: result.deletedCount })
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Database error'
    return NextResponse.json({ error: errorMsg }, { status: 500 })
  }
}
