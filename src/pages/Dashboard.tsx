import DashboardLayout from '../layouts/DashboardLayout'
import KPISection from '../components/dashboard/KPISection'
import InventoryTable from '../components/table/InventoryTable'
import LowStockBarChart from '../components/charts/LowStockBarChart'
import InventoryPieChart from '../components/charts/InventoryPieChart'

const Dashboard = () => {
  return (
    <DashboardLayout>
      <KPISection />

      <div className='grid grid-cols-1 xl:grid-cols-3 gap-4 md:gap-6 mt-6 md:mt-8'>
        <div className='xl:col-span-2'>
          <LowStockBarChart />
        </div>

        <div>
          <InventoryPieChart />
        </div>
      </div>

      <InventoryTable />
    </DashboardLayout>
  )
}

export default Dashboard