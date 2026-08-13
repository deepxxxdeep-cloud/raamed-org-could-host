import { NextResponse } from 'next/server'
import { createQuote } from '@/lib/mongodb'

export const memoryQuotes: Record<string, unknown>[] = []

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const required = ['name', 'address', 'phone', 'email']
    if (required.some((key) => typeof body[key] !== 'string' || !body[key].trim())) {
      return NextResponse.json({ error: 'Please complete all required fields.' }, { status: 400 })
    }

    const payload = {
      name: body.name.trim(),
      address: body.address.trim(),
      phone: body.phone.trim(),
      email: body.email.trim().toLowerCase(),
      organization: typeof body.organization === 'string' ? body.organization.trim() : '',
      message: typeof body.message === 'string' ? body.message.trim() : '',
      productName: typeof body.productName === 'string' && body.productName.trim() ? body.productName.trim() : 'General Equipment Enquiry',
    }

    try {
      const quote = await createQuote(payload)
      return NextResponse.json({ quote }, { status: 201 })
    } catch {
      // Memory fallback mode
      const tempQuote = { _id: `quote-${Date.now()}`, ...payload, status: 'Pending', createdAt: new Date().toISOString() }
      memoryQuotes.unshift(tempQuote)
      return NextResponse.json({ quote: tempQuote }, { status: 201 })
    }
  } catch {
    return NextResponse.json({ error: 'Unable to save your enquiry right now.' }, { status: 503 })
  }
}
