import { handleUpload, type HandleUploadBody } from '@vercel/blob/client'
import { NextResponse } from 'next/server'
import { FESTIVAL_VIDEO_MAX_BYTES, FESTIVAL_VIDEO_TYPES } from '@/lib/festival'

/**
 * Token issuer for direct browser -> Vercel Blob video uploads. Videos are far
 * larger than the ~4.5MB serverless request body limit, so they cannot be piped
 * through an API route the way product images are. Access to this route is
 * already gated by the admin session check in proxy.ts.
 */
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as HandleUploadBody
    const result = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => ({
        allowedContentTypes: FESTIVAL_VIDEO_TYPES,
        maximumSizeInBytes: FESTIVAL_VIDEO_MAX_BYTES,
        addRandomSuffix: true,
        pathname,
      }),
      onUploadCompleted: async () => {
        // The admin form stores the returned URL when it saves the settings.
      },
    })
    return NextResponse.json(result)
  } catch (error) {
    console.error('[v0] Festival video upload failed', error)
    const message = error instanceof Error ? error.message : 'Video upload failed'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
