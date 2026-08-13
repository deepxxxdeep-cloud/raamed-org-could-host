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

