import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'

export async function GET(request) {
  const session = await getServerSession()

  if (!session) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  return NextResponse.json({ content: 'Protected content' })
} 