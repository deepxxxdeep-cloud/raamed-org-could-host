import { handleUpload, type HandleUploadBody } from '@vercel/blob/client'
import { NextResponse } from 'next/server'
import { MEDIA_CONTENT_TYPES, MEDIA_MAX_BYTES } from '@/lib/product-media'

/**
 * Token issuer for Rammed event media. Kept as its own route (and its own
 * "rammed-gallery/" blob prefix) so Rammed uploads and product uploads can
 * never end up in the same place.
 */
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as HandleUploadBody
    const result = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => ({
        allowedContentTypes: MEDIA_CONTENT_TYPES,
        maximumSizeInBytes: MEDIA_MAX_BYTES,
        addRandomSuffix: true,
        pathname,
      }),
      onUploadCompleted: async () => {
        // The admin form persists the returned URL into the gallery collection.
      },
    })
    return NextResponse.json(result)
  } catch (error) {
    console.error('[v0] Rammed gallery upload failed', error)
    const message = error instanceof Error ? error.message : 'Upload failed'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
