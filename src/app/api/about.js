import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]/route'

export async function PUT(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { message: 'Not authenticated' },
        { status: 401 }
      )
    }

    const { type, ...params } = await request.json()

    if (type === 'about_me') {
      if (session.user.email !== params.email && session.user.role !== 'SUPER_ADMIN') {
        return NextResponse.json(
          { message: 'Not authorized' },
          { status: 403 }
        )
      }

      let queryParts = []
      let updateValues = []

      const fields = ['content']

      fields.forEach(field => {
        if (params[field] !== undefined) {
          queryParts.push(`${field} = ?`)
          updateValues.push(params[field])
        }
      })

      updateValues.push(params.email, new Date().toISOString())

      const result = await query(
        `UPDATE about_me SET ${queryParts.join(', ')} , updated_at = ? WHERE email = ?`,
        updateValues
      )

      return NextResponse.json(result)
    }

    return NextResponse.json(
      { message: 'Invalid request type' },
      { status: 400 }
    )

  } catch (error) {
    console.error('Error updating about_me:', error)
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
