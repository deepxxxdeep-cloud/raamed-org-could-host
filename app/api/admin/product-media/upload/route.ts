import { handleUpload, type HandleUploadBody } from '@vercel/blob/client'
import { NextResponse } from 'next/server'
import { MEDIA_CONTENT_TYPES, MEDIA_MAX_BYTES } from '@/lib/product-media'

/**
 * Token issuer for direct browser -> Vercel Blob uploads of product media.
 * Direct uploads are required because Vercel serverless request bodies cap at
 * ~4.5MB, far below the intro videos this manager is built for. Access is
 * already gated by the admin session check in proxy.ts.
 *
 * Files land under the "products/<slug>/" prefix so every object is traceable
 * to one product and can never be confused with Rammed gallery media.
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
        // The admin form persists the returned URL against the product.
      },
    })
    return NextResponse.json(result)
  } catch (error) {
    console.error('[v0] Product media upload failed', error)
    const message = error instanceof Error ? error.message : 'Upload failed'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
