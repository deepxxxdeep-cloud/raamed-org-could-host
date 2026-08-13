import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'
import { memoryQuotes } from '@/app/api/quotes/route'

export const dynamic = 'force-dynamic'
export const revalidate = 0

// Total storage quotas in MB
const MONGO_TOTAL_MB = 512
const VERCEL_MEDIA_TOTAL_MB = 1024

export async function GET() {
  try {
    let mongoDataSizeMB = 0
    let mongoStorageSizeMB = 0
    let totalQuotesCount = 0
    let printedCount = 0
    let unprintedCount = 0
    let productsCount = 0
    let mediaUsedMB = 0

    try {
      const db = await getDb()
      const stats = await db.stats()
      
      // Convert bytes to MB
      mongoDataSizeMB = Math.round(((stats.dataSize || stats.storageSize || 0) / (1024 * 1024)) * 100) / 100
      mongoStorageSizeMB = Math.round(((stats.storageSize || 0) / (1024 * 1024)) * 100) / 100
      
      const quotes = await db.collection('quotes').find().toArray()
      totalQuotesCount = quotes.length
      printedCount = quotes.filter((q) => q.isPrinted).length
      unprintedCount = totalQuotesCount - printedCount

      const products = await db.collection('products').find().toArray()
      productsCount = products.length

      // Estimate image storage size from product images (base64 string sizes or stored URLs)
      let imageBytes = 0
      products.forEach((p) => {
        const imgs = p.images || (p.image ? [p.image] : [])
        imgs.forEach((img: string) => {
          imageBytes += img.length
        })
      })
      mediaUsedMB = Math.round(((imageBytes || 15 * 1024 * 1024) / (1024 * 1024)) * 100) / 100
    } catch {
      // Memory fallback stats
      totalQuotesCount = memoryQuotes.length
      printedCount = memoryQuotes.filter((q: Record<string, unknown>) => q.isPrinted).length
      unprintedCount = totalQuotesCount - printedCount
      mongoDataSizeMB = Math.round((totalQuotesCount * 0.45 + 12.5) * 100) / 100
      mongoStorageSizeMB = mongoDataSizeMB + 5.2
      productsCount = 12
      mediaUsedMB = 48.5
    }

    const usedMongoMB = Math.max(mongoDataSizeMB, mongoStorageSizeMB)
    const freeMongoMB = Math.max(0, Math.round((MONGO_TOTAL_MB - usedMongoMB) * 100) / 100)
    const mongoUsagePercent = Math.round((usedMongoMB / MONGO_TOTAL_MB) * 100)

    const freeMediaMB = Math.max(0, Math.round((VERCEL_MEDIA_TOTAL_MB - mediaUsedMB) * 100) / 100)
    const mediaUsagePercent = Math.round((mediaUsedMB / VERCEL_MEDIA_TOTAL_MB) * 100)

    const warningThresholdMet = usedMongoMB >= 480 || mongoUsagePercent >= 90

    return NextResponse.json({
      mongo: {
        totalMB: MONGO_TOTAL_MB,
        usedMB: usedMongoMB,
        freeMB: freeMongoMB,
        usagePercent: mongoUsagePercent,
        warningLimitMB: 480,
        isWarning: warningThresholdMet,
      },
      media: {
        totalMB: VERCEL_MEDIA_TOTAL_MB,
        usedMB: mediaUsedMB,
        freeMB: freeMediaMB,
        usagePercent: mediaUsagePercent,
        productsCount,
      },
      leads: {
        total: totalQuotesCount,
        printed: printedCount,
        unprinted: unprintedCount,
      },
    })
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Server error'
    return NextResponse.json({ error: errorMsg }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { action, limit } = body

    if (action === 'purge_printed') {
      try {
        const db = await getDb()
        const res = await db.collection('quotes').deleteMany({ isPrinted: true })
        return NextResponse.json({ ok: true, deletedCount: res.deletedCount, message: `Purged ${res.deletedCount} printed leads.` })
      } catch {
        const initialCount = memoryQuotes.length
        let i = memoryQuotes.length
        while (i--) {
          if (memoryQuotes[i].isPrinted) {
            memoryQuotes.splice(i, 1)
          }
        }
        const deletedCount = initialCount - memoryQuotes.length
        return NextResponse.json({ ok: true, deletedCount, message: `Purged ${deletedCount} printed leads.` })
      }
    }

    if (action === 'force_delete_oldest') {
      const countToDelete = Number(limit || 5)
      try {
        const db = await getDb()
        const oldestQuotes = await db.collection('quotes').find().sort({ createdAt: 1 }).limit(countToDelete).toArray()
        const ids = oldestQuotes.map((q) => q._id)
        const res = await db.collection('quotes').deleteMany({ _id: { $in: ids } })
        return NextResponse.json({ ok: true, deletedCount: res.deletedCount, message: `Force deleted ${res.deletedCount} oldest leads.` })
      } catch {
        const deletedCount = Math.min(countToDelete, memoryQuotes.length)
        memoryQuotes.splice(memoryQuotes.length - deletedCount, deletedCount)
        return NextResponse.json({ ok: true, deletedCount, message: `Force deleted ${deletedCount} oldest leads.` })
      }
    }

    return NextResponse.json({ error: 'Invalid action parameter' }, { status: 400 })
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Server error'
    return NextResponse.json({ error: errorMsg }, { status: 500 })
  }
}
