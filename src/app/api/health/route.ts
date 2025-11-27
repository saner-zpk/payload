import { MongoClient } from 'mongodb'

const uri = process.env.DATABASE_URI || ''

export async function GET() {
  try {
    // Basic response availability check
    if (!uri) {
      return new Response(JSON.stringify({ ok: false, error: 'DATABASE_URI not set' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Quick ping to MongoDB with short timeout
    const client = new MongoClient(uri, { serverSelectionTimeoutMS: 3000 })
    await client.connect()
    try {
      // admin ping
      await client.db().admin().ping()
    } finally {
      await client.close()
    }

    return new Response(JSON.stringify({ ok: true, db: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(JSON.stringify({ ok: false, error: String(err) }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
