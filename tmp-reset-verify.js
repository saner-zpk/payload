import { MongoClient } from 'mongodb'
import b from 'bcryptjs'
;(async () => {
  const uri = 'mongodb://127.0.0.1/blooog'
  const client = new MongoClient(uri)
  try {
    await client.connect()
    const db = client.db()
    const users = db.collection('users')
    const u = await users.findOne({ email: '547790132@qq.com' })
    if (!u) {
      console.error('user not found')
      process.exit(2)
    }
    const newHash = b.hashSync('123456', 10)
    await users.updateOne({ _id: u._id }, { $set: { password: newHash, updatedAt: new Date() } })
    const u2 = await users.findOne({ _id: u._id })
    console.log('storedHashLen', u2.password.length)
    console.log(u2.password)
    console.log('compareSaved:', b.compareSync('123456', u2.password))
  } finally {
    await client.close()
  }
})().catch((e) => {
  console.error(e)
  process.exit(99)
})
