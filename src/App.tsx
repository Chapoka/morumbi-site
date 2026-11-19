import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster as SonnerToaster } from 'sonner'
import HomePage from './pages/HomePage'
import CheckoutPage from './pages/CheckoutPage'
import { Toaster } from './components/ui/toaster'

function App() {
  return (
    <BrowserRouter>
      <Toaster />
      <SonnerToaster />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
