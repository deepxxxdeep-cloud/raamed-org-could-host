import { put } from '@vercel/blob'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file')
    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'Image file is required' }, { status: 400 })
    }
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Only image files are allowed' }, { status: 400 })
    }
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'Image must be smaller than 5MB' }, { status: 400 })
    }
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '-')
    const blob = await put(`products/${Date.now()}-${safeName}`, file, { access: 'public', addRandomSuffix: false })
    return NextResponse.json({ url: blob.url })
  } catch (error) {
    console.error('[v0] Product image upload failed', error)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
