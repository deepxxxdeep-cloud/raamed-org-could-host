import { NextResponse } from 'next/server'
import { createQuote } from '@/lib/mongodb'

export const memoryQuotes: Record<string, unknown>[] = [
  {
    _id: 'sample-1',
    name: 'Dr. Meera Kulkarni',
    email: 'meera@asterline.com',
    phone: '+91 98765 43210',
    organization: 'Asterline Hospital',
    address: 'Mumbai, Maharashtra',
    productName: 'Patient Monitor THR-2026',
    message: 'Required 5 patient monitors with central station support.',
    createdAt: new Date().toISOString(),
    status: 'Finalized',
    finalAmount: '₹ 4,50,000',
  },
  {
    _id: 'sample-2',
    name: 'Dr. Arjun Malhotra',
    email: 'arjun@northviewclinic.org',
    phone: '+91 98123 45678',
    organization: 'Northview Clinic',
    address: 'Delhi NCR',
    productName: 'Surgical ICU Monitor',
    message: 'Inquiring about warranty and demo setup.',
    createdAt: new Date().toISOString(),
    status: 'Pending',
  },
]

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
