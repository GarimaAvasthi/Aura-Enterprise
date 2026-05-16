require('dotenv').config()

const express = require('express')
const cors = require('cors')
const inventoryRoutes = require('./routes/inventoryRoutes')

const app = express()

const PORT = process.env.PORT || 5000

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:4173',
  process.env.FRONTEND_URL,
].filter(Boolean)

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, etc.)
      if (!origin) return callback(null, true)

      if (
        allowedOrigins.some((allowed) => origin.startsWith(allowed))
      ) {
        return callback(null, true)
      }

      // Allow any *.vercel.app origin for preview deployments
      if (origin.endsWith('.vercel.app')) {
        return callback(null, true)
      }

      callback(new Error('Not allowed by CORS'))
    },
    credentials: true,
  })
)

app.use(express.json())

app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Aura Enterprise API Running',
    endpoints: [
      '/api/inventory',
      '/api/inventory/metadata',
      '/api/inventory/kpis',
      '/api/inventory/low-stock',
      '/api/inventory/restock-priority',
      '/api/inventory/category-value',
      '/api/inventory/export',
    ],
  })
})

app.use('/api/inventory', inventoryRoutes)

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})