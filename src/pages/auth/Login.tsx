import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Shield, Lock, Mail, ChevronRight, Loader2 } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'

export default function Login() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const { signIn, setDemoRole } = useAuth()
    const navigate = useNavigate()
    const { toast } = useToast()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        const { error } = await signIn(email, password)
        setIsLoading(false)

        if (error) {
            toast({
                title: 'Login Failed',
                description: error,
                variant: 'destructive',
            })
        } else {
            navigate('/')
        }
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
            <div className="mb-8 flex flex-col items-center text-center">
                <div className="h-16 w-16 bg-[#2b5ba9] rounded-2xl flex items-center justify-center text-white shadow-lg mb-4">
                    <Shield size={32} />
                </div>
                <h1 className="text-3xl font-bold text-slate-900">SafeMap GenSan</h1>
                <p className="text-muted-foreground uppercase tracking-widest text-[10px] font-black mt-1">Official Portal</p>
            </div>

            <Card className="w-full max-w-md glass-card-heavy">
                <CardHeader className="header-blue rounded-t-2xl">
                    <CardTitle className="text-xl">Welcome Back</CardTitle>
                    <CardDescription className="text-blue-100/80">Sign in to access official tools</CardDescription>
                </CardHeader>
                <CardContent className="p-8 pt-8 pt-6">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <label className="label-title">Institutional Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3 text-slate-400" size={18} />
                                <Input
                                    type="email"
                                    placeholder="name@agency.gov.ph"
                                    className="pl-10 h-12 bg-slate-50 border-slate-200 focus:bg-white"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="label-title">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 text-slate-400" size={18} />
                                <Input
                                    type="password"
                                    placeholder="••••••••"
                                    className="pl-10 h-12 bg-slate-50 border-slate-200 focus:bg-white"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <Button type="submit" className="w-full h-12 btn-submit-blue text-lg mt-2" disabled={isLoading}>
                            {isLoading ? <Loader2 className="animate-spin mr-2" size={20} /> : 'Sign In'}
                            {!isLoading && <ChevronRight className="ml-2" size={20} />}
                        </Button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-sm text-muted-foreground font-medium">
                            Official Institutional Access
                        </p>

                        <div className="mt-4 grid grid-cols-2 gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                className="text-[10px] font-black uppercase tracking-tighter border-slate-200 hover:bg-slate-50"
                                onClick={() => {
                                    setDemoRole('pnp_officer')
                                    navigate('/')
                                }}
                            >
                                PNP Demo
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                className="text-[10px] font-black uppercase tracking-tighter border-slate-200 hover:bg-slate-50"
                                onClick={() => {
                                    setDemoRole('dilg_admin')
                                    navigate('/')
                                }}
                            >
                                DILG Admin Demo
                            </Button>
                        </div>

                        <div className="mt-6 flex flex-col gap-2">
                            <p className="text-sm text-muted-foreground">
                                Don't have an account?{' '}
                                <Link to="/register" className="text-[#2b5ba9] font-bold hover:underline">
                                    Register as Official
                                </Link>
                            </p>
                            <div className="pt-4 border-t border-slate-100">
                                <Link to="/" className="text-xs text-[#2b5ba9] font-black uppercase tracking-widest hover:text-slate-900 transition-colors">
                                    Continue as Anonymous Citizen
                                </Link>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
