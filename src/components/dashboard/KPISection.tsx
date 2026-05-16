import { useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  Package,
  DollarSign,
  AlertTriangle,
  TrendingUp,
} from 'lucide-react'

import {
  fetchInventoryKpis,
  getUrlFilters,
} from '../../api/inventoryApi'

type KpiData = {
  totalSkus: number
  inventoryValue: number
  outOfStock: number
  lowStock: number
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value)

const SkeletonCard = () => (
  <div className='bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700'>
    <div className='flex items-start justify-between'>
      <div className='space-y-4'>
        <div className='h-3.5 w-20 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse' />
        <div className='h-9 w-28 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse' />
      </div>
      <div className='w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-2xl animate-pulse' />
    </div>
  </div>
)

const KPISection = () => {
  const [searchParams] = useSearchParams()
  const filters = getUrlFilters(searchParams)

  const { data: kpis, isLoading } = useQuery<KpiData>({
    queryKey: ['inventory', 'kpis', filters],
    queryFn: ({ signal }) => fetchInventoryKpis(filters, { signal }),
    staleTime: 0,
    refetchInterval: 10000,
  })

  if (isLoading) {
    return (
      <div className='grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6 mt-6 md:mt-8'>
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    )
  }

  const cards = [
    {
      title: 'Total SKUs',
      value: kpis ? kpis.totalSkus.toLocaleString() : '—',
      icon: Package,
      bg: 'bg-orange-100 dark:bg-orange-500/15',
      iconColor: 'text-orange-600 dark:text-orange-400',
    },
    {
      title: 'Inventory Total',
      value: kpis ? formatCurrency(kpis.inventoryValue) : '—',
      icon: DollarSign,
      bg: 'bg-emerald-100 dark:bg-emerald-500/15',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
    },
    {
      title: 'Out of Stock',
      value: kpis ? kpis.outOfStock.toLocaleString() : '—',
      icon: AlertTriangle,
      bg: 'bg-red-100 dark:bg-red-500/15',
      iconColor: 'text-red-600 dark:text-red-400',
    },
    {
      title: 'Low Stock',
      value: kpis ? kpis.lowStock.toLocaleString() : '—',
      icon: TrendingUp,
      bg: 'bg-blue-100 dark:bg-blue-500/15',
      iconColor: 'text-blue-600 dark:text-blue-400',
    },
  ]

  return (
    <div className='grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6 mt-6 md:mt-8'>
      {cards.map((card) => {
        const Icon = card.icon

        return (
          <div
            key={card.title}
            className='bg-white dark:bg-gray-800 rounded-3xl p-5 md:p-6 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300'
          >
            <div className='flex items-start justify-between'>
              <div>
                <p className='text-gray-500 dark:text-gray-400 text-sm'>
                  {card.title}
                </p>

                <h2 className='text-3xl md:text-4xl font-bold mt-3 text-gray-900 dark:text-white'>
                  {card.value}
                </h2>
              </div>

              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center ${card.bg}`}
              >
                <Icon size={22} className={card.iconColor} />
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default KPISection
