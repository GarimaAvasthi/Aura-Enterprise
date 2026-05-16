import { useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { AlertCircle } from 'lucide-react'

import {
  fetchRestockPriority,
  getUrlFilters,
  type InventoryItem,
} from '../../api/inventoryApi'

type RestockProduct = InventoryItem & {
  priority: 'Critical' | 'Urgent' | 'Monitor'
}

const priorityConfig = {
  Critical: {
    bg: 'bg-red-50 dark:bg-red-500/10',
    border: 'border-red-200 dark:border-red-500/20',
    badge: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400',
    icon: true,
  },
  Urgent: {
    bg: 'bg-orange-50 dark:bg-orange-500/10',
    border: 'border-orange-200 dark:border-orange-500/20',
    badge: 'bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400',
    icon: false,
  },
  Monitor: {
    bg: 'bg-amber-50 dark:bg-amber-500/10',
    border: 'border-amber-200 dark:border-amber-500/20',
    badge: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400',
    icon: false,
  },
}

const SkeletonCard = () => (
  <div className='rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 p-4 animate-pulse'>
    <div className='flex items-center justify-between'>
      <div className='space-y-2'>
        <div className='h-4 w-36 bg-gray-200 dark:bg-gray-700 rounded-full' />
        <div className='h-3 w-24 bg-gray-200 dark:bg-gray-700 rounded-full' />
      </div>
      <div className='space-y-2 flex flex-col items-end'>
        <div className='h-6 w-8 bg-gray-200 dark:bg-gray-700 rounded-lg' />
        <div className='h-5 w-16 bg-gray-200 dark:bg-gray-700 rounded-full' />
      </div>
    </div>
  </div>
)

const RestockQueue = () => {
  const [searchParams] = useSearchParams()
  const filters = getUrlFilters(searchParams)

  const { data, isLoading } = useQuery<{
    products: RestockProduct[]
  }>({
    queryKey: ['inventory', 'restock-priority', filters],
    queryFn: ({ signal }) => fetchRestockPriority(filters, { signal }),
    staleTime: 0,
    refetchInterval: 10000,
  })

  const products = data?.products ?? []

  return (
    <div className='bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 p-5 md:p-6'>
      <div className='flex items-center justify-between mb-4'>
        <div>
          <h2 className='text-lg md:text-xl font-bold text-gray-900 dark:text-white'>
            Restock Queue
          </h2>

          <p className='text-gray-500 dark:text-gray-400 mt-1 text-sm'>
            Lowest-stock SKUs needing attention
          </p>
        </div>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-3'>
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))
          : products.map((product) => {
              const config = priorityConfig[product.priority]

              return (
                <div
                  key={product.sku}
                  className={`flex items-center justify-between rounded-2xl border p-4 transition-colors ${config.bg} ${config.border}`}
                >
                  <div className='min-w-0 flex-1'>
                    <h3 className='font-semibold text-sm md:text-base text-gray-900 dark:text-white truncate'>
                      {config.icon && (
                        <AlertCircle
                          size={16}
                          className='inline-block mr-1.5 -mt-0.5 text-red-500'
                        />
                      )}
                      {product.name}
                    </h3>

                    <p className='text-gray-500 dark:text-gray-400 text-xs mt-0.5 truncate'>
                      {product.sku} · {product.category}
                    </p>
                  </div>

                  <div className='text-right shrink-0 ml-3'>
                    <p className='font-bold text-lg text-gray-900 dark:text-white'>
                      {product.stock}
                    </p>

                    <span
                      className={`inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full ${config.badge}`}
                    >
                      {product.priority}
                    </span>
                  </div>
                </div>
              )
            })}
      </div>
    </div>
  )
}

export default RestockQueue
