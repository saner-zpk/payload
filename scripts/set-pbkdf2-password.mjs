import { MongoClient } from 'mongodb'
import crypto from 'crypto'

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
      'Usage: DATABASE_URI="mongodb://..." node scripts/set-pbkdf2-password.mjs --email=you@example.com --password=newpass',
    )
    process.exit(1)
  }

  const client = new MongoClient(uri)
  try {
    await client.connect()
    const db = client.db()
    const users = db.collection('users')

    const user = await users.findOne({ email })
    if (!user) {
      console.error(`User with email ${email} not found.`)
      process.exit(2)
    }

    const salt = crypto.randomBytes(16).toString('hex')
    const iterations = 25000
    const keylen = 512
    const digest = 'sha256'
    const hashBuffer = await new Promise((resolve, reject) => {
      crypto.pbkdf2(password, salt, iterations, keylen, digest, (err, derived) => {
        if (err) reject(err)
        else resolve(derived)
      })
    })
    const hash = hashBuffer.toString('hex')

    const res = await users.updateOne(
      { _id: user._id },
      {
        $set: {
          salt,
          hash,
          updatedAt: new Date(),
        },
        $unset: {
          password: '',
        },
      },
    )

    if (res.modifiedCount === 1) {
      console.log(`PBKDF2 password set for ${email}`)
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
