import { useState, useEffect } from 'react'
import { Check, X, MapPin, ChevronRight, LayoutDashboard, Shield } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription } from '@/components/ui/drawer'
import { Separator } from '@/components/ui/separator'
import api from '@/lib/api'

export default function AdminQueue() {
    const [reports, setReports] = useState<any[]>([])
    const [selectedReport, setSelectedReport] = useState<any>(null)
    const [activeTab, setActiveTab] = useState('pending_review')

    const fetchReports = async () => {
        try {
            const res = await api.get('/incidents')
            setReports(res.data)
        } catch (error) {
            console.error('Error fetching reports from MongoDB:', error)
        }
    }

    useEffect(() => {
        fetchReports()
        const interval = setInterval(fetchReports, 5000)
        return () => clearInterval(interval)
    }, [])

    const filteredReports = reports.filter(r => r.status === activeTab)

    const handleUpdateStatus = async (id: string, status: string) => {
        try {
            await api.patch(`/incidents/${id}/status`, { status })
            setSelectedReport(null)
            fetchReports()
        } catch (error) {
            console.error('Error updating status:', error)
        }
    }

    return (
        <div className="p-6 pt-10 pb-24 max-w-2xl mx-auto bg-slate-50 min-h-full">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        <LayoutDashboard className="text-[#2b5ba9]" />
                        Validation Queue
                    </h1>
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1">
                        Screening & Official Validation (MongoDB)
                    </p>
                </div>
            </div>

            <Tabs defaultValue="pending_review" className="mb-6" onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-3 bg-slate-200/50 p-1 rounded-2xl h-12">
                    <TabsTrigger value="pending_review" className="rounded-xl text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-[#2b5ba9] data-[state=active]:text-white transition-all">
                        Pending ({reports.filter(r => r.status === 'pending_review').length})
                    </TabsTrigger>
                    <TabsTrigger value="verified" className="rounded-xl text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-green-600 data-[state=active]:text-white transition-all">
                        Verified
                    </TabsTrigger>
                    <TabsTrigger value="dismissed" className="rounded-xl text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-red-600 data-[state=active]:text-white transition-all">
                        Dismissed
                    </TabsTrigger>
                </TabsList>
            </Tabs>

            <div className="space-y-3">
                {filteredReports.map((report) => (
                    <Card
                        key={report._id}
                        className="glass-card bg-white border-slate-200 hover:border-[#2b5ba9]/30 transition-all active:scale-[0.98] cursor-pointer shadow-sm"
                        onClick={() => setSelectedReport(report)}
                    >
                        <CardContent className="p-4 flex items-center gap-4">
                            <div className={cn(
                                "h-12 w-12 shrink-0 rounded-2xl flex items-center justify-center border relative",
                                report.severity === 'high' || report.severity === 'critical' ? "bg-red-50 text-red-500 border-red-100" :
                                    report.severity === 'medium' ? "bg-amber-50 text-amber-500 border-amber-100" :
                                        "bg-green-50 text-green-500 border-green-100"
                            )}>
                                <Shield size={22} />
                                {report.is_anonymous && (
                                    <div className="absolute -top-1 -right-1 h-4 w-4 bg-slate-800 text-[8px] flex items-center justify-center rounded-full border border-white font-black text-white">?</div>
                                )}
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-0.5">
                                    <span className="text-[10px] font-black text-slate-400 tracking-widest uppercase truncate mr-2">
                                        CASE-{report._id.slice(-8).toUpperCase()}
                                    </span>
                                    <span className="text-[10px] text-slate-400 font-bold shrink-0">{new Date(report.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                                <h3 className="font-black text-base text-slate-900 truncate italic">{report.title || `${report.type} Incident`}</h3>
                                <div className="flex items-center gap-2">
                                    <p className="text-xs text-slate-500 font-bold">
                                        Near <span className="text-slate-800 font-black">{report.barangay_id?.replace('brgy_', '') || 'Unknown'}</span>
                                    </p>
                                    {report.is_anonymous && (
                                        <Badge variant="outline" className="h-4 text-[8px] border-slate-200 uppercase bg-slate-50 font-black">Anonymous</Badge>
                                    )}
                                </div>
                            </div>
                            <ChevronRight size={18} className="text-slate-300" />
                        </CardContent>
                    </Card>
                ))}

                {filteredReports.length === 0 && (
                    <div className="py-20 text-center space-y-3">
                        <div className="h-16 w-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto">
                            <Check size={32} className="text-slate-300" />
                        </div>
                        <p className="text-slate-400 font-black uppercase text-[10px] tracking-widest">No reports in {activeTab}</p>
                    </div>
                )}
            </div>

            <Drawer open={!!selectedReport} onOpenChange={(open) => !open && setSelectedReport(null)}>
                <DrawerContent className="bg-white border-slate-200 max-h-[90vh]">
                    {selectedReport && (
                        <>
                            <DrawerHeader className="text-left pb-0">
                                <div className="flex items-center justify-between mb-2">
                                    <Badge variant="outline" className="border-[#2b5ba9]/30 bg-[#2b5ba9]/10 text-[#2b5ba9] uppercase font-black text-[10px]">
                                        REPORTED {new Date(selectedReport.created_at).toLocaleString()}
                                    </Badge>
                                </div>
                                <DrawerTitle className="text-2xl font-black text-slate-900 tracking-tight italic">
                                    {selectedReport.type} Details
                                </DrawerTitle>
                                <DrawerDescription className="flex items-center gap-1 text-[10px] font-black uppercase text-slate-400">
                                    <MapPin size={12} />
                                    {selectedReport.address || 'Unknown Location'}
                                </DrawerDescription>
                            </DrawerHeader>

                            <div className="p-6 space-y-6 overflow-y-auto">
                                <div className="space-y-4">
                                    {selectedReport.is_anonymous && (
                                        <div className="p-3 rounded-xl bg-blue-50 border border-blue-100 text-[11px] text-[#2b5ba9] font-bold italic">
                                            "This is an anonymous community report. Please verify location and details before official registration."
                                        </div>
                                    )}

                                    <div>
                                        <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Public Statement</h4>
                                        <p className="text-sm font-bold leading-relaxed text-slate-800 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                            {selectedReport.description || "No additional details provided by the reporter."}
                                        </p>
                                    </div>
                                </div>

                                <Separator className="bg-slate-100" />

                                {selectedReport.status === 'pending_review' ? (
                                    <div className="flex gap-4">
                                        <Button
                                            onClick={() => handleUpdateStatus(selectedReport._id, 'verified')}
                                            className="flex-1 h-14 rounded-2xl bg-green-600 hover:bg-green-700 text-white font-black gap-2 text-base shadow-lg shadow-green-100"
                                        >
                                            <Check size={20} />
                                            Verify Report
                                        </Button>
                                        <Button
                                            onClick={() => handleUpdateStatus(selectedReport._id, 'dismissed')}
                                            variant="ghost" className="h-14 w-14 rounded-2xl bg-red-50 text-red-600 hover:bg-red-100"
                                        >
                                            <X size={24} />
                                        </Button>
                                    </div>
                                ) : (
                                    <div className={cn(
                                        "p-4 rounded-2xl border flex items-center justify-center font-black uppercase tracking-widest text-xs gap-2",
                                        selectedReport.status === 'verified' ? "bg-green-50 text-green-600 border-green-100" : "bg-red-50 text-red-600 border-red-100"
                                    )}>
                                        {selectedReport.status === 'verified' ? <Check size={16} /> : <X size={16} />}
                                        Status: {selectedReport.status}
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </DrawerContent>
            </Drawer>
        </div>
    )
}
