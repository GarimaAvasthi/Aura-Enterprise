import { useState } from 'react'
import Sidebar from '../components/dashboard/Sidebar'
import Navbar from '../components/dashboard/Navbar'

const DashboardLayout = ({
  children,
}: {
  children: React.ReactNode
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className='flex min-h-screen bg-gray-100 text-gray-900 dark:bg-gray-950 dark:text-gray-100'>
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className='flex-1 flex flex-col min-w-0'>
        <Navbar
          onMenuToggle={() => setSidebarOpen((prev) => !prev)}
        />

        <main className='flex-1 p-4 md:p-6 bg-gray-100 dark:bg-gray-950'>
          {children}
        </main>
      </div>
    </div>
  )
}

export default DashboardLayout
