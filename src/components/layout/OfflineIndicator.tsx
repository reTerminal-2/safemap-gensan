import { useOfflineQueue } from '@/hooks/useOfflineQueue'
import { WifiOff, RefreshCw, CheckCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

export default function OfflineIndicator() {
    const { isOnline, queueLength, isSyncing, syncQueue } = useOfflineQueue()

    // Fully online with empty queue → show nothing
    if (isOnline && queueLength === 0) return null

    return (
        <div
            className={cn(
                'flex items-center justify-between gap-3 px-4 py-2 text-sm font-medium',
                'border-b border-border/50 transition-all duration-300 animate-slide-up',
                !isOnline
                    ? 'bg-warning/10 text-warning border-warning/20'
                    : 'bg-primary/10 text-primary border-primary/20'
            )}
        >
            <div className="flex items-center gap-2">
                {!isOnline ? (
                    <WifiOff size={14} className="shrink-0" />
                ) : (
                    <RefreshCw size={14} className={cn('shrink-0', isSyncing && 'animate-spin')} />
                )}
                <span>
                    {!isOnline
                        ? `Offline — ${queueLength} report${queueLength !== 1 ? 's' : ''} queued`
                        : isSyncing
                            ? 'Syncing reports...'
                            : `${queueLength} report${queueLength !== 1 ? 's' : ''} pending sync`}
                </span>
            </div>

            {isOnline && !isSyncing && queueLength > 0 && (
                <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 px-2 text-xs text-primary hover:bg-primary/10"
                    onClick={() => syncQueue()}
                >
                    <CheckCircle size={12} className="mr-1" />
                    Sync now
                </Button>
            )}
        </div>
    )
}
