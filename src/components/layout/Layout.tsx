import { Outlet, useLocation } from 'react-router-dom'
import BottomNav from './BottomNav'
import Sidebar from './Sidebar'
import OfflineIndicator from './OfflineIndicator'
import EmergencyButton from './EmergencyButton'
import { Toaster } from '@/components/ui/toaster'

export default function Layout() {
    const location = useLocation()

    return (
        <div className="flex h-screen overflow-hidden bg-background">
            {/* Desktop Sidebar — hidden on mobile */}
            <aside className="hidden md:flex md:w-64 md:flex-shrink-0">
                <Sidebar />
            </aside>

            {/* Main content area */}
            <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
                {/* Offline banner */}
                <OfflineIndicator />

                {/* Page content */}
                <main
                    className="flex-1 overflow-y-auto overflow-x-hidden
                     pb-20 md:pb-4"
                    key={location.pathname}
                >
                    <Outlet />
                </main>
            </div>

            {/* Emergency Floating Button */}
            <EmergencyButton />

            {/* Mobile Bottom Navigation — hidden on desktop */}
            <div className="md:hidden">
                <BottomNav />
            </div>

            <Toaster />
        </div>
    )
}
