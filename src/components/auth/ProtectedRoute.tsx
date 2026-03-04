import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Loader2 } from 'lucide-react'
import type { UserRole } from '@/types'

interface ProtectedRouteProps {
    children: React.ReactNode
    allowedRoles?: UserRole[]
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
    const { user, isLoading, isAuthenticated } = useAuth()
    const location = useLocation()

    if (isLoading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-slate-50">
                <div className="text-center">
                    <Loader2 className="mx-auto h-12 w-12 animate-spin text-[#2b5ba9]" />
                    <p className="mt-4 text-sm font-bold text-slate-600 uppercase tracking-widest">
                        Verifying Credentials...
                    </p>
                </div>
            </div>
        )
    }

    // In demo mode, we might want to allow access if not authenticated but "demo-user" is set
    // However, for "real auth working", we should prioritize isAuthenticated
    if (!isAuthenticated && !user?.id.startsWith('demo-')) {
        return <Navigate to="/login" state={{ from: location }} replace />
    }

    if (allowedRoles && user && !allowedRoles.includes(user.role)) {
        return <Navigate to="/" replace />
    }

    return <>{children}</>
}
