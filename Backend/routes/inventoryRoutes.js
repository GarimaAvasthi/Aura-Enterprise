const express = require('express')

const router = express.Router()

const {
  categories,
  inventoryData,
} = require('../data/inventoryData')

const parseNumber = (value, fallback) => {
  const parsed = Number(value)

  return Number.isFinite(parsed) ? parsed : fallback
}

const getFilteredData = (query) => {
  const search = String(query.search || '').trim().toLowerCase()
  const category = String(query.category || 'all')
  const minStock = parseNumber(query.minStock, 0)
  const maxStock = parseNumber(query.maxStock, 999999)
  const minPrice = parseNumber(query.minPrice, 0)
  const maxPrice = parseNumber(query.maxPrice, 99999999)

  return inventoryData.filter((item) => {
    const matchesSearch =
      search.length === 0 ||
      item.name.toLowerCase().includes(search) ||
      item.sku.toLowerCase().includes(search) ||
      item.category.toLowerCase().includes(search)

    const matchesCategory =
      category === 'all' || item.category === category

    const matchesStock =
      item.stock >= minStock && item.stock <= maxStock

    const matchesPrice =
      item.price >= minPrice && item.price <= maxPrice

    return (
      matchesSearch &&
      matchesCategory &&
      matchesStock &&
      matchesPrice
    )
  })
}

const sortData = (data, sortField, sortOrder) => {
  const allowedFields = new Set([
    'name',
    'sku',
    'category',
    'stock',
    'price',
    'status',
    'popularity',
    'rating',
  ])

  if (!allowedFields.has(sortField)) {
    return data
  }

  return [...data].sort((a, b) => {
    const aValue = a[sortField]
    const bValue = b[sortField]

    if (aValue < bValue) {
      return sortOrder === 'desc' ? 1 : -1
    }

    if (aValue > bValue) {
      return sortOrder === 'desc' ? -1 : 1
    }

    return 0
  })
}

const toCsvValue = (value) => {
  const stringValue = String(value)

  if (
    stringValue.includes(',') ||
    stringValue.includes('"') ||
    stringValue.includes('\n')
  ) {
    return `"${stringValue.replace(/"/g, '""')}"`
  }

  return stringValue
}

router.get('/', (req, res) => {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1)
  const limit = Math.min(
    Math.max(parseInt(req.query.limit, 10) || 50, 1),
    50
  )
  const sortField = String(req.query.sortField || '')
  const sortOrder =
    String(req.query.sortOrder || 'asc') === 'desc'
      ? 'desc'
      : 'asc'

  const filteredData = sortData(
    getFilteredData(req.query),
    sortField,
    sortOrder
  )
  const startIndex = (page - 1) * limit
  const paginatedData = filteredData.slice(
    startIndex,
    startIndex + limit
  )

  res.json({
    total: filteredData.length,
    page,
    limit,
    products: paginatedData,
  })
})

router.get('/metadata', (req, res) => {
  const prices = inventoryData.map((item) => item.price)
  const stocks = inventoryData.map((item) => item.stock)

  res.json({
    categories,
    stock: {
      min: Math.min(...stocks),
      max: Math.max(...stocks),
    },
    price: {
      min: Math.min(...prices),
      max: Math.max(...prices),
    },
  })
})

router.get('/kpis', (req, res) => {
  const data = getFilteredData(req.query)
  const totalSkus = data.length
  const inventoryValue = data.reduce(
    (sum, item) => sum + item.price * item.stock,
    0
  )
  const outOfStock = data.filter((item) => item.stock === 0).length
  const lowStock = data.filter(
    (item) => item.stock > 0 && item.stock <= 20
  ).length

  res.json({
    totalSkus,
    inventoryValue,
    outOfStock,
    lowStock,
  })
})

router.get('/low-stock', (req, res) => {
  const data = getFilteredData(req.query)
  const sortedProducts = [...data]
    .filter((item) => item.stock > 0 && item.stock <= 20)
    .sort((a, b) => b.popularity - a.popularity)

  const products = []
  const categoryCount = {}

  for (const item of sortedProducts) {
    const count = categoryCount[item.category] || 0
    if (count < 2) {
      products.push(item)
      categoryCount[item.category] = count + 1
    }

    if (products.length === 10) break
  }

  res.json({
    products,
  })
})

router.get('/restock-priority', (req, res) => {
  const data = getFilteredData(req.query)
  const sorted = [...data]
    .filter((item) => item.stock <= 25)
    .sort((a, b) => a.stock - b.stock || b.price - a.price)

  const products = []
  const categoryCount = {}

  for (const item of sorted) {
    const count = categoryCount[item.category] || 0
    if (count < 2) {
      products.push({
        ...item,
        priority:
          item.stock === 0
            ? 'Critical'
            : item.stock <= 10
              ? 'Urgent'
              : 'Monitor',
      })
      categoryCount[item.category] = count + 1
    }

    if (products.length === 8) break
  }

  res.json({
    products,
  })
})

router.get('/category-value', (req, res) => {
  const data = getFilteredData(req.query)
  const categoryTotals = data.reduce((totals, item) => {
    const value = item.price * item.stock

    totals[item.category] = (totals[item.category] || 0) + value

    return totals
  }, {})
  const totalValue = Object.values(categoryTotals).reduce(
    (sum, value) => sum + value,
    0
  )

  res.json({
    totalValue,
    categories: Object.entries(categoryTotals).map(
      ([name, value]) => ({
        name,
        value,
        percentage:
          totalValue === 0
            ? 0
            : Number(((value / totalValue) * 100).toFixed(1)),
      })
    ),
  })
})

router.get('/export', (req, res) => {
  const sortField = String(req.query.sortField || '')
  const sortOrder =
    String(req.query.sortOrder || 'asc') === 'desc'
      ? 'desc'
      : 'asc'
  const filteredData = sortData(
    getFilteredData(req.query),
    sortField,
    sortOrder
  )
  const headers = [
    'SKU',
    'Product',
    'Category',
    'Stock',
    'Price',
    'Status',
    'Warehouse',
  ]
  const rows = filteredData.map((item) => [
    item.sku,
    item.name,
    item.category,
    item.stock,
    item.price,
    item.status,
    item.warehouse,
  ])
  const csv = [headers, ...rows]
    .map((row) => row.map(toCsvValue).join(','))
    .join('\n')

  res.setHeader('Content-Type', 'text/csv')
  res.setHeader(
    'Content-Disposition',
    'attachment; filename="inventory-export.csv"'
  )
  res.send(csv)
})

module.exports = router
