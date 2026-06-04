const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')
const apiRoutes = require('./routes')

dotenv.config()

const app = express()
const port = process.env.PORT || 5000

app.use(cors())
app.use(express.json())
app.use('/api', apiRoutes)

app.use((err, req, res, next) => {
  console.error(err)
  res.status(500).json({ error: 'An unexpected server error occurred' })
})

app.listen(port, () => {
  console.log(`Backend running on http://localhost:${port}`)
})
