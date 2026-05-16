import { PlusCircle, Trash2 } from 'lucide-react'
import DashboardLayout from '../layouts/DashboardLayout'

const notifications = [
  { id: 1, type: 'added', message: 'New Product "Ergonomic Chair" added to Furniture.', time: '2 mins ago' },
  { id: 2, type: 'removed', message: 'Product "Desk Lamp v1" removed from Electronics.', time: '1 hr ago' },
  { id: 3, type: 'added', message: 'New Product "Wireless Mouse" added to Accessories.', time: '3 hrs ago' },
]

const Notifications = () => {
  return (
    <DashboardLayout>
      <div className='max-w-4xl mx-auto mt-6 md:mt-8 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 shadow-sm'>
        <div className='flex items-center justify-between mb-8'>
          <div>
            <h1 className='text-2xl font-bold text-gray-900 dark:text-white'>Alerts & Notifications</h1>
            <p className='text-gray-500 text-sm mt-1'>View recent inventory activity across your catalogs.</p>
          </div>
          <button className='text-sm font-semibold text-orange-600 hover:text-orange-700 bg-orange-50 dark:bg-orange-500/10 px-4 py-2 rounded-xl transition-colors'>
            Mark all as read
          </button>
        </div>

        <div className='flex flex-col gap-4'>
          {notifications.map((notif) => (
            <div key={notif.id} className='p-4 border border-gray-100 dark:border-gray-800 rounded-2xl flex items-start gap-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors'>
              <div className={`mt-0.5 p-2 rounded-full shrink-0 ${notif.type === 'added' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400' : 'bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400'}`}>
                {notif.type === 'added' ? <PlusCircle size={20} strokeWidth={2} /> : <Trash2 size={20} strokeWidth={2} />}
              </div>
              <div className='flex-1'>
                <p className='text-base text-gray-800 dark:text-gray-200 font-medium'>
                  {notif.message}
                </p>
                <p className='text-sm text-gray-400 mt-1'>{notif.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}

export default Notifications
