import { useNavigate, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  BarChart3,
  FileText,
  Bell,
  Settings,
  Users,
  X,
} from 'lucide-react'

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
  { icon: Package, label: 'Inventory' },
  { icon: ShoppingCart, label: 'Orders' },
  { icon: BarChart3, label: 'Analytics' },
  { icon: FileText, label: 'Reports', path: '/reports' },
  { icon: Bell, label: 'Alerts', path: '/notifications' },
  { icon: Users, label: 'Users' },
  { icon: Settings, label: 'Settings' },
]

type SidebarProps = {
  isOpen: boolean
  onClose: () => void
}

const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const navigate = useNavigate()
  const location = useLocation()

  const handleMenuClick = (item: typeof menuItems[0]) => {
    if (item.path) {
      navigate(item.path)
    }
  }

  return (
    <>
      {/* Mobile backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
          isOpen
            ? 'opacity-100'
            : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-[#FFFDFB] dark:bg-gray-950 border-r border-gray-200 dark:border-gray-800 flex flex-col justify-between transition-transform duration-300 ease-out
          lg:static lg:translate-x-0
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div>
          {/* Logo + close button */}
          <div className='p-6 pb-4 flex items-center justify-between'>
            <div className='flex items-center gap-3'>
              <div className='w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-orange-500/25'>
                A
              </div>

              <div>
                <h1 className='text-xl font-bold text-gray-900 dark:text-white'>
                  Aura
                </h1>
                <p className='text-xs text-gray-500'>
                  Enterprise Engine
                </p>
              </div>
            </div>

            <button
              type='button'
              onClick={onClose}
              className='grid h-8 w-8 place-items-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:text-gray-200 dark:hover:bg-gray-800 transition-colors lg:hidden'
              aria-label='Close sidebar'
            >
              <X size={18} />
            </button>
          </div>

          {/* Navigation */}
          <nav className='px-4 mt-2 space-y-1'>
            {menuItems.map((item) => {
              const Icon = item.icon
              const isActive = item.path === location.pathname

              return (
                <div
                  key={item.label}
                  onClick={() => handleMenuClick(item)}
                  className={`flex items-center gap-3.5 px-4 py-3 rounded-xl cursor-pointer transition-all duration-200
                    ${
                      isActive
                        ? 'bg-orange-100 text-orange-600 font-semibold dark:bg-orange-500/15 dark:text-orange-300'
                        : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800/60'
                    }
                  `}
                >
                  <Icon
                    size={20}
                    strokeWidth={isActive ? 2.5 : 1.8}
                  />
                  <span className='text-sm font-medium'>
                    {item.label}
                  </span>
                </div>
              )
            })}
          </nav>
        </div>

        {/* Profile card */}
        <div className='p-4'>
          <div className='bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-3.5 flex items-center gap-3'>
            <div className='w-9 h-9 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center text-white font-bold text-xs shrink-0'>
              SJ
            </div>

            <div className='min-w-0 flex-1'>
              <h3 className='font-semibold text-sm text-gray-900 dark:text-white truncate'>
                Sarah Johnson
              </h3>
              <p className='text-xs text-gray-500'>Admin</p>
            </div>

            <div className='w-2 h-2 rounded-full bg-emerald-500 shrink-0' />
          </div>
        </div>
      </aside>
    </>
  )
}

export default Sidebar
