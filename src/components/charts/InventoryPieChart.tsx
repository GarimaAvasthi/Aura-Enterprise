import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  Legend,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

import {
  fetchCategoryValueBreakdown,
  getUrlFilters,
} from '../../api/inventoryApi'

type CategoryValue = {
  name: string
  value: number
  percentage: number
}

const COLORS = [
  '#F97316',
  '#14B8A6',
  '#2563EB',
  '#F59E0B',
  '#BE123C',
  '#7C3AED',
]

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null
  const data = payload[0].payload as CategoryValue

  return (
    <div className='bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-3 shadow-xl'>
      <p className='text-sm font-semibold text-gray-900 dark:text-white'>
        {data.name}
      </p>
      <p className='text-sm text-gray-500 dark:text-gray-400 mt-1'>
        Share:{' '}
        <span className='font-bold text-orange-600 dark:text-orange-400'>
          {data.percentage}%
        </span>
      </p>
    </div>
  )
}

const SkeletonChart = () => (
  <div className='h-72 md:h-80 flex items-center justify-center'>
    <div className='w-48 h-48 rounded-full border-[20px] border-gray-200 dark:border-gray-700 animate-pulse' />
  </div>
)

const InventoryPieChart = () => {
  const [searchParams] = useSearchParams()
  const filters = getUrlFilters(searchParams)

  const { data, isLoading } = useQuery({
    queryKey: ['inventory', 'category-breakdown', filters],
    queryFn: ({ signal }) =>
      fetchCategoryValueBreakdown(filters, { signal }),
    staleTime: 0,
    refetchInterval: 10000,
  })

  const chartData = useMemo(
    () =>
      [...(data?.categories ?? [])].sort(
        (a, b) => b.value - a.value
      ),
    [data]
  )

  const topCategory = chartData[0]

  return (
    <div className='bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 p-5 md:p-6'>
      <div className='mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
        <div>
          <h2 className='text-lg md:text-xl font-bold text-gray-900 dark:text-white'>
            Portfolio Distribution
          </h2>
        </div>

        {topCategory ? (
          <div className='text-left sm:text-right'>
            <p className='text-xs font-semibold uppercase tracking-wide text-gray-400'>
              Largest
            </p>
            <p className='text-sm font-bold text-gray-900 dark:text-white'>
              {topCategory.name}
            </p>
          </div>
        ) : null}
      </div>

      {isLoading ? (
        <SkeletonChart />
      ) : (
        <div className='h-72 md:h-80'>
          <ResponsiveContainer width='100%' height='100%'>
            <PieChart>
              <defs>
                {COLORS.map((color, i) => (
                  <linearGradient
                    id={`grad-${i}`}
                    key={i}
                    x1='0'
                    y1='0'
                    x2='0'
                    y2='1'
                  >
                    <stop
                      offset='0%'
                      stopColor={color}
                      stopOpacity={1}
                    />
                    <stop
                      offset='100%'
                      stopColor={color}
                      stopOpacity={0.7}
                    />
                  </linearGradient>
                ))}
                <filter id='shadow' height='150%' width='150%'>
                  <feDropShadow
                    dx='1'
                    dy='2'
                    stdDeviation='2'
                    floodOpacity='0.2'
                  />
                </filter>
              </defs>
              <Pie
                data={chartData}
                dataKey='value'
                nameKey='name'
                cx='50%'
                cy='45%'
                outerRadius='85%'
                innerRadius='55%'
                paddingAngle={6}
                stroke='none'
                cornerRadius={4}
              >
                {chartData.map((_, index) => (
                  <Cell
                    key={index}
                    fill={`url(#grad-${index % COLORS.length})`}
                    style={{ filter: 'url(#shadow)' }}
                  />
                ))}
              </Pie>

              <Tooltip content={<CustomTooltip />} />

              <Legend
                verticalAlign='bottom'
                height={36}
                iconType='circle'
                iconSize={8}
                formatter={(value) => (
                  <span className='text-xs text-gray-600 dark:text-gray-300'>
                    {value}
                  </span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}

export default InventoryPieChart
