import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from '@/context/AuthContext'
import { Toaster } from '@/components/ui/sonner'

import AdminLayout from '@/components/layout/AdminLayout'
import ClientLayout from '@/components/layout/ClientLayout'
import AdminAuthLayout from '@/components/layout/AdminAuthLayout'

import ClientLogin from '@/pages/auth/ClientLogin'
import AdminLogin from '@/pages/auth/AdminLogin'
import Dashboard from '@/pages/dashboard/Dashboard'
import Leads from '@/pages/leads/Leads'
import LeadDetail from '@/pages/leads/LeadDetail'
import Events from '@/pages/events/Events'
import Vendors from '@/pages/vendors/Vendors'
import Tasks from '@/pages/tasks/Tasks'
import Documents from '@/pages/documents/Documents'
import Gallery from '@/pages/gallery/Gallery'
import Payments from '@/pages/payments/Payments'
import Team from '@/pages/team/Team'
import Settings from '@/pages/settings/Settings'

import Clients from '@/pages/clients/Clients'
import ClientDetail from '@/pages/clients/ClientDetail'
import Packages from '@/pages/packages/Packages'
import Calendar from '@/pages/calendar/Calendar'
import Contracts from '@/pages/contracts/Contracts'
import Reports from '@/pages/reports/Reports'
import Brands from '@/pages/brands/Brands'
import IntakeForm from '@/pages/intake/IntakeForm'
import TimelineForm from '@/pages/intake/TimelineForm'
import WeddingInsurance from '@/pages/info/WeddingInsurance'
import AcceptInvite from '@/pages/auth/AcceptInvite'
import ClientSetup from '@/pages/auth/ClientSetup'

import ClientDashboard from '@/pages/client/ClientDashboard'
import ClientTimeline from '@/pages/client/ClientTimeline'
import ClientContracts from '@/pages/client/ClientContracts'
import ClientDocuments from '@/pages/client/ClientDocuments'
import ClientInvoices from '@/pages/client/ClientInvoices'
import ClientGallery from '@/pages/client/ClientGallery'
import ClientApprovals from '@/pages/client/ClientApprovals'
import ClientOnboarding from '@/pages/client/ClientOnboarding'
import ClientMeetings from '@/pages/client/ClientMeetings'
import ClientPackage from '@/pages/client/ClientPackage'
import ClientResources from '@/pages/client/ClientResources'
import ClientProfile from '@/pages/client/ClientProfile'
import ClientSettings from '@/pages/client/ClientSettings'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<ClientLogin />} />
          <Route path="/portal/:brand" element={<ClientLogin />} />

          <Route element={<AdminAuthLayout />}>
            <Route path="/admin/login" element={<AdminLogin />} />
          </Route>

          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="leads" element={<Leads />} />
            <Route path="leads/:id" element={<LeadDetail />} />
            <Route path="calendar" element={<Calendar />} />
            <Route path="clients" element={<Clients />} />
            <Route path="clients/:id" element={<ClientDetail />} />
            <Route path="packages" element={<Packages />} />
            <Route path="contracts" element={<Contracts />} />
            <Route path="events" element={<Events />} />
            <Route path="vendors" element={<Vendors />} />
            <Route path="tasks" element={<Tasks />} />
            <Route path="documents" element={<Documents />} />
            <Route path="gallery" element={<Gallery />} />
            <Route path="payments" element={<Payments />} />
            <Route path="reports" element={<Reports />} />
            <Route path="brands" element={<Brands />} />
            <Route path="team" element={<Team />} />
            <Route path="settings" element={<Settings />} />
          </Route>

          <Route path="/client" element={<ClientLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<ClientDashboard />} />
            <Route path="onboarding" element={<ClientOnboarding />} />
            <Route path="package" element={<ClientPackage />} />
            <Route path="timeline" element={<ClientTimeline />} />
            <Route path="meetings" element={<ClientMeetings />} />
            <Route path="contracts" element={<ClientContracts />} />
            <Route path="invoices" element={<ClientInvoices />} />
            <Route path="documents" element={<ClientDocuments />} />
            <Route path="gallery" element={<ClientGallery />} />
            <Route path="approvals" element={<ClientApprovals />} />
            <Route path="resources" element={<ClientResources />} />
            <Route path="profile" element={<ClientProfile />} />
            <Route path="settings" element={<ClientSettings />} />
          </Route>

          <Route path="/intake" element={<IntakeForm />} />
          <Route path="/timeline-form" element={<TimelineForm />} />
          <Route path="/wedding-insurance" element={<WeddingInsurance />} />
          <Route path="/accept-invite" element={<AcceptInvite />} />
          <Route path="/welcome" element={<ClientSetup />} />
          <Route path="/welcome/:brand" element={<ClientSetup />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
      <Toaster />
    </AuthProvider>
  )
}
