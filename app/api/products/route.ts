import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'

export async function GET() {
  try {
    const products = await (await getDb()).collection('products').find().sort({ createdAt: -1 }).toArray()
    return NextResponse.json(products)
  } catch {
    return NextResponse.json([])
  }
}
