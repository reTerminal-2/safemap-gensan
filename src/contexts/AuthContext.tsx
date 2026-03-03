import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { User } from '@/types'
import { supabase } from '@/lib/supabase'

interface AuthContextValue {
    user: User | null
    isLoading: boolean
    isAuthenticated: boolean
    signIn: (email: string, password: string) => Promise<{ error: string | null }>
    signUp: (email: string, password: string, data: Partial<User>) => Promise<{ error: string | null }>
    signOut: () => Promise<void>
    // Demo mode: switch roles without real auth
    setDemoRole: (role: User['role']) => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

const DEMO_USERS: Record<User['role'], User> = {
    public: {
        id: 'demo-public',
        email: 'citizen@gensan.gov.ph',
        full_name: 'GenSan Citizen',
        role: 'public',
        is_verified: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    },
    pnp_officer: {
        id: 'demo-officer',
        email: 'officer@pnp.gov.ph',
        full_name: 'Officer Juan dela Cruz',
        role: 'pnp_officer',
        badge_number: 'PNP-GEN-0042',
        station: 'GenSan Police Station 1',
        is_verified: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    },
    dilg_admin: {
        id: 'demo-admin',
        email: 'admin@dilg.gov.ph',
        full_name: 'Admin Maria Santos',
        role: 'dilg_admin',
        department: 'DILG South Cotabato',
        is_verified: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    },
    barangay_official: {
        id: 'demo-brgy',
        email: 'captain@lagao.gov.ph',
        full_name: 'Brgy. Capt. Roland Rivera',
        role: 'barangay_official',
        barangay_id: 'brgy_lagao',
        is_verified: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    },
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(DEMO_USERS.public)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const checkAuth = async () => {
            const { data: { session } } = await supabase.auth.getSession()

            if (session?.user) {
                try {
                    const { data: profile, error } = await supabase
                        .from('users')
                        .select('*')
                        .eq('id', session.user.id)
                        .single()

                    if (error) throw error

                    setUser({
                        id: session.user.id,
                        email: session.user.email || '',
                        full_name: profile.full_name,
                        role: profile.role,
                        is_verified: profile.is_verified,
                        badge_number: profile.badge_number,
                        station: profile.station,
                        department: profile.department,
                        barangay_id: profile.barangay_id,
                        created_at: profile.created_at,
                        updated_at: profile.updated_at,
                    })
                } catch (err) {
                    console.error('Failed to fetch user profile:', err)
                    setUser(DEMO_USERS.public)
                }
            } else {
                setUser(DEMO_USERS.public)
            }
            setIsLoading(false)
        }

        checkAuth()

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (!session) {
                setUser(DEMO_USERS.public)
            } else {
                checkAuth()
            }
        })

        return () => subscription.unsubscribe()
    }, [])

    const signIn = async (email: string, password: string) => {
        try {
            const { error } = await supabase.auth.signInWithPassword({ email, password })
            if (error) throw error
            return { error: null }
        } catch (error: any) {
            return { error: error.message || 'Login failed' }
        }
    }

    const signUp = async (email: string, password: string, data: Partial<User>) => {
        try {
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: data.full_name,
                        role: data.role
                    }
                }
            })

            if (authError) throw authError
            if (!authData.user) throw new Error('Signup failed')

            // Insert into public.users table
            const { error: profileError } = await supabase
                .from('users')
                .insert([{
                    id: authData.user.id,
                    email,
                    full_name: data.full_name,
                    role: data.role,
                    ...data
                }])

            if (profileError) throw profileError

            return { error: null }
        } catch (error: any) {
            return { error: error.message || 'Registration failed' }
        }
    }

    const signOut = async () => {
        await supabase.auth.signOut()
        setUser(DEMO_USERS.public)
    }

    const setDemoRole = (role: User['role']) => {
        setUser(DEMO_USERS[role])
    }

    return (
        <AuthContext.Provider
            value={{
                user,
                isLoading,
                isAuthenticated: !!user && !user.id.startsWith('demo-'),
                signIn,
                signUp,
                signOut,
                setDemoRole,
            }}
        >
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const ctx = useContext(AuthContext)
    if (!ctx) throw new Error('useAuth must be used within AuthProvider')
    return ctx
}
