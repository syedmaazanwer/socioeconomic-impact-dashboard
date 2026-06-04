const sql = require('mssql')
const dotenv = require('dotenv')

dotenv.config()

const config = {
  server: process.env.DB_SERVER || 'localhost',
  port: Number(process.env.DB_PORT) || 1433,
  database: process.env.DB_NAME || 'socioeconomic_impact_db',
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
}

const pool = new sql.ConnectionPool(config)
const poolConnect = pool.connect().catch((err) => {
  console.error('Database connection failed:', err)
  process.exit(1)
})

module.exports = {
  sql,
  pool,
  poolConnect,
}
