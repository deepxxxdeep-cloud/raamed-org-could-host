import { NextResponse } from 'next/server'
import { listQuotes } from '@/lib/mongodb'

export async function GET() {
  try {
    const quotes = await listQuotes()
    return NextResponse.json({ quotes })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to load enquiries.'
    return NextResponse.json({ error: message === 'MONGODB_URI is not configured' ? 'MongoDB is not connected yet.' : message }, { status: 503 })
  }
}
