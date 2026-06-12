import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from '@/context/AuthContext'
import { TenantProvider } from '@/context/TenantContext'
import { Toaster } from '@/components/ui/sonner'

import AdminLayout from '@/components/layout/AdminLayout'
import ClientLayout from '@/components/layout/ClientLayout'
import ClientAuthLayout from '@/components/layout/ClientAuthLayout'
import AdminAuthLayout from '@/components/layout/AdminAuthLayout'

import ClientLogin from '@/pages/auth/ClientLogin'
import AdminLogin from '@/pages/auth/AdminLogin'
import Register from '@/pages/auth/Register'
import ForgotPassword from '@/pages/auth/ForgotPassword'
import Dashboard from '@/pages/dashboard/Dashboard'
import Leads from '@/pages/leads/Leads'
import Events from '@/pages/events/Events'
import EventDetail from '@/pages/events/EventDetail'
import Vendors from '@/pages/vendors/Vendors'
import Tasks from '@/pages/tasks/Tasks'
import Documents from '@/pages/documents/Documents'
import Gallery from '@/pages/gallery/Gallery'
import Payments from '@/pages/payments/Payments'
import Timeline from '@/pages/timeline/Timeline'
import Team from '@/pages/team/Team'
import Settings from '@/pages/settings/Settings'

import CompanySignup from '@/pages/saas/CompanySignup'
import SuperAdmin from '@/pages/saas/SuperAdmin'

import ClientDashboard from '@/pages/client/ClientDashboard'
import ClientTimeline from '@/pages/client/ClientTimeline'
import ClientContracts from '@/pages/client/ClientContracts'
import ClientDocuments from '@/pages/client/ClientDocuments'
import ClientInvoices from '@/pages/client/ClientInvoices'
import ClientGallery from '@/pages/client/ClientGallery'
import ClientApprovals from '@/pages/client/ClientApprovals'

export default function App() {
  return (
    <AuthProvider>
      <TenantProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/get-started" element={<CompanySignup />} />
          <Route path="/superadmin" element={<SuperAdmin />} />
          <Route element={<ClientAuthLayout />}>
            <Route path="/" element={<ClientLogin />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
          </Route>

          <Route element={<AdminAuthLayout />}>
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/forgot-password" element={<ForgotPassword />} />
          </Route>

          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="leads" element={<Leads />} />
            <Route path="events" element={<Events />} />
            <Route path="events/:id" element={<EventDetail />} />
            <Route path="vendors" element={<Vendors />} />
            <Route path="tasks" element={<Tasks />} />
            <Route path="documents" element={<Documents />} />
            <Route path="gallery" element={<Gallery />} />
            <Route path="payments" element={<Payments />} />
            <Route path="timeline" element={<Timeline />} />
            <Route path="team" element={<Team />} />
            <Route path="settings" element={<Settings />} />
          </Route>

          <Route path="/client" element={<ClientLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<ClientDashboard />} />
            <Route path="timeline" element={<ClientTimeline />} />
            <Route path="contracts" element={<ClientContracts />} />
            <Route path="documents" element={<ClientDocuments />} />
            <Route path="invoices" element={<ClientInvoices />} />
            <Route path="gallery" element={<ClientGallery />} />
            <Route path="approvals" element={<ClientApprovals />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
      <Toaster />
      </TenantProvider>
    </AuthProvider>
  )
}
