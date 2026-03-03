import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Shield, Lock, Mail, User, BadgeCheck, Building2, ChevronRight, Loader2 } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import type { UserRole } from '@/types'

export default function Register() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [fullName, setFullName] = useState('')
    const [role, setRole] = useState<UserRole>('pnp_officer')
    const [isLoading, setIsLoading] = useState(false)
    const { signUp } = useAuth()
    const navigate = useNavigate()
    const { toast } = useToast()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        const { error } = await signUp(email, password, { full_name: fullName, role })
        setIsLoading(false)

        if (error) {
            toast({
                title: 'Registration Failed',
                description: error,
                variant: 'destructive',
            })
        } else {
            toast({
                title: 'Registration Successful',
                description: 'Please wait for administrator verification.',
            })
            navigate('/login')
        }
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
            <div className="mb-8 flex flex-col items-center text-center">
                <div className="h-16 w-16 bg-[#2b5ba9] rounded-2xl flex items-center justify-center text-white shadow-lg mb-4">
                    <Shield size={32} />
                </div>
                <h1 className="text-3xl font-bold text-slate-900">Official Registration</h1>
                <p className="text-muted-foreground uppercase tracking-widest text-[10px] font-black mt-1">Institutional Access</p>
            </div>

            <Card className="w-full max-w-md glass-card-heavy">
                <CardHeader className="header-blue rounded-t-2xl">
                    <CardTitle className="text-xl">Create Account</CardTitle>
                    <CardDescription className="text-blue-100/80">Request access to official GenSan tools</CardDescription>
                </CardHeader>
                <CardContent className="p-8 pt-6">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <label className="label-title">Full Name</label>
                            <div className="relative">
                                <User className="absolute left-3 top-3 text-slate-400" size={18} />
                                <Input
                                    placeholder="Juan Dela Cruz"
                                    className="pl-10 h-12 bg-slate-50 border-slate-200"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="label-title">Institutional Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3 text-slate-400" size={18} />
                                <Input
                                    type="email"
                                    placeholder="name@agency.gov.ph"
                                    className="pl-10 h-12 bg-slate-50 border-slate-200"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="label-title">Role / Department</label>
                            <Select onValueChange={(v) => setRole(v as UserRole)} defaultValue={role}>
                                <SelectTrigger className="h-12 bg-slate-50 border-slate-200 w-full">
                                    <SelectValue placeholder="Select Role" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="pnp_officer">
                                        <div className="flex items-center gap-2">
                                            <BadgeCheck size={16} className="text-blue-600" />
                                            <span>PNP Officer</span>
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="barangay_official">
                                        <div className="flex items-center gap-2">
                                            <Building2 size={16} className="text-green-600" />
                                            <span>Barangay Official</span>
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="dilg_admin">
                                        <div className="flex items-center gap-2">
                                            <Shield size={16} className="text-purple-600" />
                                            <span>DILG Administrator</span>
                                        </div>
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <label className="label-title">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 text-slate-400" size={18} />
                                <Input
                                    type="password"
                                    placeholder="••••••••"
                                    className="pl-10 h-12 bg-slate-50 border-slate-200"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <Button type="submit" className="w-full h-12 btn-submit-blue text-lg mt-2" disabled={isLoading}>
                            {isLoading ? <Loader2 className="animate-spin mr-2" size={20} /> : 'Request Access'}
                            {!isLoading && <ChevronRight className="ml-2" size={20} />}
                        </Button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-sm text-muted-foreground">
                            Already have an account?{' '}
                            <Link to="/login" className="text-[#2b5ba9] font-bold hover:underline">
                                Sign In
                            </Link>
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
