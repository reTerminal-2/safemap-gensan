import { useState, useEffect, useCallback } from 'react'
import type { OfflineQueueItem, IncidentReport } from '@/types'
import { supabase } from '@/lib/supabase'

const QUEUE_KEY = 'safemap_offline_queue'

export function useOfflineQueue() {
    const [isOnline, setIsOnline] = useState(navigator.onLine)
    const [queue, setQueue] = useState<OfflineQueueItem[]>([])
    const [isSyncing, setIsSyncing] = useState(false)

    // Load queue from localStorage
    useEffect(() => {
        try {
            const stored = localStorage.getItem(QUEUE_KEY)
            if (stored) setQueue(JSON.parse(stored) as OfflineQueueItem[])
        } catch {
            console.error('[OfflineQueue] Failed to load queue from localStorage')
        }
    }, [])

    // Save queue to localStorage
    useEffect(() => {
        localStorage.setItem(QUEUE_KEY, JSON.stringify(queue))
    }, [queue])

    // Listen to online/offline events
    useEffect(() => {
        const onOnline = () => setIsOnline(true)
        const onOffline = () => setIsOnline(false)

        window.addEventListener('online', onOnline)
        window.addEventListener('offline', onOffline)
        return () => {
            window.removeEventListener('online', onOnline)
            window.removeEventListener('offline', onOffline)
        }
    }, [])

    // Auto-sync
    useEffect(() => {
        if (isOnline && queue.length > 0 && !isSyncing) {
            syncQueue()
        }
    }, [isOnline])

    const enqueue = useCallback((payload: Partial<IncidentReport>) => {
        const item: OfflineQueueItem = {
            id: `offline-${Date.now()}-${Math.random().toString(36).slice(2)}`,
            type: 'incident_report',
            payload,
            created_at: new Date().toISOString(),
            retry_count: 0,
        }
        setQueue((prev) => [...prev, item])
        return item.id
    }, [])

    const syncQueue = useCallback(async () => {
        if (!isOnline || queue.length === 0) return
        setIsSyncing(true)

        const failed: OfflineQueueItem[] = []

        for (const item of queue) {
            try {
                // Prepare payload for Supabase
                const payload = {
                    ...item.payload,
                    location: {
                        lat: (item.payload as any).latitude || 6.1167,
                        lng: (item.payload as any).longitude || 125.1667,
                        address: (item.payload as any).address || 'GenSan'
                    },
                    is_offline_queued: true,
                    created_at: item.created_at
                }

                const { error } = await supabase.from('incidents').insert([payload])
                if (error) throw error
            } catch (err) {
                console.error('[OfflineQueue] Sync failed for item', item.id, err)
                failed.push({
                    ...item,
                    retry_count: item.retry_count + 1,
                    last_attempted: new Date().toISOString(),
                })
            }
        }

        setQueue(failed)
        setIsSyncing(false)
    }, [isOnline, queue])

    const clearQueue = useCallback(() => {
        setQueue([])
        localStorage.removeItem(QUEUE_KEY)
    }, [])

    return {
        isOnline,
        queue,
        queueLength: queue.length,
        isSyncing,
        enqueue,
        syncQueue,
        clearQueue,
    }
}
