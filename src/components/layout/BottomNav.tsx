import { NavLink } from 'react-router-dom'
import { Map, Bell, User, MessageSquare } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/contexts/AuthContext'

export default function BottomNav() {
    const { isAuthenticated } = useAuth()

    const navItems = [
        { to: '/', label: 'Map', icon: Map },
        { to: '/alerts', label: 'Alerts', icon: Bell },
        { to: '/messenger', label: 'Chat', icon: MessageSquare },
        { to: isAuthenticated ? '/profile' : '/login', label: isAuthenticated ? 'Profile' : 'Sign In', icon: User },
    ]

    return (
        <nav className="bottom-nav bg-white/95 backdrop-blur-xl border-t border-slate-200 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] md:hidden">
            <div className="flex items-center justify-around h-16 px-2">
                {navItems.map(({ to, label, icon: Icon }) => (
                    <NavLink
                        key={to}
                        to={to}
                        end={to === '/'}
                        className={({ isActive }) =>
                            cn(
                                'flex flex-col items-center justify-center gap-0.5 flex-1 py-1 px-1',
                                'transition-all duration-200',
                                isActive
                                    ? 'text-[#2b5ba9]'
                                    : 'text-slate-400 hover:text-slate-600'
                            )
                        }
                    >
                        {({ isActive }) => (
                            <>
                                <div className={cn(
                                    'relative p-1 rounded-xl transition-all duration-200',
                                    isActive && 'bg-[#2b5ba9]/10'
                                )}>
                                    <Icon
                                        size={22}
                                        strokeWidth={isActive ? 2.5 : 2}
                                    />
                                    {isActive && (
                                        <span className="absolute -top-0.5 -right-0.5 h-1.5 w-1.5 rounded-full bg-[#2b5ba9]" />
                                    )}
                                </div>
                                <span className={cn(
                                    'text-[9px] font-black uppercase tracking-tighter',
                                    isActive ? 'text-[#2b5ba9]' : 'text-slate-400'
                                )}>
                                    {label}
                                </span>
                            </>
                        )}
                    </NavLink>
                ))}
            </div>
        </nav>
    )
}
