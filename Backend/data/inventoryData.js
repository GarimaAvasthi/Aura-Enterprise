const categories = [
  'Electronics',
  'Apparel',
  'Accessories',
  'Furniture',
  'Appliances',
  'Office',
]

const productFamilies = {
  Electronics: [
    'Laptop',
    'Monitor',
    'Tablet',
    'Router',
    'Camera',
    'Speaker',
    'Smartwatch',
    'Docking Station',
  ],
  Apparel: [
    'Jacket',
    'Hoodie',
    'Shirt',
    'Trousers',
    'Sneakers',
    'Cap',
    'Backpack',
    'Vest',
  ],
  Accessories: [
    'Keyboard',
    'Mouse',
    'Cable',
    'USB Hub',
    'Charger',
    'Headset',
    'Adapter',
    'Stand',
  ],
  Furniture: [
    'Desk',
    'Chair',
    'Shelf',
    'Cabinet',
    'Table',
    'Stool',
    'Locker',
    'Workbench',
  ],
  Appliances: [
    'Coffee Maker',
    'Microwave',
    'Air Purifier',
    'Fan',
    'Kettle',
    'Mini Fridge',
    'Vacuum',
    'Lamp',
  ],
  Office: [
    'Notebook',
    'Pen Set',
    'Planner',
    'Whiteboard',
    'Printer Paper',
    'File Box',
    'Label Roll',
    'Desk Mat',
  ],
}

const adjectives = [
  'Apex',
  'Core',
  'Prime',
  'Nova',
  'Atlas',
  'Pulse',
  'Vector',
  'Nexus',
]

const warehouses = [
  'North',
  'South',
  'East',
  'West',
  'Central',
]

const categoryProfiles = {
  Electronics: {
    priceMultiplier: 1.45,
    pricePremium: 240,
    stockOffset: -24,
  },
  Apparel: {
    priceMultiplier: 0.58,
    pricePremium: 35,
    stockOffset: 38,
  },
  Accessories: {
    priceMultiplier: 0.34,
    pricePremium: 18,
    stockOffset: 62,
  },
  Furniture: {
    priceMultiplier: 1.18,
    pricePremium: 160,
    stockOffset: -6,
  },
  Appliances: {
    priceMultiplier: 0.92,
    pricePremium: 120,
    stockOffset: 14,
  },
  Office: {
    priceMultiplier: 0.26,
    pricePremium: 8,
    stockOffset: 78,
  },
}

const getStatus = (stock) => {
  if (stock === 0) {
    return 'Out Of Stock'
  }

  if (stock <= 20) {
    return 'Low Stock'
  }

  return 'In Stock'
}

const inventoryData = Array.from(
  { length: 50050 },
  (_, index) => {
    const id = index + 1
    const category = categories[index % categories.length]
    const family =
      productFamilies[category][
        Math.floor(index / categories.length) %
          productFamilies[category].length
      ]
    const adjective = adjectives[index % adjectives.length]
    const warehouse = warehouses[index % warehouses.length]
    const profile = categoryProfiles[category]
    const baseStock =
      index % 997 === 0
        ? 0
        : 1 + ((index * 37 + index % 11) % 249)
    const stock =
      baseStock === 0
        ? 0
        : Math.max(
            1,
            Math.min(
              340,
              baseStock + profile.stockOffset + (index % 7) - 3
            )
          )
    const basePrice = 8 + ((index * 113) % 4992)
    const price = Math.max(
      8,
      Math.round(
        basePrice * profile.priceMultiplier + profile.pricePremium
      )
    )

    const popularity = Math.min(
      100,
      Math.max(0, Math.round(((index * 73 + 29) % 101)))
    )
    const rating = Math.round(
      (1 + (((index * 53 + 7) % 41) / 10)) * 10
    ) / 10

    return {
      id,
      name: `${adjective} ${family} ${String(id).padStart(5, '0')}`,
      sku: `SKU-${String(id).padStart(6, '0')}`,
      category,
      stock,
      price,
      warehouse,
      status: getStatus(stock),
      popularity,
      rating: Math.min(5, rating),
    }
  }
)

const startSimulation = () => {
  setInterval(() => {
    // Randomly update 500 items every second
    for (let i = 0; i < 500; i++) {
      const index = Math.floor(Math.random() * inventoryData.length)
      const item = inventoryData[index]

      // Change stock slightly more aggressively (-10 to 10)
      const change = Math.floor(Math.random() * 21) - 10
      item.stock = Math.floor(Math.max(0, Math.min(1000, item.stock + change)))
      item.status = getStatus(item.stock)
    }
  }, 1000)
}

startSimulation()

module.exports = {
  categories,
  inventoryData,
}
