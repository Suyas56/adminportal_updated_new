const mysql = require('serverless-mysql');

const db = mysql({
  config: {
    host: process.env.MYSQL_HOST,
    database: process.env.MYSQL_DATABASE,
    user: process.env.MYSQL_USERNAME,
    password: process.env.MYSQL_PASSWORD,
    port: parseInt(process.env.MYSQL_PORT, 10),
    connectTimeout: 60000, // 60 seconds
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0
  },
});

// Validate environment variables at startup
if (
  !process.env.MYSQL_HOST ||
  !process.env.MYSQL_DATABASE ||
  !process.env.MYSQL_USERNAME ||
  !process.env.MYSQL_PASSWORD ||
  !process.env.MYSQL_PORT
) {
  throw new Error('Missing one or more required MySQL environment variables.');
}

/**
 * Executes a MySQL query.
 * @param {string} q - The SQL query string.
 * @param {Array<string|number>} [values=[]] - Query parameters to be escaped.
 * @returns {Promise<any>} - The query result.
 */
async function query(q, values = [], retries = 3) {
  let lastError;
  
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const results = await db.query(q, values);
      await db.end();
      return results;
    } catch (error) {
      lastError = error;
      console.error(`Query attempt ${attempt} failed:`, error);
      
      if (attempt < retries) {
        // Wait before retrying (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
        continue;
      }
    }
  }
  
  throw new Error(`Database query failed after ${retries} attempts: ${lastError.message}`);
}

/**
 * Closes the MySQL connection.
 * Use this explicitly if required in your workflow.
 */
async function closeConnection() {
  try {
    await db.end();
  } catch (e) {
    console.error('Error closing MySQL connection:', e);
  }
}

module.exports = {
  db,
  query,
  closeConnection,
};
