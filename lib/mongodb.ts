import { MongoClient, type Db } from 'mongodb'

const uri = process.env.MONGODB_URI
const dbName = process.env.MONGODB_DB || 'raamed'

let clientPromise: Promise<MongoClient> | null = null

function getClientPromise() {
  if (!uri) throw new Error('MONGODB_URI is not configured')
  if (!clientPromise) clientPromise = new MongoClient(uri).connect()
  return clientPromise
}

export async function getDb(): Promise<Db> {
  return (await getClientPromise()).db(dbName)
}

export type Quote = {
  name: string
  address: string
  phone: string
  email: string
  organization?: string
  message?: string
  createdAt: Date
  status: 'New' | 'Contacted' | 'Converted'
}

export async function createQuote(input: Omit<Quote, 'createdAt' | 'status'>) {
  const db = await getDb()
  const quote: Quote = { ...input, createdAt: new Date(), status: 'New' }
  const result = await db.collection<Quote>('quotes').insertOne(quote)
  return { ...quote, id: result.insertedId.toString() }
}

export async function listQuotes() {
  const db = await getDb()
  return db.collection<Quote>('quotes').find().sort({ createdAt: -1 }).limit(200).toArray()
}
