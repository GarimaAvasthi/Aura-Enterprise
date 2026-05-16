import { useMemo, useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  keepPreviousData,
  useQuery,
} from '@tanstack/react-query'
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from 'lucide-react'

import {
  exportInventoryCsv,
  fetchInventory,
  fetchInventoryMetadata,
  type SortOrder,
} from '../../api/inventoryApi'
import useDebounce from '../../hooks/useDebounce'

const PAGE_SIZE = 50

type FilterState = {
  category: string
  minStock: number
  maxStock: number
  minPrice: number
  maxPrice: number
}

const FALLBACK_FILTERS: FilterState = {
  category: 'all',
  minStock: 0,
  maxStock: 250,
  minPrice: 0,
  maxPrice: 5000,
}

const SORT_PRESETS = [
  { label: 'Recommended', field: '', order: 'asc' as SortOrder },
  { label: 'Price: Low to High', field: 'price', order: 'asc' as SortOrder },
  { label: 'Price: High to Low', field: 'price', order: 'desc' as SortOrder },
  { label: 'Popularity', field: 'popularity', order: 'desc' as SortOrder },
  { label: 'Rating', field: 'rating', order: 'desc' as SortOrder },
]

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value)

const SkeletonRow = () => (
  <tr className='border-b border-gray-100 dark:border-gray-800'>
    {Array.from({ length: 6 }).map((_, i) => (
      <td key={i} className='p-4 md:p-5'>
        <div
          className='h-4 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse'
          style={{ width: `${55 + (i * 17) % 40}%` }}
        />
      </td>
    ))}
  </tr>
)

const InventoryTable = () => {
  const [searchParams, setSearchParams] = useSearchParams()

  const [page, setPage] = useState(() => Number(searchParams.get('page')) || 1)
  const [search, setSearch] = useState(() => searchParams.get('q') || '')
  const [draftFilters, setDraftFilters] =
    useState<FilterState | null>(null)
  const [appliedFilters, setAppliedFilters] = useState<FilterState | null>(
    () => {
      const cat = searchParams.get('cat')
      const mins = searchParams.get('mins')
      const maxs = searchParams.get('maxs')
      const minp = searchParams.get('minp')
      const maxp = searchParams.get('maxp')
      if (cat || mins || maxs || minp || maxp) {
        return {
          category: cat || 'all',
          minStock: Number(mins) || 0,
          maxStock: Number(maxs) || 250,
          minPrice: Number(minp) || 0,
          maxPrice: Number(maxp) || 5000,
        }
      }
      return null
    }
  )
  const [exporting, setExporting] = useState(false)
  const [sortField, setSortField] = useState(
    () => searchParams.get('sort') || ''
  )
  const [sortOrder, setSortOrder] = useState<SortOrder>(
    () => (searchParams.get('order') as SortOrder) || 'asc'
  )
  const [sortPreset, setSortPreset] = useState(
    () => searchParams.get('preset') || 'Recommended'
  )

  const debouncedSearch = useDebounce(search, 500)

  // Sync state to URL
  useEffect(() => {
    const params: Record<string, string> = {}
    if (page > 1) params.page = String(page)
    if (debouncedSearch) params.q = debouncedSearch
    if (sortField) params.sort = sortField
    if (sortOrder === 'desc') params.order = 'desc'
    if (sortPreset && sortPreset !== 'Recommended')
      params.preset = sortPreset

    if (appliedFilters) {
      if (appliedFilters.category !== 'all')
        params.cat = appliedFilters.category
      params.mins = String(appliedFilters.minStock)
      params.maxs = String(appliedFilters.maxStock)
      params.minp = String(appliedFilters.minPrice)
      params.maxp = String(appliedFilters.maxPrice)
    }

    setSearchParams(params, { replace: true })
  }, [
    page,
    debouncedSearch,
    appliedFilters,
    sortField,
    sortOrder,
    sortPreset,
    setSearchParams,
  ])

  const { data: metadata } = useQuery({
    queryKey: ['inventory', 'metadata'],
    queryFn: ({ signal }) => fetchInventoryMetadata({ signal }),
    staleTime: 5 * 60_000,
  })

  const filterDefaults = useMemo(
    () =>
      metadata
        ? {
            category: 'all',
            minStock: metadata.stock.min,
            maxStock: metadata.stock.max,
            minPrice: metadata.price.min,
            maxPrice: metadata.price.max,
          }
        : FALLBACK_FILTERS,
    [metadata]
  )

  const activeDraftFilters = draftFilters ?? filterDefaults
  const activeAppliedFilters = appliedFilters ?? filterDefaults

  const stockMin = metadata?.stock.min ?? 0
  const stockMax = metadata?.stock.max ?? 250
  const stockRange = Math.max(stockMax - stockMin, 1)
  const stockMinPercent =
    ((activeDraftFilters.minStock - stockMin) / stockRange) * 100
  const stockMaxPercent =
    ((activeDraftFilters.maxStock - stockMin) / stockRange) * 100

  const currentFilters = useMemo(
    () => ({
      page,
      limit: PAGE_SIZE,
      search: debouncedSearch,
      ...activeAppliedFilters,
      sortField,
      sortOrder,
    }),
    [
      page,
      debouncedSearch,
      activeAppliedFilters,
      sortField,
      sortOrder,
    ]
  )

  const exportFilters = useMemo(
    () => ({
      search: debouncedSearch,
      ...activeAppliedFilters,
      sortField,
      sortOrder,
    }),
    [debouncedSearch, activeAppliedFilters, sortField, sortOrder]
  )

  const {
    data: inventoryResponse,
    isFetching,
    isPending,
  } = useQuery({
    queryKey: ['inventory', 'products', currentFilters],
    queryFn: ({ signal }) =>
      fetchInventory(currentFilters, { signal }),
    enabled: Boolean(metadata),
    placeholderData: keepPreviousData,
    refetchInterval: 10000,
  })

  const products = inventoryResponse?.products ?? []
  const totalProducts = inventoryResponse?.total ?? 0
  const loading = isPending

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(totalProducts / PAGE_SIZE)),
    [totalProducts]
  )

  const resetPage = () => {
    setPage(1)
  }

  const handleSort = (field: string) => {
    resetPage()
    setSortPreset('')

    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
      return
    }

    setSortField(field)
    setSortOrder(field === 'price' ? 'desc' : 'asc')
  }

  const handleSortPreset = (label: string) => {
    const preset = SORT_PRESETS.find((p) => p.label === label)
    if (!preset) return

    setSortPreset(label)
    setSortField(preset.field)
    setSortOrder(preset.order)
    resetPage()
  }

  const handleStockChange = (
    field: 'min' | 'max',
    value: number
  ) => {
    const nextFilters = { ...activeDraftFilters }

    if (field === 'min') {
      nextFilters.minStock = Math.min(
        value,
        activeDraftFilters.maxStock
      )
    } else {
      nextFilters.maxStock = Math.max(
        value,
        activeDraftFilters.minStock
      )
    }

    setDraftFilters(nextFilters)
  }

  const handlePriceChange = (
    field: 'min' | 'max',
    value: number
  ) => {
    const nextFilters = { ...activeDraftFilters }

    if (field === 'min') {
      nextFilters.minPrice = Math.min(
        value,
        activeDraftFilters.maxPrice
      )
    } else {
      nextFilters.maxPrice = Math.max(
        value,
        activeDraftFilters.minPrice
      )
    }

    setDraftFilters(nextFilters)
  }

  const handleApplyFilters = () => {
    setAppliedFilters(activeDraftFilters)
    setPage(1)
  }

  const handleResetFilters = () => {
    setDraftFilters(null)
    setAppliedFilters(null)
    setPage(1)
  }

  const handleExport = async () => {
    setExporting(true)

    try {
      const csvBlob = await exportInventoryCsv(exportFilters)
      const url = URL.createObjectURL(csvBlob)
      const link = document.createElement('a')

      link.href = url
      link.download = 'inventory-export.csv'
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Failed to export inventory CSV', error)
    } finally {
      setExporting(false)
    }
  }

  const renderSortIcon = (field: string) => {
    if (sortField !== field) {
      return (
        <ArrowUpDown
          size={14}
          className='inline-block ml-1.5 opacity-0 group-hover:opacity-50 transition-opacity'
        />
      )
    }

    const Icon = sortOrder === 'asc' ? ArrowUp : ArrowDown

    return (
      <Icon
        size={14}
        className='inline-block ml-1.5 text-orange-500'
      />
    )
  }

  return (
    <div className='bg-white dark:bg-gray-950 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 mt-6 md:mt-8 overflow-hidden'>
      <div className='p-4 md:p-6 border-b border-gray-100 dark:border-gray-800'>
        <div className='flex flex-col xl:flex-row gap-4 xl:items-center xl:justify-between'>
          <div>
            <h2 className='text-lg md:text-2xl font-bold text-gray-900 dark:text-white'>
              Inventory Management
            </h2>
          </div>

          <div className='flex flex-wrap gap-2 md:gap-3'>
            <input
              type='text'
              placeholder='Search products or SKU...'
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                resetPage()
              }}
              className='flex-1 min-w-[180px] bg-[#F8F6F4] dark:bg-gray-900 dark:text-gray-100 dark:placeholder:text-gray-500 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-orange-400'
            />

            <select
              value={sortPreset}
              onChange={(e) => handleSortPreset(e.target.value)}
              className='bg-[#F8F6F4] dark:bg-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-orange-400 cursor-pointer'
            >
              <option value='' disabled>
                Sort by...
              </option>
              {SORT_PRESETS.map((preset) => (
                <option key={preset.label} value={preset.label}>
                  {preset.label}
                </option>
              ))}
            </select>

            <button
              type='button'
              onClick={handleExport}
              disabled={exporting || isFetching}
              className='bg-orange-500 hover:bg-orange-600 transition-all duration-200 text-white px-5 py-2.5 rounded-xl text-sm font-medium disabled:opacity-60 whitespace-nowrap'
            >
              {exporting ? 'Exporting...' : 'Export CSV'}
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className='mt-5 grid grid-cols-1 gap-4 rounded-2xl bg-[#F8F6F4] dark:bg-gray-900 p-4 md:grid-cols-2 xl:grid-cols-[minmax(170px,1fr)_minmax(220px,1fr)_minmax(260px,1fr)_auto] xl:items-end'>
          <label className='flex flex-col gap-1.5 text-sm font-medium text-gray-600 dark:text-gray-300'>
            Category
            <select
              value={activeDraftFilters.category}
              onChange={(e) =>
                setDraftFilters({
                  ...activeDraftFilters,
                  category: e.target.value,
                })
              }
              className='h-10 bg-white dark:bg-gray-950 dark:text-gray-100 border border-gray-200 dark:border-gray-700 rounded-xl px-3 text-sm outline-none focus:ring-2 focus:ring-orange-400'
            >
              <option value='all'>All categories</option>
              {metadata?.categories.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>

          <div className='flex flex-col gap-1.5 text-sm font-medium text-gray-600 dark:text-gray-300'>
            <div className='flex items-center justify-between'>
              <span>Stock level</span>
              <span className='text-xs text-gray-400'>
                {activeDraftFilters.minStock} –{' '}
                {activeDraftFilters.maxStock}
              </span>
            </div>

            <div className='rounded-xl border border-gray-200 bg-white px-4 py-2.5 dark:border-gray-700 dark:bg-gray-950'>
              <div className='relative h-6'>
                <div className='absolute left-0 right-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-gray-200 dark:bg-gray-700'></div>
                <div
                  className='absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-orange-500'
                  style={{
                    left: `${stockMinPercent}%`,
                    right: `${100 - stockMaxPercent}%`,
                  }}
                ></div>
                <input
                  type='range'
                  min={stockMin}
                  max={stockMax}
                  value={activeDraftFilters.minStock}
                  onChange={(e) =>
                    handleStockChange('min', Number(e.target.value))
                  }
                  className='pointer-events-none absolute inset-x-0 top-1/2 z-10 h-1.5 w-full -translate-y-1/2 appearance-none bg-transparent accent-orange-500 [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:bg-orange-500 [&::-webkit-slider-thumb]:shadow-md'
                />
                <input
                  type='range'
                  min={stockMin}
                  max={stockMax}
                  value={activeDraftFilters.maxStock}
                  onChange={(e) =>
                    handleStockChange('max', Number(e.target.value))
                  }
                  className='pointer-events-none absolute inset-x-0 top-1/2 z-20 h-1.5 w-full -translate-y-1/2 appearance-none bg-transparent accent-orange-500 [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:bg-orange-500 [&::-webkit-slider-thumb]:shadow-md'
                />
              </div>

              <div className='flex items-center justify-between text-[11px] text-gray-400'>
                <span>{stockMin}</span>
                <span>{stockMax}</span>
              </div>
            </div>
          </div>

          <div className='flex flex-col gap-1.5 text-sm font-medium text-gray-600 dark:text-gray-300'>
            <div className='flex items-center justify-between'>
              <span>Price range</span>
              <span className='text-xs text-gray-400'>
                {formatCurrency(activeDraftFilters.minPrice)} –{' '}
                {formatCurrency(activeDraftFilters.maxPrice)}
              </span>
            </div>
            <div className='grid grid-cols-2 gap-2'>
              <label className='flex flex-col gap-1'>
                <span className='text-xs text-gray-400'>Min</span>
                <input
                  type='number'
                  min={metadata?.price.min ?? 0}
                  max={metadata?.price.max ?? 5000}
                  value={activeDraftFilters.minPrice}
                  onChange={(e) =>
                    handlePriceChange('min', Number(e.target.value))
                  }
                  className='h-10 bg-white dark:bg-gray-950 dark:text-gray-100 border border-gray-200 dark:border-gray-700 rounded-xl px-3 text-sm outline-none focus:ring-2 focus:ring-orange-400'
                />
              </label>

              <label className='flex flex-col gap-1'>
                <span className='text-xs text-gray-400'>Max</span>
                <input
                  type='number'
                  min={metadata?.price.min ?? 0}
                  max={metadata?.price.max ?? 5000}
                  value={activeDraftFilters.maxPrice}
                  onChange={(e) =>
                    handlePriceChange('max', Number(e.target.value))
                  }
                  className='h-10 bg-white dark:bg-gray-950 dark:text-gray-100 border border-gray-200 dark:border-gray-700 rounded-xl px-3 text-sm outline-none focus:ring-2 focus:ring-orange-400'
                />
              </label>
            </div>
          </div>

          <div className='flex gap-2 md:col-span-2 xl:col-span-1'>
            <button
              type='button'
              onClick={handleResetFilters}
              className='h-10 flex-1 rounded-xl border border-gray-200 bg-white px-4 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-200 dark:hover:bg-gray-800 xl:flex-none'
            >
              Reset
            </button>

            <button
              type='button'
              onClick={handleApplyFilters}
              className='h-10 flex-1 rounded-xl bg-gray-900 px-5 text-sm font-medium text-white transition-colors hover:bg-gray-800 dark:bg-orange-500 dark:hover:bg-orange-600 xl:flex-none'
            >
              Apply
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className='max-h-[560px] overflow-auto dark:bg-gray-950'>
        <table className='w-full min-w-[800px]'>
          <thead className='bg-[#F8F6F4] dark:bg-gray-900 sticky top-0 z-10 shadow-sm dark:shadow-black/30'>
            <tr>
              {[
                ['name', 'Product'],
                ['sku', 'SKU'],
                ['category', 'Category'],
                ['stock', 'Stock'],
                ['price', 'Price'],
                ['status', 'Status'],
              ].map(([field, label]) => (
                <th
                  key={field}
                  onClick={() => handleSort(field)}
                  className='group text-left p-4 md:p-5 text-gray-500 dark:text-gray-400 text-xs md:text-sm font-semibold cursor-pointer whitespace-nowrap select-none hover:text-gray-700 dark:hover:text-gray-200 transition-colors'
                >
                  {label}
                  {renderSortIcon(field)}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {loading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <SkeletonRow key={i} />
              ))
            ) : products.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className='p-10 text-center text-gray-500 dark:text-gray-400'
                >
                  No products match the current filters.
                </td>
              </tr>
            ) : (
              products.map((item) => (
                <tr
                  key={item.id}
                  className='border-b border-gray-100 dark:border-gray-800 hover:bg-orange-50/60 dark:hover:bg-gray-900/80 transition-colors duration-150'
                >
                  <td className='p-4 md:p-5 font-semibold text-sm text-gray-900 dark:text-white'>
                    {item.name}
                  </td>
                  <td className='p-4 md:p-5 text-sm text-gray-500 dark:text-gray-400 font-mono'>
                    {item.sku}
                  </td>
                  <td className='p-4 md:p-5 text-sm text-gray-500 dark:text-gray-400'>
                    {item.category}
                  </td>
                  <td className='p-4 md:p-5 text-sm font-medium text-gray-900 dark:text-gray-100'>
                    {item.stock}
                  </td>
                  <td className='p-4 md:p-5 text-sm font-medium text-gray-900 dark:text-gray-100'>
                    {formatCurrency(item.price)}
                  </td>
                  <td className='p-4 md:p-5'>
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                        item.status === 'In Stock'
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300'
                          : item.status === 'Low Stock'
                            ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300'
                            : 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300'
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className='p-4 md:p-6 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between border-t border-gray-100 dark:border-gray-800'>
        <p className='text-gray-500 dark:text-gray-400 text-sm'>
          Page {page} of {totalPages}
        </p>

        <div className='flex items-center gap-2'>
          <button
            type='button'
            disabled={page === 1 || loading}
            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
            className='px-4 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors'
          >
            Previous
          </button>

          <button
            type='button'
            disabled={page >= totalPages || loading}
            onClick={() =>
              setPage((prev) => Math.min(prev + 1, totalPages))
            }
            className='px-4 py-2 text-sm rounded-xl bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors'
          >
            Next
          </button>
        </div>
      </div>
    </div>
  )
}

export default InventoryTable
