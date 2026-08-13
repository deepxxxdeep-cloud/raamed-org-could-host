import { NextResponse } from 'next/server'
import { ObjectId } from 'mongodb'
import { getDb } from '@/lib/mongodb'
import { DEFAULT_OFFICES } from '@/lib/offices-data'

export const dynamic = 'force-dynamic'
export const revalidate = 0

// Memory fallback store when MongoDB is not configured
let localOffices = [...DEFAULT_OFFICES]

export async function GET() {
  try {
    const db = await getDb()
    let offices = await db.collection('offices').find().sort({ createdAt: 1 }).toArray()
    if (!offices || offices.length === 0) {
      // Seed default offices into DB if empty
      await db.collection('offices').insertMany(DEFAULT_OFFICES)
      offices = await db.collection('offices').find().sort({ createdAt: 1 }).toArray()
    }
    return NextResponse.json(offices)
  } catch {
    // Return memory fallback
  }
  return NextResponse.json(localOffices)
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { label, city, state, address, phone, mobile, mapUrl, isMain } = body

    if (!city || !address) {
      return NextResponse.json({ error: 'City and Address are required fields' }, { status: 400 })
    }

    const newOffice = {
      label: String(label || `${city} Branch`),
      city: String(city),
      state: String(state || ''),
      address: String(address),
      phone: String(phone || ''),
      mobile: String(mobile || ''),
      mapUrl: String(mapUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`),
      isMain: Boolean(isMain),
      createdAt: new Date(),
    }

    try {
      const db = await getDb()
      const result = await db.collection('offices').insertOne(newOffice)
      return NextResponse.json({ _id: result.insertedId.toString(), ...newOffice })
    } catch {
      // Memory fallback mode
      const tempOffice = { _id: `local-${Date.now()}`, ...newOffice }
      localOffices.unshift(tempOffice)
      return NextResponse.json(tempOffice)
    }
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Server error'
    return NextResponse.json({ error: errorMsg }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { _id, label, city, state, address, phone, mobile, mapUrl, isMain } = body

    if (!_id) {
      return NextResponse.json({ error: 'Office _id is required for editing' }, { status: 400 })
    }

    const updateFields = {
      label: String(label || ''),
      city: String(city || ''),
      state: String(state || ''),
      address: String(address || ''),
      phone: String(phone || ''),
      mobile: String(mobile || ''),
      mapUrl: String(mapUrl || ''),
      isMain: Boolean(isMain),
      updatedAt: new Date(),
    }

    try {
      const db = await getDb()
      let filter: Record<string, unknown> = { _id }
      if (ObjectId.isValid(_id)) {
        filter = { $or: [{ _id: new ObjectId(_id) }, { _id }] }
      }
      await db.collection('offices').updateOne(filter, { $set: updateFields })
      return NextResponse.json({ ok: true, _id, ...updateFields })
    } catch {
      // Memory fallback mode
      localOffices = localOffices.map((off) => (off._id === _id ? { ...off, ...updateFields } : off))
      return NextResponse.json({ ok: true, _id, ...updateFields })
    }
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Server error'
    return NextResponse.json({ error: errorMsg }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const params = new URL(request.url).searchParams
    const id = params.get('id')
    const city = params.get('city')

    if (!id && !city) {
      return NextResponse.json({ error: 'Missing office identifier' }, { status: 400 })
    }

    try {
      const db = await getDb()
      const filterConditions: Record<string, unknown>[] = []
      if (id) {
        if (ObjectId.isValid(id)) {
          filterConditions.push({ _id: new ObjectId(id) })
        }
        filterConditions.push({ _id: id })
      }
      if (city) {
        filterConditions.push({ city })
      }
      const filter = filterConditions.length === 1 ? filterConditions[0] : { $or: filterConditions }
      const result = await db.collection('offices').deleteOne(filter)
      return NextResponse.json({ ok: true, deletedCount: result.deletedCount })
    } catch {
      // Memory fallback mode
      localOffices = localOffices.filter((off) => off._id !== id && off.city !== city)
      return NextResponse.json({ ok: true, deletedCount: 1 })
    }
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Server error'
    return NextResponse.json({ error: errorMsg }, { status: 500 })
  }
}
