const express = require('express')
const cors = require('cors')
const inventoryRoutes = require('./routes/inventoryRoutes')

const app = express()

const allowedOrigins = [
  'http://localhost:5173',
  process.env.FRONTEND_URL,
].filter(Boolean)

app.use(cors({
  origin: allowedOrigins,
}))

app.use(express.json())

app.get('/', (req, res) => {
  res.send('Aura Enterprise Backend Running')
})


app.use('/api/inventory', inventoryRoutes)

app.listen(5000, () => {
  console.log('Server running on port 5000')
})