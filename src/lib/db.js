import mysql from 'mysql2/promise'

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  database: process.env.MYSQL_DATABASE,
  user: process.env.MYSQL_USERNAME,
  password: process.env.MYSQL_PASSWORD,
  port: process.env.MYSQL_PORT,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  namedPlaceholders: true
})

export async function query(sql, values) {
  try {
    const [rows] = await pool.execute(sql, values)
    return rows
  } catch (error) {
    console.error('Database Error:', error)
    throw error
  }
} 