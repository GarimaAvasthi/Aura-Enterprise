import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'sonner'
import Dashboard from './pages/Dashboard'
import Notifications from './pages/Notifications'
import Reports from './pages/Reports'

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-center" richColors />
      <Routes>
        <Route path='/' element={<Dashboard />} />
        <Route path='/notifications' element={<Notifications />} />
        <Route path='/reports' element={<Reports />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App