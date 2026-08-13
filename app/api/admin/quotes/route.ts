import { NextResponse } from 'next/server'
import { ObjectId } from 'mongodb'
import { getDb, listQuotes } from '@/lib/mongodb'
import { memoryQuotes } from '@/app/api/quotes/route'

export async function GET() {
  try {
    const dbQuotes = await listQuotes()
    if (dbQuotes && dbQuotes.length > 0) {
      return NextResponse.json({ quotes: dbQuotes })
    }
  } catch {
    // Memory fallback
  }
  return NextResponse.json({ quotes: memoryQuotes })
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { _id, email, status, finalAmount, reason } = body

    if (!_id && !email) {
      return NextResponse.json({ error: 'Missing quote identifier' }, { status: 400 })
    }

    const updateFields = {
      status: String(status || 'Pending'),
      finalAmount: String(finalAmount || ''),
      reason: String(reason || ''),
      updatedAt: new Date(),
    }

    try {
      const db = await getDb()
      let filter: Record<string, unknown> = {}
      if (_id) {
        filter = ObjectId.isValid(_id) ? { $or: [{ _id: new ObjectId(_id) }, { _id }] } : { _id }
      } else if (email) {
        filter = { email }
      }

      await db.collection('quotes').updateOne(filter, { $set: updateFields })
      return NextResponse.json({ ok: true, _id, ...updateFields })
    } catch {
      // Memory fallback mode
      const idx = memoryQuotes.findIndex((q) => q._id === _id || q.email === email)
      if (idx !== -1) {
        memoryQuotes[idx] = { ...memoryQuotes[idx], ...updateFields }
      }
      return NextResponse.json({ ok: true, _id, ...updateFields })
    }
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Server error'
    return NextResponse.json({ error: errorMsg }, { status: 500 })
  }
}
