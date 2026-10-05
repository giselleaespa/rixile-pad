import { lazy, Suspense, useEffect } from 'react'
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom'
import Hero from './components/Hero'

const AppWalletProvider = lazy(() => import('./wallet/AppWalletProvider').then((m) => ({ default: m.AppWalletProvider })))
const Navbar = lazy(() => import('./components/Navbar'))
const Footer = lazy(() => import('./components/Footer'))
const LaunchPage = lazy(() => import('./pages/LaunchPage'))
const ExplorePage = lazy(() => import('./pages/ExplorePage'))
const TokenDetailPage = lazy(() => import('./pages/TokenDetailPage'))
const TokenDnaPage = lazy(() => import('./pages/TokenDnaPage'))

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
  }, [pathname])
  return null
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <AppShell />
    </BrowserRouter>
  )
}

function AppShell() {
  const { pathname } = useLocation()
  const isHeroHome = pathname === '/'

  if (isHeroHome) return <main style={{ minHeight: '100vh' }}><Hero /></main>

  return (
    <Suspense fallback={null}>
      <AppWalletProvider>
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
          <Navbar />
          <main style={{ flex: 1 }}>
            <Routes>
              <Route path="/" element={<Hero />} />
          <Route path="/launch" element={<LaunchPage />} />
          <Route path="/explore" element={<ExplorePage />} />
          <Route path="/token/:mint" element={<TokenDetailPage />} />
          <Route path="/dna/:mint" element={<TokenDnaPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </AppWalletProvider>
    </Suspense>
  )
}
