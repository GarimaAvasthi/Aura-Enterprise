import { Bell, Menu } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import ThemeToggle from '../common/ThemeToggle'

type NavbarProps = {
  onMenuToggle: () => void
}

const notifications = [
  { id: 1 },
  { id: 2 },
  { id: 3 },
] // Kept for the badge count

const Navbar = ({ onMenuToggle }: NavbarProps) => {
  const navigate = useNavigate()

  return (
    <header className='sticky top-0 z-30 bg-[#F8F6F4]/80 dark:bg-gray-950/80 backdrop-blur-xl border-b border-gray-200/80 dark:border-gray-800 px-4 md:px-8 py-4 flex items-center justify-between gap-4'>
      <div className='flex items-center gap-3 min-w-0'>
        <button
          type='button'
          onClick={onMenuToggle}
          className='grid h-10 w-10 shrink-0 place-items-center rounded-xl text-gray-600 hover:bg-gray-200/60 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors lg:hidden'
          aria-label='Toggle menu'
        >
          <Menu size={22} />
        </button>

        <div className='min-w-0'>
          <h1 className='text-xl md:text-2xl font-bold leading-tight text-gray-900 dark:text-white truncate'>
            Inventory Dashboard
          </h1>

          <p className='text-gray-500 text-sm mt-0.5 hidden sm:block'>
            Manage 50,000+ SKU inventory efficiently
          </p>
        </div>
      </div>

      <div className='flex items-center gap-2'>
        <button
          type='button'
          onClick={() => navigate('/notifications')}
          aria-label='Notifications'
          className='relative grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-gray-200 bg-white hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800 transition-colors'
        >
          <Bell size={18} />
          <span className='absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full bg-orange-500 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-[#F8F6F4] dark:ring-gray-950'>
            {notifications.length}
          </span>
        </button>

        <ThemeToggle />
      </div>
    </header>
  )
}

export default Navbar
