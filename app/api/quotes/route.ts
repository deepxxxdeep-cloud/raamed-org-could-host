import { NextResponse } from 'next/server'
import { createQuote } from '@/lib/mongodb'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const required = ['name', 'address', 'phone', 'email']
    if (required.some((key) => typeof body[key] !== 'string' || !body[key].trim())) {
      return NextResponse.json({ error: 'Please complete all required fields.' }, { status: 400 })
    }
    const quote = await createQuote({
      name: body.name.trim(), address: body.address.trim(), phone: body.phone.trim(), email: body.email.trim().toLowerCase(),
      organization: typeof body.organization === 'string' ? body.organization.trim() : '',
      message: typeof body.message === 'string' ? body.message.trim() : '',
    })
    return NextResponse.json({ quote }, { status: 201 })
  } catch (error) {
    const message = error instanceof Error && error.message === 'MONGODB_URI is not configured' ? 'MongoDB is not connected yet. Please contact the administrator.' : 'Unable to save your enquiry right now.'
    return NextResponse.json({ error: message }, { status: 503 })
  }
}
