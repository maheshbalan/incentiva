import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Box, CircularProgress } from '@mui/material'

import { useAuth } from './hooks/useAuth'
import Layout from './components/Layout'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import CampaignsPage from './pages/CampaignsPage'
import CampaignDetailPage from './pages/CampaignDetailPage'
import CreateCampaignPage from './pages/CreateCampaignPage'
import CampaignExecutionPage from './pages/CampaignExecutionPage'
import TransactionTablePage from './pages/TransactionTablePage'
import CampaignEditPage from './pages/CampaignEditPage'
import ProfilePage from './pages/ProfilePage'
import AdminPage from './pages/AdminPage'
import ParticipantDashboardPage from './pages/ParticipantDashboardPage'

function App() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    )
  }

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    )
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to={user?.role === 'ADMIN' ? '/dashboard' : '/participant/campaigns'} replace />} />
        <Route path="/dashboard" element={user?.role === 'ADMIN' ? <DashboardPage /> : <Navigate to="/participant/campaigns" replace />} />
        <Route path="/campaigns" element={user?.role === 'ADMIN' ? <CampaignsPage /> : <Navigate to="/participant/campaigns" replace />} />
        <Route path="/campaigns/create" element={user?.role === 'ADMIN' ? <CreateCampaignPage /> : <Navigate to="/participant/campaigns" replace />} />
        <Route path="/campaigns/:id" element={user?.role === 'ADMIN' ? <CampaignDetailPage /> : <Navigate to="/participant/campaigns" replace />} />
        <Route path="/campaigns/:id/edit" element={user?.role === 'ADMIN' ? <CampaignEditPage /> : <Navigate to="/participant/campaigns" replace />} />
        <Route path="/campaigns/:id/participants" element={user?.role === 'ADMIN' ? <AdminPage /> : <Navigate to="/participant/campaigns" replace />} />
        <Route path="/campaigns/:id/execute" element={user?.role === 'ADMIN' ? <CampaignExecutionPage /> : <Navigate to="/participant/campaigns" replace />} />
        <Route path="/campaigns/:id/transactions" element={user?.role === 'ADMIN' ? <TransactionTablePage /> : <Navigate to="/participant/campaigns" replace />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/admin" element={user?.role === 'ADMIN' ? <AdminPage /> : <Navigate to="/participant/campaigns" replace />} />
        <Route path="/participant" element={<ParticipantDashboardPage />} />
        <Route path="/participant/campaigns" element={<ParticipantDashboardPage />} />
        <Route path="/participant/campaigns/:campaignId" element={<ParticipantDashboardPage />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Layout>
  )
}

export default App 