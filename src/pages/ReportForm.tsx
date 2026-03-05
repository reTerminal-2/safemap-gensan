import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { FileText, Camera, Users, ShieldCheck, ChevronRight, ChevronLeft, MapPin } from 'lucide-react'
import { cn } from '@/lib/utils'
import { incidentStep1Schema, incidentStep2Schema, incidentStep3Schema, type IncidentReportForm } from '@/schemas/incident.schema'
import { useOfflineQueue } from '@/hooks/useOfflineQueue'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/contexts/AuthContext'

export default function ReportForm() {
    const { user } = useAuth()
    const [step, setStep] = useState(1)
    const { enqueue, isOnline } = useOfflineQueue()
    const { toast } = useToast()

    const form = useForm<Partial<IncidentReportForm>>({
        resolver: zodResolver(
            (step === 1 ? incidentStep1Schema : step === 2 ? incidentStep2Schema : incidentStep3Schema) as any
        ),
        defaultValues: {
            type: 'theft',
            severity: 'medium',
            is_anonymous: false,
            witness_count: 0,
            photo_urls: []
        }
    })

    const nextStep = async () => {
        const fields = step === 1
            ? ['type', 'severity', 'barangay_id', 'date_occurred', 'title']
            : step === 2
                ? ['description', 'address']
                : []

        const isValid = await form.trigger(fields as any)
        if (isValid) setStep(prev => prev + 1)
    }

    const prevStep = () => setStep(prev => prev - 1)

    const onSubmit = async (data: Partial<IncidentReportForm>) => {
        try {
            const submission = {
                ...data,
                reporter_id: user?.id || 'anonymous',
                reporter_name: data.is_anonymous ? 'Anonymous Citizen' : (user?.full_name || 'Anonymous'),
                status: 'pending_review',
                latitude: 6.1167, // Default for demo
                longitude: 125.1667,
                address: data.address || '',
                barangay_id: data.barangay_id || '',
            }

            enqueue(submission as any)

            toast({
                title: isOnline ? "Report Submitted" : "Saved Offline",
                description: isOnline
                    ? "The report has been successfully uploaded to the system."
                    : "Report stored locally. It will sync automatically when you are back online.",
                variant: isOnline ? "default" : "destructive"
            })

            form.reset()
            setStep(1)
        } catch (error) {
            toast({
                title: "Submission Error",
                description: "There was a problem saving your report. Please try again.",
                variant: "destructive"
            })
        }
    }

    return (
        <div className="p-6 pt-10 pb-24 max-w-xl mx-auto flex flex-col min-h-full bg-slate-50">
            <div className="mb-8">
                <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                    <FileText className="text-[#2b5ba9]" />
                    Incident Report
                </h1>
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1">
                    PNP Field Reporting System
                </p>
            </div>

            <div className="mb-8 px-2">
                <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase mb-2 tracking-tighter">
                    <span className={cn(step >= 1 && "text-[#2b5ba9]")}>Basics</span>
                    <span className={cn(step >= 2 && "text-[#2b5ba9]")}>Location</span>
                    <span className={cn(step >= 3 && "text-[#2b5ba9]")}>Review</span>
                </div>
                <Progress value={(step / 3) * 100} className="h-1.5 bg-slate-200" />
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="flex-1 flex flex-col">
                    {step === 1 && (
                        <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
                            <FormField
                                control={form.control}
                                name="title"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="label-title">Incident Title</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g., Shoplifting at KCC Mall" className="h-12 bg-white border-slate-200" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="type"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="label-title">Type</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger className="h-12 bg-white border-slate-200">
                                                        <SelectValue placeholder="Select type" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="theft">Theft</SelectItem>
                                                    <SelectItem value="robbery">Robbery</SelectItem>
                                                    <SelectItem value="assault">Assault</SelectItem>
                                                    <SelectItem value="drug_related">Drug Related</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="severity"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="label-title">Severity</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger className="h-12 bg-white border-slate-200">
                                                        <SelectValue placeholder="Severity" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="low">Low</SelectItem>
                                                    <SelectItem value="medium">Medium</SelectItem>
                                                    <SelectItem value="high">High</SelectItem>
                                                    <SelectItem value="critical">Critical</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="barangay_id"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="label-title">Barangay</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="h-12 bg-white border-slate-200">
                                                    <SelectValue placeholder="Select Area" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="brgy_lagao">Lagao</SelectItem>
                                                <SelectItem value="brgy_calumpang">Calumpang</SelectItem>
                                                <SelectItem value="brgy_city_heights">City Heights</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="date_occurred"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="label-title">Date & Time occurred</FormLabel>
                                        <FormControl>
                                            <Input type="datetime-local" className="h-12 bg-white border-slate-200" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="is_anonymous"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 space-y-0">
                                        <div className="space-y-0.5">
                                            <FormLabel className="text-sm font-black text-slate-800 uppercase">Submit Anonymously</FormLabel>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Identity hidden from public</p>
                                        </div>
                                        <FormControl>
                                            <Button
                                                type="button"
                                                variant={field.value ? "default" : "outline"}
                                                className={cn("h-10 px-6 rounded-xl font-black transition-all", field.value ? "bg-[#2b5ba9]" : "border-slate-200 bg-slate-50 text-slate-400")}
                                                onClick={() => field.onChange(!field.value)}
                                            >
                                                {field.value ? "ON" : "OFF"}
                                            </Button>
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
                            <FormField
                                control={form.control}
                                name="address"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="label-title">Specific Location/Address</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <MapPin className="absolute left-3 top-3.5 text-slate-400" size={18} />
                                                <Input placeholder="Street, Landmark, etc." className="h-12 pl-10 bg-white border-slate-200" {...field} />
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="label-title">Incident Details</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Describe what happened with as much detail as possible..."
                                                className="min-h-[150px] bg-white border-slate-200 focus:bg-white"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                            <Card className="p-4 border-none bg-blue-50/50 border-blue-100">
                                <div className="flex items-center gap-3 text-[#2b5ba9] font-black uppercase text-xs mb-3">
                                    <ShieldCheck size={18} />
                                    Review Submission
                                </div>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center group">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Title</span>
                                        <span className="text-sm font-bold text-slate-800">{form.getValues('title')}</span>
                                    </div>
                                    <div className="flex justify-between items-center group">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Type</span>
                                        <Badge className="bg-[#2b5ba9]/10 text-[#2b5ba9] border-none uppercase text-[9px] font-black">{form.getValues('type')}</Badge>
                                    </div>
                                    <div className="flex justify-between items-center group">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Location</span>
                                        <span className="text-sm font-bold text-slate-800 truncate max-w-[150px]">{form.getValues('address')}</span>
                                    </div>
                                </div>
                            </Card>

                            <div className="grid grid-cols-2 gap-4">
                                <Button variant="outline" className="h-[100px] flex flex-col gap-2 rounded-2xl border-slate-200 bg-white hover:bg-slate-50 transition-colors">
                                    <Camera size={24} className="text-slate-400" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Add Photos</span>
                                </Button>
                                <Button variant="outline" className="h-[100px] flex flex-col gap-2 rounded-2xl border-slate-200 bg-white hover:bg-slate-50 transition-colors">
                                    <Users size={24} className="text-slate-400" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Witnesses</span>
                                </Button>
                            </div>
                        </div>
                    )}

                    <div className="mt-10 flex gap-4 pt-4">
                        {step > 1 && (
                            <Button type="button" variant="ghost" className="h-14 w-14 rounded-2xl bg-slate-200 text-slate-600" onClick={prevStep}>
                                <ChevronLeft size={24} />
                            </Button>
                        )}
                        {step < 3 ? (
                            <Button type="button" className="flex-1 h-14 rounded-2xl text-lg font-black uppercase tracking-wide bg-[#2b5ba9] hover:bg-[#1e4480]" onClick={nextStep}>
                                Continue
                                <ChevronRight size={20} className="ml-2" />
                            </Button>
                        ) : (
                            <Button type="submit" className="flex-1 h-14 rounded-2xl text-lg font-black uppercase tracking-wide bg-[#2b5ba9] hover:bg-[#1e4480]">
                                Submit Report
                            </Button>
                        )}
                    </div>
                </form>
            </Form>
        </div>
    )
}
