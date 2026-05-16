import { Moon, Sun } from 'lucide-react'
import { useEffect, useState } from 'react'

const ThemeToggle = () => {
  const [darkMode, setDarkMode] = useState(() =>
    localStorage.getItem('theme') === 'dark'
  )

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }, [darkMode])

  return (
    <button
      type='button'
      aria-label='Toggle theme'
      onClick={() => setDarkMode(!darkMode)}
      className='p-3 rounded-2xl bg-white text-gray-700 border border-gray-200 hover:bg-gray-100 dark:bg-gray-950 dark:text-gray-100 dark:border-gray-700 dark:hover:bg-gray-800 transition-colors'
    >
      {darkMode ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  )
}

export default ThemeToggle
