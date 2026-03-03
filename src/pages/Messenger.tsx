import { useState, useEffect, useRef } from 'react'
import { Send, Shield, MessageSquare } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { supabase } from '@/lib/supabase'

interface Message {
    id: string
    sender_id: string
    sender_name: string
    content: string
    created_at: string
    is_admin?: boolean
}

export default function Messenger() {
    const { user, isAuthenticated } = useAuth()
    const [messages, setMessages] = useState<Message[]>([])
    const [newMessage, setNewMessage] = useState('')
    const messagesEndRef = useRef<HTMLDivElement>(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    useEffect(() => {
        const fetchMessages = async () => {
            const { data, error } = await supabase
                .from('messages')
                .select('*')
                .order('created_at', { ascending: true })
                .limit(50)

            if (error) {
                console.error('Error fetching messages:', error)
            } else {
                setMessages(data || [])
            }
        }

        fetchMessages()

        // Subscribe to real-time changes
        const channel = supabase
            .channel('public:messages')
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'messages'
            }, (payload) => {
                setMessages((prev) => [...prev, payload.new as Message])
            })
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [])

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    const handleSend = async () => {
        if (!newMessage.trim()) return

        try {
            const { error } = await supabase
                .from('messages')
                .insert([{
                    content: newMessage,
                    sender_id: user?.id,
                    sender_name: user?.full_name || 'Anonymous Citizen',
                    is_admin: user?.role !== 'public'
                }])

            if (error) throw error
            setNewMessage('')
        } catch (error) {
            console.error('Error sending message:', error)
        }
    }

    return (
        <div className="flex flex-col h-full bg-slate-50">
            {/* Header */}
            <header className="header-blue flex items-center justify-between z-10">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-white/20 rounded-xl flex items-center justify-center border border-white/30 shrink-0">
                        <MessageSquare size={20} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-sm font-black uppercase tracking-tight">SafeMap Messenger</h1>
                        <p className="text-[10px] text-blue-100/70 font-bold uppercase tracking-widest leading-none">Official Citizen Inquiries (Supabase)</p>
                    </div>
                </div>
                <div className="bg-white/10 px-3 py-1 rounded-full border border-white/20 flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-wider text-white">Live Operations</span>
                </div>
            </header>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <div className="flex flex-col items-center mb-6">
                    <div className="bg-blue-50 border border-blue-100 rounded-2xl px-4 py-2 text-center max-w-sm">
                        <p className="text-[10px] font-black uppercase text-[#2b5ba9] mb-1">Notice</p>
                        <p className="text-[11px] text-slate-600 font-bold">You are chatting with official GenSan responders via a secure Supabase backend.</p>
                    </div>
                </div>

                {messages.map((msg) => {
                    const isCurrentUser = msg.sender_id === user?.id || (msg.sender_name === 'Anonymous Citizen' && !isAuthenticated)
                    return (
                        <div
                            key={msg.id}
                            className={cn(
                                "flex flex-col max-w-[85%]",
                                !isCurrentUser ? "self-start items-start" : "self-end items-end ml-auto"
                            )}
                        >
                            <div className="flex items-center gap-2 mb-1 px-1">
                                {!isCurrentUser && <Shield size={10} className="text-[#2b5ba9]" />}
                                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                                    {msg.sender_name}
                                </span>
                            </div>
                            <div
                                className={cn(
                                    "px-4 py-3 rounded-2xl shadow-sm text-sm font-bold min-w-[60px]",
                                    !isCurrentUser
                                        ? "bg-white border border-slate-200 text-slate-800 rounded-tl-none"
                                        : "bg-[#2b5ba9] text-white rounded-tr-none"
                                )}
                            >
                                {msg.content}
                                <p className={cn(
                                    "text-[9px] mt-1.5 opacity-50 block",
                                    !isCurrentUser ? "text-slate-400" : "text-white/70"
                                )}>
                                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>
                        </div>
                    )
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-slate-200 safe-area-pb">
                <div className="flex items-center gap-2 max-w-4xl mx-auto">
                    <div className="flex-1 relative">
                        <Input
                            placeholder="Type your inquiry here..."
                            className="h-12 bg-slate-50 border-slate-200 rounded-xl pl-4 pr-12 text-sm font-bold focus:bg-white transition-all shadow-inner"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        />
                        <button
                            onClick={handleSend}
                            className="absolute right-2 top-2 h-8 w-8 bg-[#2b5ba9] text-white rounded-lg flex items-center justify-center hover:bg-[#1e4480] transition-colors shadow-md"
                        >
                            <Send size={16} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
