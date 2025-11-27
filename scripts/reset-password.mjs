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
  const uri = args.database || process.env.DATABASE_URI || process.env.MONGO_URL

  if (!email || !password || !uri) {
    console.error(
      'Usage: DATABASE_URI="mongodb://..." node scripts/reset-password.mjs --email=you@example.com --password=newpass',
    )
    process.exit(1)
  }

  const client = new MongoClient(uri)
  try {
    await client.connect()
    const db = client.db() // uses DB from URI if present
    const users = db.collection('users')

    const user = await users.findOne({ email })
    if (!user) {
      console.error(`User with email ${email} not found.`)
      process.exit(2)
    }

    const saltRounds = 10
    const hash = await bcrypt.hash(password, saltRounds)

    const res = await users.updateOne(
      { _id: user._id },
      {
        $set: {
          password: hash,
          updatedAt: new Date(),
          resetPasswordToken: null,
          resetPasswordExpiration: null,
        },
      },
    )

    if (res.modifiedCount === 1) {
      console.log(`Password updated for ${email}`)
    } else {
      console.warn('No document was modified. Check permissions and connection string.')
    }
  } finally {
    await client.close()
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(99)
})
