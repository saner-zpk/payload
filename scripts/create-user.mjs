#!/usr/bin/env node
import { MongoClient } from 'mongodb'
import bcrypt from 'bcryptjs'

function parseArgs() {
  const args = {}
  for (const a of process.argv.slice(2)) {
    const [k, v] = a.split('=')
    args[k.replace(/^--/, '')] = v
  }
  return args
}

async function main() {
  const args = parseArgs()
  const email = args.email || process.env.EMAIL
  const password = args.password || process.env.PASSWORD
  const name = args.name || process.env.NAME || email?.split('@')[0]
  const uri = args.database || process.env.DATABASE_URI || process.env.MONGO_URL

  if (!email || !password || !uri) {
    console.error(
      'Usage: DATABASE_URI="mongodb://..." node scripts/create-user.mjs --email=you@example.com --password=newpass [--name=YourName]',
    )
    process.exit(1)
  }

  const client = new MongoClient(uri)
  try {
    await client.connect()
    const db = client.db()
    const users = db.collection('users')

    const existing = await users.findOne({ email })
    const hash = await bcrypt.hash(password, 10)

    if (existing) {
      const res = await users.updateOne(
        { _id: existing._id },
        {
          $set: {
            password: hash,
            name,
            updatedAt: new Date(),
            resetPasswordToken: null,
            resetPasswordExpiration: null,
          },
        },
      )
      if (res.modifiedCount === 1) {
        console.log(`Updated password for existing user: ${email}`)
      } else {
        console.warn('Update executed but no document was modified.')
      }
    } else {
      const doc = {
        email,
        name,
        password: hash,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      const res = await users.insertOne(doc)
      if (res.insertedId) {
        console.log(`Created new user: ${email}`)
      } else {
        console.warn('Insert executed but no document was created.')
      }
    }
  } finally {
    await client.close()
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(99)
})
