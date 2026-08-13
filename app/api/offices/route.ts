import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'
import { DEFAULT_OFFICES } from '@/lib/offices-data'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  try {
    const db = await getDb()
    const offices = await db.collection('offices').find().sort({ createdAt: 1 }).toArray()
    if (offices && offices.length > 0) {
      return NextResponse.json(offices)
    }
  } catch {
    // Fall back to default offices if DB is not connected or empty
  }
  return NextResponse.json(DEFAULT_OFFICES)
}
