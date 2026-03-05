import { useState, useEffect } from 'react'
import { MapPin, Send, Shield, Trash2, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { supabase } from '@/lib/supabase'
import type { IncidentType, SeverityLevel } from '@/types'

interface Alert {
    id: string
    type: string
    title: string
    description: string
    location: { lat: number, lng: number }
    severity: string
    created_at: string
}

export default function AdminAlerts() {
    const [alerts, setAlerts] = useState<Alert[]>([])
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [type, setType] = useState<IncidentType>('other')
    const [severity, setSeverity] = useState<SeverityLevel>('medium')

    const fetchAlerts = async () => {
        try {
            const { data, error } = await supabase
                .from('alerts')
                .select('*')
                .order('created_at', { ascending: false })

            if (error) throw error
            setAlerts(data || [])
        } catch (error) {
            console.error('Error fetching alerts:', error)
        }
    }

    useEffect(() => {
        fetchAlerts()

        const channel = supabase
            .channel('public:alerts_admin')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'alerts' }, () => {
                fetchAlerts()
            })
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [])

    const handleCreateAlert = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            const { error } = await supabase
                .from('alerts')
                .insert([{
                    type,
                    title,
                    description,
                    location: { lat: 6.1164, lng: 125.1716 }, // Default for mock
                    severity
                }])

            if (error) throw error
            setTitle('')
            setDescription('')
            fetchAlerts()
        } catch (error) {
            console.error('Error creating alert:', error)
        }
    }

    const removeAlert = async (id: string) => {
        try {
            const { error } = await supabase
                .from('alerts')
                .delete()
                .eq('id', id)

            if (error) throw error
            fetchAlerts()
        } catch (error) {
            console.error('Error removing alert:', error)
        }
    }

    return (
        <div className="p-6 pt-10 pb-24 max-w-4xl mx-auto space-y-8 bg-slate-50 min-h-full">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        <Shield className="text-[#2b5ba9]" />
                        GenSan Alert Manager
                    </h1>
                    <p className="text-muted-foreground text-[10px] font-black uppercase tracking-widest mt-1">Official Response & Public Notifications (Supabase)</p>
                </div>
                <Badge className="bg-[#2b5ba9] text-white border-none px-3 py-1 font-black">OFFICIAL MODE</Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Create Alert Form */}
                <Card className="glass-card-heavy border-none h-fit">
                    <CardHeader className="header-blue rounded-t-2xl">
                        <CardTitle className="text-lg">Broadcast New Alert</CardTitle>
                        <CardDescription className="text-blue-100/70">Place a real-time indicator on the map for all citizens</CardDescription>
                    </CardHeader>
                    <CardContent className="p-6 space-y-4">
                        <form onSubmit={handleCreateAlert} className="space-y-4">
                            <div className="space-y-2">
                                <label className="label-title">Alert Title</label>
                                <Input
                                    placeholder="e.g., Road Blockage / Active Fire"
                                    className="h-11 bg-slate-50 border-slate-200 shadow-sm font-bold"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="label-title">Category</label>
                                    <Select onValueChange={(v) => setType(v as IncidentType)} value={type}>
                                        <SelectTrigger className="h-11 bg-slate-50 border-slate-200">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="theft">Theft</SelectItem>
                                            <SelectItem value="robbery">Robbery</SelectItem>
                                            <SelectItem value="assault">Assault</SelectItem>
                                            <SelectItem value="other">General Alert</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <label className="label-title">Severity</label>
                                    <Select onValueChange={(v) => setSeverity(v as SeverityLevel)} value={severity}>
                                        <SelectTrigger className="h-11 bg-slate-50 border-slate-200">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="low">Low (Notice)</SelectItem>
                                            <SelectItem value="medium">Medium (Warning)</SelectItem>
                                            <SelectItem value="high">High (Danger)</SelectItem>
                                            <SelectItem value="critical">Critical (Immediate Action)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="label-title">Public Instructions</label>
                                <Textarea
                                    placeholder="Describe the situation and provide safety advice..."
                                    className="min-h-[100px] bg-slate-50 border-slate-200 shadow-sm font-bold"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    required
                                />
                            </div>

                            <Button type="submit" className="w-full h-12 btn-submit-blue text-md">
                                <Send className="mr-2" size={18} />
                                Broadcast to Citizen Map
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Active Alerts List */}
                <div className="space-y-4">
                    <h2 className="text-sm font-black text-slate-500 uppercase tracking-widest px-1">Currently Active Broadcasts</h2>
                    {alerts.length === 0 ? (
                        <div className="p-8 text-center bg-white border border-slate-200 border-dashed rounded-2xl">
                            <Clock className="mx-auto text-slate-300 mb-2" size={32} />
                            <p className="text-slate-400 text-sm font-bold">No active map alerts</p>
                        </div>
                    ) : (
                        alerts.map((alert) => (
                            <Card key={alert.id} className="glass-card overflow-hidden group">
                                <div className={cn(
                                    "h-1.5 w-full",
                                    alert.severity === 'critical' ? "bg-red-600" :
                                        alert.severity === 'high' ? "bg-red-400" :
                                            alert.severity === 'medium' ? "bg-amber-400" : "bg-blue-400"
                                )} />
                                <CardContent className="p-4">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <Badge variant="outline" className="text-[8px] font-black uppercase border-slate-200">
                                                    {alert.type}
                                                </Badge>
                                                <span className="text-[9px] text-slate-400 font-bold uppercase">
                                                    {new Date(alert.created_at).toLocaleTimeString()}
                                                </span>
                                            </div>
                                            <h3 className="text-base font-black text-slate-900 leading-tight mb-1">{alert.title}</h3>
                                            <p className="text-xs text-slate-600 font-bold leading-relaxed">{alert.description}</p>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                                            onClick={() => removeAlert(alert.id)}
                                        >
                                            <Trash2 size={16} />
                                        </Button>
                                    </div>
                                    <div className="mt-3 pt-3 border-t border-slate-50 flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-tight">
                                        <MapPin size={12} />
                                        Coordinate Marker: {alert.location?.lat?.toFixed(4) || '0'}, {alert.location?.lng?.toFixed(4) || '0'}
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>
            </div>
        </div>
    )
}
