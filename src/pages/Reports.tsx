import DashboardLayout from '../layouts/DashboardLayout'
import LowStockBarChart from '../components/charts/LowStockBarChart'
import InventoryPieChart from '../components/charts/InventoryPieChart'

const Reports = () => {
  return (
    <DashboardLayout>
      <div className='mb-6 md:mb-8 mt-6 md:mt-8'>
        <h1 className='text-2xl font-bold text-gray-900 dark:text-white'>
          Analytics & Insights
        </h1>
      </div>

      <div className='grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6'>
        <div className='w-full'>
          <LowStockBarChart />
        </div>
        <div className='w-full'>
          <InventoryPieChart />
        </div>
      </div>
    </DashboardLayout>
  )
}

export default Reports
