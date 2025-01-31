import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
    }

    const { type, ...params } = await request.json();

    if (type === 'about_me') {
      if (session.user.email !== params.email && session.user.role !== 'SUPER_ADMIN') {
        return NextResponse.json({ message: 'Not authorized' }, { status: 403 });
      }

      let queryParts = [];
      let updateValues = [];

      const fields = ['content'];
      fields.forEach(field => {
        if (params[field] !== undefined) {
          queryParts.push(`${field} = ?`);
          updateValues.push(params[field]);
        }
      });

      if (queryParts.length === 0) {
        return NextResponse.json({ message: 'No fields to update' }, { status: 400 });
      }

      // Add updated_at field
      queryParts.push('updated_at = ?');
      updateValues.push(new Date().toISOString());

      // Email must be the last value in updateValues (for the WHERE condition)
      updateValues.push(params.email);

      const result = await query(
        `UPDATE about_me SET ${queryParts.join(', ')} WHERE email = ?`,
        updateValues
      );

      if (result.affectedRows === 0) {
        return NextResponse.json({ message: 'No record updated. Email not found.' }, { status: 404 });
      }

      return NextResponse.json({ message: 'Successfully updated' }, { status: 200 });
    }

    return NextResponse.json({ message: 'Invalid request type' }, { status: 400 });

  } catch (error) {
    console.error('Error updating about_me:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
