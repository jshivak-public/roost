import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom'
import { Component, useEffect, lazy, Suspense } from 'react'
import type { ReactNode, ErrorInfo } from 'react'
import { MotionConfig } from 'motion/react'
import { MarketplaceProvider } from './components/MarketplaceProvider'
import { Layout } from './components/Layout'
const Landing = lazy(() => import('./pages/Landing'))
const Discover = lazy(() => import('./pages/Discover'))
const ListingDetails = lazy(() => import('./pages/ListingDetails'))
const Saved = lazy(() => import('./pages/Saved'))
const Messages = lazy(() => import('./pages/Messages'))
const Profile = lazy(() => import('./pages/Profile'))
const Onboarding = lazy(() => import('./pages/Onboarding'))
const CreateListing = lazy(() => import('./pages/CreateListing'))
const PortalLayout = lazy(() => import('./portal/PortalLayout'))
const PortalOverview = lazy(() => import('./portal/pages/Overview'))
const PortalPayments = lazy(() => import('./portal/pages/Payments'))
const PortalRequests = lazy(() => import('./portal/pages/Requests'))
const PortalDocuments = lazy(() => import('./portal/pages/Documents'))
const PortalCalendar = lazy(() => import('./portal/pages/Calendar'))
const PortalSublease = lazy(() => import('./portal/pages/Sublease'))
const PortalProtection = lazy(() => import('./portal/pages/Protection'))
const PortalSettings = lazy(() => import('./portal/pages/Settings'))
const NewSublease = lazy(() => import('./portal/pages/NewSublease'))
class ErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  componentDidCatch(error: Error, info: ErrorInfo) { console.error('Roost could not render this view', error, info.componentStack) }
  render() { return this.state.failed ? <div className="page empty-state"><h1>Let’s try that again.</h1><p>Something went wrong displaying this page. Your locally saved data hasn’t been removed.</p><button className="button button-primary" onClick={() => window.location.assign('/')}>Return home</button></div> : this.props.children }
}
function ScrollToTop() { const { pathname } = useLocation(); useEffect(() => { window.scrollTo(0, 0) }, [pathname]); return null }
export default function App() { return <ErrorBoundary><MotionConfig reducedMotion="user"><MarketplaceProvider><BrowserRouter><ScrollToTop /><Suspense fallback={<div className="page empty-state" role="status">Finding your next chapter…</div>}><Routes><Route path="portal" element={<PortalLayout />}><Route index element={<PortalOverview />} /><Route path="payments" element={<PortalPayments />} /><Route path="requests" element={<PortalRequests />} /><Route path="documents" element={<PortalDocuments />} /><Route path="calendar" element={<PortalCalendar />} /><Route path="sublease" element={<PortalSublease />} /><Route path="protection" element={<PortalProtection />} /><Route path="settings" element={<PortalSettings />} /><Route path="new" element={<NewSublease />} /></Route><Route element={<Layout />}><Route index element={<Landing />} /><Route path="discover" element={<Discover />} /><Route path="listing/:id" element={<ListingDetails />} /><Route path="saved" element={<Saved />} /><Route path="messages" element={<Messages />} /><Route path="profile" element={<Profile />} /><Route path="onboarding" element={<Onboarding />} /><Route path="create" element={<CreateListing />} /><Route path="*" element={<div className="page empty-state"><h1>A little off campus.</h1><p>That page doesn’t exist.</p><Link to="/discover">Back to discovery →</Link></div>} /></Route></Routes></Suspense></BrowserRouter></MarketplaceProvider></MotionConfig></ErrorBoundary> }


