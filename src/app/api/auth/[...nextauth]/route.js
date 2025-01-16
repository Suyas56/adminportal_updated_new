import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import mysql from 'mysql2/promise'
import { ROLES, ROLE_NAMES } from '@/lib/roles'

// Create connection pool
const pool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  database: process.env.MYSQL_DATABASE,
  user: process.env.MYSQL_USERNAME,
  password: process.env.MYSQL_PASSWORD,
  port: process.env.MYSQL_PORT,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
})

// Helper function for database queries
async function query(sql, values) {
  const [rows] = await pool.execute(sql, values)
  return rows
}

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.NEXT_GOOGLE_ID,
      clientSecret: process.env.NEXT_GOOGLE_SECRET,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
          hd: "nitp.ac.in"
        }
      }
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      try {
        const results = await query(
          `SELECT * FROM user WHERE email = ?`,
          [profile.email]
        )

        if (results.length === 0) {
          console.log("User not found in database")
          return false
        }

        // Add user data to the user object
        const userData = results[0]
        // Convert numeric role to string role
        const numericRole = parseInt(userData.role)
        user.numericRole = numericRole // Keep numeric role for database operations
        user.role = Object.keys(ROLES).find(key => ROLES[key] === numericRole) // Convert to string role
        user.department = userData.department
        user.administration = userData.administration
        user.designation = userData.designation

        return true
      } catch (error) {
        console.error("Database error:", error)
        return false
      }
    },
    async jwt({ token, user, account }) {
      if (account && user) {
        token.accessToken = account.access_token
        token.email = user.email
        token.numericRole = user.numericRole // Store numeric role in token
        token.role = user.role // Store string role in token
        token.department = user.department
        token.administration = user.administration
        token.designation = user.designation
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.accessToken = token.accessToken
        session.user.email = token.email
        session.user.numericRole = token.numericRole // Keep numeric role for database operations
        session.user.role = token.role // Use string role for frontend
        session.user.department = token.department
        session.user.administration = token.administration
        session.user.designation = token.designation
      }
      return session
    }
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  debug: process.env.NODE_ENV === 'development',
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST } 