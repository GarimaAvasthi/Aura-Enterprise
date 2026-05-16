import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts'

import {
  fetchLowStockProducts,
  getUrlFilters,
} from '../../api/inventoryApi'

const MAX_ITEMS = 10

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null
  const item = payload[0]

  return (
    <div className='bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-3 shadow-xl'>
      <p className='text-sm font-semibold text-gray-900 dark:text-white'>
        {item.payload.name}
      </p>
      <p className='text-sm text-gray-500 dark:text-gray-400 mt-1'>
        Stock:{' '}
        <span className='font-bold text-blue-600 dark:text-blue-400'>
          {item.value}
        </span>
      </p>
    </div>
  )
}

const SkeletonChart = () => (
  <div className='h-[280px] md:h-[320px] flex items-end justify-between gap-1.5 px-2 pb-8'>
    {[40, 75, 55, 85, 45, 65, 30, 90, 50, 70].map((h, i) => (
      <div key={i} className='flex flex-col items-center gap-3 w-full'>
        <div
          className='w-full bg-gray-200 dark:bg-gray-700 rounded-t-lg animate-pulse'
          style={{ height: `${h}%` }}
        />
        <div className='h-2 w-6 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse' />
      </div>
    ))}
  </div>
)

const LowStockBarChart = () => {
  const [searchParams] = useSearchParams()
  const filters = getUrlFilters(searchParams)

  const { data: response, isLoading } = useQuery({
    queryKey: ['inventory', 'low-stock', filters],
    queryFn: ({ signal }) => fetchLowStockProducts(filters, { signal }),
    staleTime: 0,
    refetchInterval: 10000,
  })

  const products = useMemo(
    () =>
      (response?.products ?? [])
        .slice(0, MAX_ITEMS)
        .map((product) => ({
          ...product,
          label: product.sku,
        })),
    [response]
  )

  return (
    <div className='bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 p-5 md:p-6'>
      <div className='mb-5'>
        <h2 className='text-lg md:text-xl font-bold text-gray-900 dark:text-white'>
          Risk Assessment
        </h2>
      </div>

      {isLoading ? (
        <SkeletonChart />
      ) : (
        <div className='h-[280px] md:h-[320px]'>
          <ResponsiveContainer width='100%' height='100%'>
            <BarChart
              data={products}
              layout='horizontal'
              margin={{ top: 10, right: 10, left: -20, bottom: 20 }}
            >
              <defs>
                <linearGradient id='barGradient' x1='0' y1='0' x2='0' y2='1'>
                  <stop offset='0%' stopColor='#3B82F6' stopOpacity={1} />
                  <stop offset='100%' stopColor='#1E3A8A' stopOpacity={1} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray='3 3'
                horizontal={true}
                vertical={false}
                stroke='#e5e7eb'
              />
              <XAxis
                dataKey='label'
                type='category'
                tick={{ fill: '#64748b', fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                interval={0}
              />
              <YAxis
                type='number'
                tick={{ fill: '#94a3b8', fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                content={<CustomTooltip />}
                cursor={{ fill: 'rgba(59,130,246,0.06)' }}
              />
              <Bar
                dataKey='stock'
                fill='url(#barGradient)'
                radius={[6, 6, 0, 0]}
                barSize={32}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}

export default LowStockBarChart
