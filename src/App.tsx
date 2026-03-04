import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from '@/components/layout/Layout'
import MapDashboard from '@/pages/MapDashboard'
import ReportForm from '@/pages/ReportForm'
import AdminQueue from '@/pages/AdminQueue'
import Login from '@/pages/auth/Login'
import Register from '@/pages/auth/Register'
import Messenger from '@/pages/Messenger'
import AdminAlerts from '@/pages/AdminAlerts'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import { Shield, ChevronRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'

const AlertsPage = () => (
  <div className="p-6 pt-10 pb-24 max-w-xl mx-auto">
    <div className="mb-8">
      <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
        <Shield className="text-[#2b5ba9]" />
        Public Safety Alerts
      </h1>
      <p className="text-muted-foreground text-[10px] font-black uppercase tracking-widest mt-1">Official GenSan Safety Broadcasts</p>
    </div>

    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="p-4 bg-white border border-slate-200 rounded-2xl flex gap-4 shadow-sm group hover:border-[#2b5ba9]/30 transition-colors">
          <div className="h-10 w-10 shrink-0 rounded-xl bg-blue-50 flex items-center justify-center text-[#2b5ba9]">
            <Shield size={20} />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-black text-[#2b5ba9] uppercase tracking-widest">High Priority</span>
              <span className="text-[10px] text-slate-400 font-bold">{i * 15}m ago</span>
            </div>
            <p className="text-sm font-black text-slate-900 mb-1">Safety Advisory for Zone {i}</p>
            <p className="text-[12px] text-slate-600 font-bold leading-relaxed">
              Official broadcast: Recent security activities noted in this area. Residents are advised to stay alert and report suspicious movement.
            </p>
          </div>
        </div>
      ))}
    </div>
  </div>
)

const ProfilePage = () => {
  const { user, signOut, isDemo } = useAuth()

  if (!user) return null

  return (
    <div className="p-6 pt-10 pb-24 max-w-xl mx-auto">
      <div className="flex flex-col items-center text-center mb-10">
        <div className="w-24 h-24 rounded-full bg-[#2b5ba9] p-1 mb-4 shadow-lg relative">
          <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-[#2b5ba9] text-3xl font-black uppercase shadow-inner">
            {user.full_name?.charAt(0) || 'U'}
          </div>
          {isDemo && (
            <div className="absolute -bottom-1 -right-1 bg-amber-500 text-white text-[8px] font-black px-2 py-1 rounded-lg shadow-sm border-2 border-white uppercase tracking-tighter">
              Demo Mode
            </div>
          )}
        </div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">{user.full_name}</h1>
        <p className="text-slate-500 text-sm font-bold mt-1">{user.email}</p>
        <Badge className="mt-4 bg-[#2b5ba9] text-white border-none px-4 py-1 font-black uppercase tracking-widest text-[10px]">
          {user.role} Verified
        </Badge>
      </div>

      <div className="space-y-3">
        {['Institutional Credentials', 'Notification Channels', 'Duty Logs & Reports', 'Support Center'].map((item) => (
          <div key={item} className="p-4 bg-white border border-slate-200 rounded-2xl flex items-center justify-between hover:bg-slate-50 hover:border-[#2b5ba9]/20 transition-all cursor-pointer shadow-sm">
            <span className="text-sm font-bold text-slate-700">{item}</span>
            <ChevronRight size={16} className="text-slate-400" />
          </div>
        ))}

        <div className="pt-6">
          <Button
            variant="destructive"
            className="w-full h-12 rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg shadow-red-200"
            onClick={() => signOut()}
          >
            Sign Out of Portal
          </Button>
        </div>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/" element={<Layout />}>
          <Route index element={<MapDashboard />} />
          <Route path="alerts" element={<AlertsPage />} />

          {/* Authenticated Routes */}
          <Route path="messenger" element={
            <ProtectedRoute>
              <Messenger />
            </ProtectedRoute>
          } />
          <Route path="profile" element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          } />

          {/* PNP / Barangay Routes */}
          <Route path="report" element={
            <ProtectedRoute allowedRoles={['pnp_officer', 'barangay_official', 'dilg_admin']}>
              <ReportForm />
            </ProtectedRoute>
          } />

          {/* Admin / Higher Official Routes */}
          <Route path="admin" element={
            <ProtectedRoute allowedRoles={['dilg_admin']}>
              <AdminQueue />
            </ProtectedRoute>
          } />
          <Route path="admin/alerts" element={
            <ProtectedRoute allowedRoles={['dilg_admin']}>
              <AdminAlerts />
            </ProtectedRoute>
          } />
          <Route path="admin/queue" element={
            <ProtectedRoute allowedRoles={['dilg_admin']}>
              <AdminQueue />
            </ProtectedRoute>
          } />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
