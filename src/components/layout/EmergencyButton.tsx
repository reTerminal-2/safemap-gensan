import { useState } from 'react'
import { Phone, AlertCircle, Shield, Users, Heart, MapPin, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    Drawer,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
    DrawerDescription,
    DrawerFooter,
    DrawerTrigger,
} from '@/components/ui/drawer'
import { Separator } from '@/components/ui/separator'

const EMERGENCY_CONTACTS = [
    {
        name: 'National Emergency',
        number: '911',
        icon: <AlertCircle className="text-red-500" />,
        description: 'Police, Fire, Medical'
    },
    {
        name: 'PNP GenSan Hotline',
        number: '122 / (083) 552-3935',
        icon: <Shield className="text-blue-500" />,
        description: 'GenSan Police Station'
    },
    {
        name: 'Women & Children Desk',
        number: '(083) 301-3142',
        icon: <Users className="text-pink-500" />,
        description: 'WCPD Specialist'
    },
    {
        name: 'DSWD Crisis Hotline',
        number: '0919-065-1554',
        icon: <Heart className="text-orange-500" />,
        description: 'Social Welfare & Development'
    },
    {
        name: 'Barangay VAWC',
        number: 'Contact Local Barangay Hall',
        icon: <MapPin className="text-green-500" />,
        description: 'Community Protection'
    }
]

export default function EmergencyButton() {
    const [open, setOpen] = useState(false)

    return (
        <div className="fixed bottom-24 right-6 z-[60] md:bottom-10">
            <Drawer open={open} onOpenChange={setOpen}>
                <DrawerTrigger asChild>
                    <Button
                        size="lg"
                        className="h-14 w-14 rounded-full bg-red-600 hover:bg-red-700 shadow-lg shadow-red-900/20 border-2 border-white/20 animate-pulse"
                    >
                        <Phone className="h-6 w-6 text-white" />
                    </Button>
                </DrawerTrigger>
                <DrawerContent className="bg-slate-950 border-white/10">
                    <div className="mx-auto w-full max-w-md">
                        <DrawerHeader>
                            <DrawerTitle className="text-2xl font-bold flex items-center gap-2 text-red-500">
                                <AlertCircle size={24} />
                                Get Help Now
                            </DrawerTitle>
                            <DrawerDescription>
                                If you are in immediate danger, please call national emergency services first.
                            </DrawerDescription>
                        </DrawerHeader>

                        <div className="p-4 space-y-3">
                            {EMERGENCY_CONTACTS.map((contact, i) => (
                                <a
                                    key={i}
                                    href={`tel:${contact.number.split(' / ')[0]}`}
                                    className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors group"
                                >
                                    <div className="h-12 w-12 rounded-xl bg-white/5 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                                        {contact.icon}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-bold text-sm">{contact.name}</h3>
                                        <p className="text-lg font-mono text-primary">{contact.number}</p>
                                        <p className="text-xs text-muted-foreground">{contact.description}</p>
                                    </div>
                                    <Phone size={18} className="text-muted-foreground/30 group-hover:text-primary transition-colors" />
                                </a>
                            ))}

                            <Separator className="my-4 bg-white/10" />

                            <Button variant="outline" className="w-full h-12 rounded-xl border-white/10 bg-white/5 gap-2">
                                <MapPin size={18} />
                                Locate Nearest Police Station
                            </Button>
                        </div>

                        <DrawerFooter className="pt-2">
                            <Button variant="ghost" className="w-full" onClick={() => setOpen(false)}>
                                <X size={20} className="mr-2" />
                                Close
                            </Button>
                        </DrawerFooter>
                    </div>
                </DrawerContent>
            </Drawer>
        </div>
    )
}
