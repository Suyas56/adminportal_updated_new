import { NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const now = new Date().getTime()

    let results
    switch (type) {
      case 'all':
        results = await query(
          `SELECT * FROM events ORDER BY openDate DESC`
        )
        break

      case 'active':
        results = await query(
          `SELECT * FROM events WHERE openDate < ? AND closeDate > ? ORDER BY openDate DESC`,
          [now, now]
        )
        break

      default:
        return NextResponse.json(
          { message: 'Invalid type parameter' },
          { status: 400 }
        )
    }

    // Parse attachments for each event
    const events = JSON.parse(JSON.stringify(results))
    events.forEach(event => {
      event.attachments = JSON.parse(event.attachments)
    })

    return NextResponse.json(events)

  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { message: error.message },
      { status: 500 }
    )
  }
}

export async function POST(request) {
  try {
    const body = await request.json()
    const { type } = body
    
    let results
    switch (type) {
      case 'range':
        const { start_date, end_date, from, to } = body
        results = await query(
          `SELECT * FROM events 
           WHERE closeDate <= ? AND openDate >= ? 
           ORDER BY openDate DESC LIMIT ?, ?`,
          [end_date, start_date, from, to - from]
        )
        break

      case 'between':
        const { from: fromIndex, to: toIndex } = body
        results = await query(
          `SELECT * FROM events 
           ORDER BY openDate DESC 
           LIMIT 0, 15`, //hardcoded need to fix 
          [fromIndex, toIndex - fromIndex]
        )
        break

      default:
        return NextResponse.json(
          { message: 'Invalid type parameter' },
          { status: 400 }
        )
    }

    // Parse attachments for each event
    const events = JSON.parse(JSON.stringify(results))
    events.forEach(event => {
      event.attachments = JSON.parse(event.attachments)
    })

    return NextResponse.json(events)

  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { message: error.message },
      { status: 500 }
    )
  }
} 