// This file should be in the root of your src directory
import { NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request) {
  const token = await getToken({ req: request })
  console.log("Token in middleware:", token)
  
  return NextResponse.next()
}

export const config = {
  matcher: '/api/:path*',
} 