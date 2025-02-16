import { NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')

    let results
    switch (type) {
      case 'all':
        const conference_papers = await query(
          `SELECT * FROM conference_papers`
        );
        const consultancy_projects = await query(
          `SELECT * FROM patents`
        );
        const textbooks_data = await query(
            `SELECT * FROM textbooks`
          );
          const journal_papers = await query(
            `SELECT * FROM journal_papers`
          );
          const book_chapters = await query(
            `SELECT * FROM book_chapters`
          );
        const data = [...conference_papers, ...consultancy_projects,...textbooks_data,...journal_papers,...book_chapters];
        return NextResponse.json(data);

      default:
        return NextResponse.json(
          { message: 'Invalid type parameter' },
          { status: 400 }
        )
    }

  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { message: error.message },
      { status: 500 }
    )
  }
}
