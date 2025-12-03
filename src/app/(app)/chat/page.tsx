
"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { useSearchParams } from 'next/navigation';
import { useAuth } from "@/hooks/useAuth";
import type { User, Case, ChatMessage } from "@/lib/types";
import { mockUsers, mockMessages, mockCases } from "@/data/mockData";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, Send, Phone, Video, Users, User as UserIcon, ArrowLeft } from "lucide-react";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";

// Helper to generate a consistent conversation ID for 1-on-1 chats
const getOneOnOneId = (userId1: string, userId2: string) => {
  return [userId1, userId2].sort().join('_');
};

export default function ChatPage() {
    const { currentUser, isLoading: authIsLoading } = useAuth();
    const searchParams = useSearchParams();
    const scrollAreaRef = useRef<HTMLDivElement>(null);

    const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
    const [newMessage, setNewMessage] = useState("");
    const [allMessages, setAllMessages] = useState<ChatMessage[]>(mockMessages);
    const [isMobileConvoView, setIsMobileConvoView] = useState(false);


    const conversations = useMemo(() => {
        if (!currentUser) return [];

        const convos: { id: string; name: string; avatarUrl?: string; type: 'group' | 'dm' }[] = [];
        
        // 1. Add organization group chat
        if (currentUser.organizationId) {
            convos.push({
                id: currentUser.organizationId,
                name: "Bufete (General)",
                avatarUrl: "https://placehold.co/100x100/86B6F6/FFFFFF?text=BG",
                type: 'group',
            });
        }
        
        // 2. Add DMs with team members
        if (currentUser.organizationId) {
            mockUsers
                .filter(u => u.organizationId === currentUser.organizationId && u.id !== currentUser.id)
                .forEach(u => {
                    convos.push({
                        id: getOneOnOneId(currentUser.id, u.id),
                        name: u.name,
                        avatarUrl: u.profilePictureUrl,
                        type: 'dm',
                    });
                });
        }

        // 3. Add DMs with assigned clients (for lawyers) or assigned lawyer (for clients)
        let relevantCases: Case[] = [];
        if(currentUser.role === 'lawyer') {
            relevantCases = mockCases.filter(c => c.assignedLawyerId === currentUser.id);
        } else if (currentUser.role === 'client') {
            relevantCases = mockCases.filter(c => c.clientId === currentUser.id);
        }

        relevantCases.forEach(c => {
            const otherPartyId = currentUser.role === 'lawyer' ? c.clientId : c.assignedLawyerId;
            if (otherPartyId) {
                const otherUser = mockUsers.find(u => u.id === otherPartyId);
                if (otherUser && !convos.some(convo => convo.id === getOneOnOneId(currentUser.id, otherUser.id))) {
                     convos.push({
                        id: getOneOnOneId(currentUser.id, otherUser.id),
                        name: otherUser.name,
                        avatarUrl: otherUser.profilePictureUrl,
                        type: 'dm',
                    });
                }
            }
        });


        // De-duplicate conversations
        const uniqueConvos = Array.from(new Map(convos.map(item => [item.id, item])).values());
        
        return uniqueConvos;

    }, [currentUser]);


    useEffect(() => {
        // Set initial conversation
        const requestedConvId = searchParams.get('conversationId');
        if (requestedConvId && currentUser) {
            const directId = getOneOnOneId(currentUser.id, requestedConvId);
            const exists = conversations.find(c => c.id === directId || c.id === requestedConvId);
            if (exists) {
                setActiveConversationId(exists.id);
                setIsMobileConvoView(true); // Auto-open conversation on mobile if one is requested in URL
            }
        } else if (conversations.length > 0 && !activeConversationId) {
            setActiveConversationId(conversations[0].id);
        }
    }, [searchParams, conversations, currentUser, activeConversationId]);
    
    // Scroll to bottom when messages change
    useEffect(() => {
        if(scrollAreaRef.current) {
            scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
        }
    }, [allMessages, activeConversationId]);


    const activeConversationMessages = useMemo(() => {
        return allMessages.filter(m => m.conversationId === activeConversationId).sort((a,b) => parseISO(a.timestamp).getTime() - parseISO(b.timestamp).getTime());
    }, [activeConversationId, allMessages]);
    
    const activeConversationDetails = useMemo(() => {
        return conversations.find(c => c.id === activeConversationId);
    }, [activeConversationId, conversations]);

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !currentUser || !activeConversationId) return;

        const newMsg: ChatMessage = {
            id: `msg-${Date.now()}`,
            conversationId: activeConversationId,
            senderId: currentUser.id,
            senderName: currentUser.name,
            content: newMessage.trim(),
            timestamp: new Date().toISOString(),
        };

        setAllMessages(prev => [...prev, newMsg]);
        setNewMessage("");
    };

    if (authIsLoading) {
        return <div className="flex h-full items-center justify-center"><Loader2 className="animate-spin h-8 w-8" /></div>;
    }
    
    const handleConversationSelect = (convoId: string) => {
        setActiveConversationId(convoId);
        setIsMobileConvoView(true);
    };

    return (
        <div className="h-full flex flex-col">
            <Card className="flex-1 grid md:grid-cols-[300px_1fr] h-full overflow-hidden">
                {/* Conversations Sidebar */}
                <div className={cn(
                    "border-r flex-col",
                    isMobileConvoView ? "hidden md:flex" : "flex"
                )}>
                    <div className="p-4 border-b">
                        <h2 className="text-xl font-semibold tracking-tight">Conversaciones</h2>
                    </div>
                    <ScrollArea className="flex-1">
                        {conversations.map(convo => (
                            <button
                                key={convo.id}
                                onClick={() => handleConversationSelect(convo.id)}
                                className={cn(
                                    "w-full text-left p-3 flex items-center gap-3 transition-colors hover:bg-muted",
                                    activeConversationId === convo.id && "bg-muted font-semibold"
                                )}
                            >
                                <Avatar className="h-9 w-9">
                                    <AvatarImage src={convo.avatarUrl} alt={convo.name} />
                                    <AvatarFallback>
                                        {convo.type === 'group' ? <Users/> : <UserIcon/>}
                                    </AvatarFallback>
                                </Avatar>
                                <span className="truncate">{convo.name}</span>
                            </button>
                        ))}
                    </ScrollArea>
                </div>

                {/* Chat Area */}
                <div className={cn(
                    "flex-col h-full",
                    isMobileConvoView ? "flex" : "hidden md:flex"
                )}>
                    {activeConversationDetails ? (
                        <>
                            {/* Chat Header */}
                            <div className="p-4 border-b flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                     <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsMobileConvoView(false)}>
                                        <ArrowLeft className="h-5 w-5" />
                                    </Button>
                                     <Avatar className="h-10 w-10">
                                        <AvatarImage src={activeConversationDetails.avatarUrl} alt={activeConversationDetails.name} />
                                        <AvatarFallback>
                                            {activeConversationDetails.type === 'group' ? <Users/> : <UserIcon/>}
                                        </AvatarFallback>
                                    </Avatar>
                                    <h3 className="text-lg font-semibold">{activeConversationDetails.name}</h3>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button variant="ghost" size="icon" disabled>
                                        <Phone className="h-5 w-5" />
                                        <span className="sr-only">Llamada de Audio (Próximamente)</span>
                                    </Button>
                                    <Button variant="ghost" size="icon" disabled>
                                        <Video className="h-5 w-5" />
                                        <span className="sr-only">Videollamada (Próximamente)</span>
                                    </Button>
                                </div>
                            </div>

                            {/* Messages */}
                            <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
                                <div className="space-y-4">
                                    {activeConversationMessages.map(msg => (
                                        <div
                                            key={msg.id}
                                            className={cn(
                                                "flex items-end gap-2",
                                                msg.senderId === currentUser?.id ? "justify-end" : "justify-start"
                                            )}
                                        >
                                            <div className={cn(
                                                "p-3 rounded-lg max-w-xs md:max-w-md",
                                                msg.senderId === currentUser?.id 
                                                    ? "bg-primary text-primary-foreground" 
                                                    : "bg-muted"
                                            )}>
                                                <p className="font-bold text-sm mb-1">{msg.senderId === currentUser?.id ? "Tú" : msg.senderName}</p>
                                                <p className="text-base break-words">{msg.content}</p>
                                                <p className="text-xs opacity-75 mt-2 text-right">
                                                    {format(parseISO(msg.timestamp), 'p', { locale: es })}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>

                            {/* Message Input */}
                            <div className="p-4 border-t bg-background">
                                <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                                    <Input
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        placeholder="Escribe un mensaje..."
                                        autoComplete="off"
                                    />
                                    <Button type="submit" size="icon">
                                        <Send className="h-5 w-5" />
                                    </Button>
                                </form>
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                            <MessageSquare className="h-16 w-16 mb-4" />
                            <p className="text-center">Seleccione una conversación para empezar a chatear.</p>
                        </div>
                    )}
                </div>
            </Card>
        </div>
    );
}
