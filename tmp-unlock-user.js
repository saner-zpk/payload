;(async () => {
  const dbb = db.getSiblingDB('blooog')
  await dbb.users.updateOne(
    { email: '547790132@qq.com' },
    { $set: { loginAttempts: 0, lockUntil: null, updatedAt: new Date() } },
  )
  printjson(
    await dbb.users.findOne(
      { email: '547790132@qq.com' },
      { projection: { email: 1, loginAttempts: 1, lockUntil: 1, updatedAt: 1 } },
    ),
  )
})()
