#!/usr/bin/env node
import 'dotenv/config'
import { MongoClient } from 'mongodb'

const TITLE = process.env.SEED_TITLE || '自我介绍'
const SLUG = process.env.SEED_SLUG || 'self-introduction'
const CONTENT = process.env.SEED_CONTENT || '你好，我是 ...（在此填写你的自我介绍）'
const DB = process.env.DATABASE_URI || ''
const API_URL = process.env.SEED_API_URL || 'http://localhost:3000/api/collections/posts'

async function tryApi() {
  try {
    console.log('Attempting REST API upsert...')
    const res = await fetch(`${API_URL}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: TITLE,
        slug: SLUG,
        _status: 'published',
        publishedAt: new Date().toISOString(),
        content: [
          {
            type: 'p',
            children: [{ text: CONTENT }],
          },
        ],
      }),
    })

    if (res.ok) {
      const data = await res.json()
      console.log('API upsert succeeded:', data)
      return true
    }

    console.log('API upsert failed with status', res.status)
    const txt = await res.text()
    console.log(txt)
    return false
  } catch (err) {
    console.log('API upsert error:', err.message || err)
    return false
  }
}

async function tryDb() {
  if (!DB) {
    console.log('No DATABASE_URI provided; skipping DB fallback')
    return false
  }

  console.log('Attempting direct MongoDB upsert...')
  const client = new MongoClient(DB)
  try {
    await client.connect()
    const dbName = client.db().databaseName
    console.log('Connected to', dbName)
    const posts = client.db().collection('posts')

    const now = new Date()
    const doc = {
      title: TITLE,
      slug: SLUG,
      _status: 'published',
      publishedAt: now,
      content: [
        {
          type: 'p',
          children: [{ text: CONTENT }],
        },
      ],
      createdAt: now,
      updatedAt: now,
    }

    const result = await posts.findOneAndUpdate(
      { slug: SLUG },
      { $set: doc },
      { upsert: true, returnDocument: 'after' }
    )

    console.log('DB upsert result:', result.value || result)
    return true
  } catch (err) {
    console.log('DB upsert error:', err.message || err)
    return false
  } finally {
    await client.close()
  }
}

;(async () => {
  const apiOk = await tryApi()
  if (apiOk) return

  console.log('Falling back to DB upsert')
  const dbOk = await tryDb()
  if (!dbOk) process.exitCode = 1
})()
