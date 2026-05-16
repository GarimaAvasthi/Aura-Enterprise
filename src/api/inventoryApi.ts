import axios from 'axios'

const VITE_API_URL = import.meta.env.VITE_API_URL
const BASE_URL = VITE_API_URL ? VITE_API_URL.replace(/\/$/, '') : 'http://localhost:5000'
const API_URL = `${BASE_URL}/api/products`

export type SortOrder = 'asc' | 'desc'

export type InventoryItem = {
  id: number
  name: string
  sku: string
  category: string
  stock: number
  price: number
  warehouse: string
  status: 'In Stock' | 'Low Stock' | 'Out Of Stock'
  popularity: number
  rating: number
}

export type InventoryFilters = {
  page?: number
  limit?: number
  search?: string
  category?: string
  minStock?: number
  maxStock?: number
  minPrice?: number
  maxPrice?: number
  sortField?: string
  sortOrder?: SortOrder
}

export type InventoryMetadata = {
  categories: string[]
  stock: {
    min: number
    max: number
  }
  price: {
    min: number
    max: number
  }
}

type RequestOptions = {
  signal?: AbortSignal
}

const buildParams = (filters: InventoryFilters) => {
  const params = new URLSearchParams()

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      params.set(key, String(value))
    }
  })

  return params
}
export const getUrlFilters = (searchParams: URLSearchParams): InventoryFilters => {
  const q = searchParams.get('q')
  const cat = searchParams.get('cat')
  const mins = searchParams.get('mins')
  const maxs = searchParams.get('maxs')
  const minp = searchParams.get('minp')
  const maxp = searchParams.get('maxp')
  const sort = searchParams.get('sort')
  const order = searchParams.get('order')

  const filters: InventoryFilters = {}
  if (q) filters.search = q
  if (cat) filters.category = cat
  if (mins) filters.minStock = Number(mins)
  if (maxs) filters.maxStock = Number(maxs)
  if (minp) filters.minPrice = Number(minp)
  if (maxp) filters.maxPrice = Number(maxp)
  if (sort) filters.sortField = sort
  if (order) filters.sortOrder = order as SortOrder

  return filters
}

export const fetchInventory = async (
  filters: InventoryFilters,
  options: RequestOptions = {}
) => {
  const response = await axios.get(`${API_URL}`, {
    params: buildParams(filters),
    signal: options.signal,
  })

  return response.data as {
    total: number
    page: number
    limit: number
    products: InventoryItem[]
  }
}

export const fetchInventoryMetadata = async (
  options: RequestOptions = {}
) => {
  const response = await axios.get(`${API_URL}/metadata`, {
    signal: options.signal,
  })

  return response.data as InventoryMetadata
}

export const fetchInventoryKpis = async (
  filters: InventoryFilters = {},
  options: RequestOptions = {}
) => {
  const response = await axios.get(`${API_URL}/kpis`, {
    params: buildParams(filters),
    signal: options.signal,
  })

  return response.data as {
    totalSkus: number
    inventoryValue: number
    outOfStock: number
    lowStock: number
  }
}

export const fetchLowStockProducts = async (
  filters: InventoryFilters = {},
  options: RequestOptions = {}
) => {
  const response = await axios.get(`${API_URL}/low-stock`, {
    params: buildParams(filters),
    signal: options.signal,
  })

  return response.data as {
    products: InventoryItem[]
  }
}

export const fetchRestockPriority = async (
  filters: InventoryFilters = {},
  options: RequestOptions = {}
) => {
  const response = await axios.get(`${API_URL}/restock-priority`, {
    params: buildParams(filters),
    signal: options.signal,
  })

  return response.data as {
    products: Array<
      InventoryItem & {
        priority: 'Critical' | 'Urgent' | 'Monitor'
      }
    >
  }
}

export const fetchCategoryValueBreakdown = async (
  filters: InventoryFilters = {},
  options: RequestOptions = {}
) => {
  const response = await axios.get(`${API_URL}/category-value`, {
    params: buildParams(filters),
    signal: options.signal,
  })

  return response.data as {
    totalValue: number
    categories: Array<{
      name: string
      value: number
      percentage: number
    }>
  }
}

export const exportInventoryCsv = async (
  filters: InventoryFilters
) => {
  const response = await axios.get(`${API_URL}/export`, {
    params: buildParams(filters),
    responseType: 'blob',
  })

  return response.data as Blob
}
