import { NavLink } from 'react-router-dom'
import {
    Map, Bell, LayoutDashboard,
    FileText, Shield, BarChart3, Settings, LogOut, MessageSquare, Lock
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/contexts/AuthContext'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'

const publicNav = [
    { to: '/', label: 'Crime Map', icon: Map },
    { to: '/messenger', label: 'Message Admin', icon: MessageSquare },
]

const officialNav = [
    { to: '/', label: 'Crime Map', icon: Map },
    { to: '/report', label: 'File Report', icon: FileText },
    { to: '/messenger', label: 'Messenger', icon: MessageSquare },
]

const adminNav = [
    { to: '/admin', label: 'Admin Dashboard', icon: LayoutDashboard },
    { to: '/admin/alerts', label: 'Manage Alerts', icon: Bell },
    { to: '/admin/queue', label: 'Report Queue', icon: FileText },
    { to: '/messenger', label: 'Messenger', icon: MessageSquare },
]

const roleLabels: Record<string, string> = {
    public: 'GenSan Citizen',
    pnp_officer: 'PNP Officer',
    barangay_official: 'Barangay Official',
    dilg_admin: 'DILG Admin',
}

export default function Sidebar() {
    const { user, signOut, isAuthenticated } = useAuth()
    const role = user?.role ?? 'public'

    // Choose nav based on role and auth status
    const navItems = !isAuthenticated
        ? publicNav
        : role === 'dilg_admin'
            ? adminNav
            : role === 'public'
                ? publicNav
                : officialNav

    return (
        <div className="flex h-full w-full flex-col bg-white border-r border-slate-200">
            {/* Image Inspired Header */}
            <div className="flex items-center gap-3 px-5 py-6 bg-[#2b5ba9] text-white shadow-sm">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20 border border-white/30">
                    <Shield size={18} className="text-white" />
                </div>
                <div>
                    <p className="text-sm font-black tracking-tight uppercase">SafeMap Ph</p>
                    <p className="text-[10px] text-blue-100/70 font-bold uppercase tracking-widest leading-none">GenSan City</p>
                </div>
            </div>

            {/* Nav links */}
            <nav className="flex-1 overflow-y-auto px-3 py-6 space-y-1">
                <div className="px-3 mb-2">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Main Menu</p>
                </div>
                {navItems.map(({ to, label, icon: Icon }) => (
                    <NavLink
                        key={to}
                        to={to}
                        end={to === '/' || to === '/admin'}
                        className={({ isActive }) =>
                            cn(
                                'flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-bold transition-all',
                                isActive
                                    ? 'bg-[#2b5ba9]/10 text-[#2b5ba9]'
                                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                            )
                        }
                    >
                        {({ isActive }) => (
                            <>
                                <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                                {label}
                            </>
                        )}
                    </NavLink>
                ))}

                {!isAuthenticated && (
                    <div className="mt-6 pt-6 border-t border-slate-100">
                        <NavLink to="/login">
                            <Button className="w-full justify-start gap-3 bg-[#2b5ba9] hover:bg-[#1e4480] rounded-xl font-bold h-12 shadow-md text-white">
                                <Lock size={18} />
                                Official Login
                            </Button>
                        </NavLink>
                    </div>
                )}
            </nav>

            <Separator className="opacity-10" />

            {/* User footer */}
            {isAuthenticated && (
                <div className="px-3 py-4 bg-slate-50 border-t border-slate-100">
                    <div className="flex items-center gap-3 px-2 mb-4">
                        <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
                            <AvatarFallback className="bg-[#2b5ba9] text-white text-xs font-black">
                                {user?.full_name?.charAt(0) ?? 'U'}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-black text-slate-900 truncate">{user?.full_name}</p>
                            <p className="text-[9px] font-bold text-[#2b5ba9] uppercase tracking-tighter">
                                {roleLabels[role]}
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-1">
                        <NavLink to="/profile" className="flex-1">
                            <Button variant="ghost" size="sm" className="w-full justify-start text-[11px] font-bold gap-2 text-slate-600 hover:bg-white hover:shadow-sm">
                                <Settings size={14} />
                                Settings
                            </Button>
                        </NavLink>
                        <Button
                            variant="ghost" size="sm"
                            className="text-[11px] font-bold gap-2 text-slate-500 hover:text-red-600 hover:bg-red-50"
                            onClick={() => signOut()}
                        >
                            <LogOut size={14} />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
}
