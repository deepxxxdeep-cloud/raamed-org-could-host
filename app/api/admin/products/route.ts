import { NextResponse } from 'next/server'
import { ObjectId } from 'mongodb'
import { getDb } from '@/lib/mongodb'

const defaults = [
  { name: 'Portable Patient Monitor', category: 'Monitoring', description: 'Compact multi-parameter monitor for confident bedside care.', image: 'https://images.unsplash.com/photo-1584982751601-97dcc096659c?auto=format&fit=crop&w=900&q=85' },
  { name: 'LED Surgical Light', category: 'Surgical', description: 'Shadowless illumination with precise, cool LED output.', image: 'https://images.unsplash.com/photo-1516841273335-e39b37888115?auto=format&fit=crop&w=900&q=85' },
  { name: 'Endoscope X-200', category: 'Diagnostics', description: 'High-definition visualization for modern diagnostic teams.', image: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=900&q=85' },
]

export async function GET() {
  try {
    const db = await getDb()
    const collection = db.collection('products')
    const settingsCollection = db.collection('settings')

    const seedFlag = await settingsCollection.findOne({ _id: 'seed_products' as unknown as ObjectId })
    if (!seedFlag) {
      const count = await collection.countDocuments()
      if (!count) {
        await collection.insertMany(defaults.map((product) => ({ ...product, clicks: 0, createdAt: new Date(), seeded: true })))
      }
      await settingsCollection.updateOne(
        { _id: 'seed_products' as unknown as ObjectId },
        { $set: { initialized: true } },
        { upsert: true }
      )
    }

    const products = await collection.find().sort({ createdAt: -1 }).toArray()
    return NextResponse.json(products)
  } catch {
    return NextResponse.json([])
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    if (!body.name || !body.category || !body.description || !body.image) {
      return NextResponse.json({ error: 'Name, category, description and image are required' }, { status: 400 })
    }
    const db = await getDb()
    const result = await db.collection('products').insertOne({
      name: String(body.name),
      category: String(body.category),
      description: String(body.description),
      image: String(body.image),
      clicks: 0,
      createdAt: new Date(),
    })
    return NextResponse.json({ _id: result.insertedId, ...body })
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
    const filter = id && ObjectId.isValid(id) ? { _id: new ObjectId(id) } : { name }
    const db = await getDb()
    await db.collection('products').deleteOne(filter)
    return NextResponse.json({ ok: true })
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Database error'
    return NextResponse.json({ error: errorMsg }, { status: 500 })
  }
}
