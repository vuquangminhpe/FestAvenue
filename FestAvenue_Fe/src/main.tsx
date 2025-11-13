import { createRoot } from 'react-dom/client'
import './index.css'
import 'mapbox-gl/dist/mapbox-gl.css'
import App from './App.tsx'
import { BrowserRouter } from 'react-router'
import { HelmetProvider } from 'react-helmet-async'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from '@/components/ui/sonner'
import ScrollToTop from './components/custom/ScrollToTop/ScrollToTop.tsx'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
      retry: 1
    }
  }
})
createRoot(document.getElementById('root')!).render(
  <HelmetProvider>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <ScrollToTop />
        <App />
        <Toaster />
      </QueryClientProvider>
    </BrowserRouter>
  </HelmetProvider>
)
