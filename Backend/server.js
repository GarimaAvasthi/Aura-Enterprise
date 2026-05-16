const express = require('express')

const cors = require('cors')

const inventoryRoutes = require('./routes/inventoryRoutes')

const app = express()

app.use(cors())

app.use(express.json())

app.get('/', (req, res) => {
  res.send('Aura Enterprise Backend Running')
})
app.get("/api/products", (req, res) => {
  res.json({
    success: true,
    data: [
      {
        id: 1,
        name: "Demo Product",
        stock: 25
      }
    ]
  });
});

app.use('/api/inventory', inventoryRoutes)

app.listen(5000, () => {
  console.log('Server running on port 5000')
})