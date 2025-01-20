import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { depList, facultyTables } from '@/lib/const'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    let results = {}

    // Get user profile
    const profile = await query(
      `SELECT * FROM user WHERE email = ?`,
      [type]
    )
    
    if (profile.length > 0) {
      results.profile = profile[0]

      // Fetch data from all faculty tables
      for (const table of facultyTables) {
        const tableData = await query(
          `SELECT * FROM ${table} WHERE email = ?`,
          [type]
        )
        
        if (tableData?.length > 0) {
          results[table] = tableData
        }
      }
    }

    return NextResponse.json(results)

  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { message: error.message },
      { status: 500 }
    )
  }
} 