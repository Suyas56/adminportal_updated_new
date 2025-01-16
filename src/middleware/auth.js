import { getSession } from 'next-auth/react'

export default async function auth(req, res, next) {
  const session = await getSession({ req })

  if (!session) {
    res.status(401).json({ error: 'Unauthorized' })
    return
  }

  // Add user info to request object
  req.user = session.user
  next()
} 