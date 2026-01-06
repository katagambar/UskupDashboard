"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
    Bot,
    User,
    Send,
    Loader2,
    Sparkles,
    BookOpen,
    FileText,
    Mail,
    Scale,
    RefreshCw,
    Copy,
    Check
} from "lucide-react"
import { cn } from "@/lib/utils"

interface Citation {
    title: string
    author: string
    reference: string
    excerpt: string
}

interface Message {
    id: string
    role: 'user' | 'assistant'
    content: string
    citations?: Citation[]
    relatedQuestions?: string[]
    timestamp: Date
}

type UseCase = 'general' | 'notulensi' | 'surat' | 'keputusan'

const useCaseConfig: Record<UseCase, { label: string; icon: typeof BookOpen; description: string }> = {
    general: {
        label: 'Konsultasi Umum',
        icon: BookOpen,
        description: 'Tanya jawab tentang ajaran Gereja Katolik'
    },
    notulensi: {
        label: 'Bantuan Notulensi',
        icon: FileText,
        description: 'Ringkas notulensi dengan perspektif pastoral'
    },
    surat: {
        label: 'Draft Surat',
        icon: Mail,
        description: 'Bantu draft surat pastoral dengan referensi Magisterium'
    },
    keputusan: {
        label: 'Telaah Keputusan',
        icon: Scale,
        description: 'Telaah isu dengan perspektif teologis dan pastoral'
    }
}

/**
 * Convert markdown-like text to styled HTML
 */
function formatAIResponse(text: string): string {
    return text
        // Escape HTML first
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        // Headers (## and ###)
        .replace(/^### (.+)$/gm, '<h3>$1</h3>')
        .replace(/^## (.+)$/gm, '<h2>$1</h2>')
        // Bold (**text** or __text__)
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/__(.+?)__/g, '<strong>$1</strong>')
        // Italic (*text* or _text_)
        .replace(/\*([^*]+)\*/g, '<em>$1</em>')
        .replace(/_([^_]+)_/g, '<em>$1</em>')
        // Blockquotes (> text)
        .replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>')
        // Superscript citations [^1] or ¹
        .replace(/\[\^(\d+)\]/g, '<sup>[$1]</sup>')
        .replace(/([¹²³⁴⁵⁶⁷⁸⁹⁰]+)/g, '<sup>$1</sup>')
        // Bullet points
        .replace(/^- (.+)$/gm, '<li>$1</li>')
        .replace(/^• (.+)$/gm, '<li>$1</li>')
        .replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>')
        // Numbered lists
        .replace(/^\d+\. (.+)$/gm, '<li>$1</li>')
        // Paragraphs (double newlines)
        .replace(/\n\n/g, '</p><p>')
        // Single newlines in paragraphs
        .replace(/\n/g, '<br/>')
        // Wrap in paragraph
        .replace(/^(.+)$/, '<p>$1</p>')
        // Clean up empty paragraphs
        .replace(/<p><\/p>/g, '')
        .replace(/<p><h/g, '<h')
        .replace(/<\/h2><\/p>/g, '</h2>')
        .replace(/<\/h3><\/p>/g, '</h3>')
        .replace(/<p><ul>/g, '<ul>')
        .replace(/<\/ul><\/p>/g, '</ul>')
        .replace(/<p><blockquote>/g, '<blockquote>')
        .replace(/<\/blockquote><\/p>/g, '</blockquote>')
}

export function AIAssistant() {
    const [messages, setMessages] = useState<Message[]>([])
    const [input, setInput] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [useCase, setUseCase] = useState<UseCase>('general')
    const [copiedId, setCopiedId] = useState<string | null>(null)
    const scrollRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLTextAreaElement>(null)

    // Usage tracking
    const [totalTokens, setTotalTokens] = useState(0)
    const [queryCount, setQueryCount] = useState(0)

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [messages])

    const sendMessage = async () => {
        if (!input.trim() || isLoading) return

        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: input.trim(),
            timestamp: new Date()
        }

        setMessages(prev => [...prev, userMessage])
        setInput('')
        setIsLoading(true)

        try {
            // Prepare messages for API (only user/assistant messages)
            const apiMessages = [...messages, userMessage]
                .filter(m => m.role === 'user' || m.role === 'assistant')
                .map(m => ({ role: m.role, content: m.content }))

            const response = await fetch('/api/ai/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: apiMessages,
                    useCase
                })
            })

            const result = await response.json()

            if (result.success) {
                const assistantMessage: Message = {
                    id: (Date.now() + 1).toString(),
                    role: 'assistant',
                    content: result.data.message,
                    citations: result.data.citations,
                    relatedQuestions: result.data.relatedQuestions,
                    timestamp: new Date()
                }
                setMessages(prev => [...prev, assistantMessage])

                // Update usage stats
                if (result.data.usage) {
                    setTotalTokens(prev => prev + result.data.usage.total_tokens)
                    setQueryCount(prev => prev + 1)
                }
            } else {
                // Error message
                const errorMessage: Message = {
                    id: (Date.now() + 1).toString(),
                    role: 'assistant',
                    content: `Maaf, terjadi kesalahan: ${result.error}`,
                    timestamp: new Date()
                }
                setMessages(prev => [...prev, errorMessage])
            }
        } catch (error) {
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: 'Maaf, tidak dapat menghubungi layanan AI. Silakan coba lagi.',
                timestamp: new Date()
            }
            setMessages(prev => [...prev, errorMessage])
        } finally {
            setIsLoading(false)
            inputRef.current?.focus()
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            sendMessage()
        }
    }

    const copyToClipboard = async (text: string, id: string) => {
        await navigator.clipboard.writeText(text)
        setCopiedId(id)
        setTimeout(() => setCopiedId(null), 2000)
    }

    const clearChat = () => {
        setMessages([])
    }

    const currentConfig = useCaseConfig[useCase]
    const UseCaseIcon = currentConfig.icon

    return (
        <Card className="flex flex-col h-[calc(100vh-10rem)]">
            <CardHeader className="border-b shrink-0">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
                            <Sparkles className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <CardTitle className="text-lg">Magisterium AI</CardTitle>
                            <CardDescription>Asisten Teologis Katolik</CardDescription>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Select value={useCase} onValueChange={(v) => setUseCase(v as UseCase)}>
                            <SelectTrigger className="w-44">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {Object.entries(useCaseConfig).map(([key, config]) => {
                                    const Icon = config.icon
                                    return (
                                        <SelectItem key={key} value={key}>
                                            <div className="flex items-center gap-2">
                                                <Icon className="h-4 w-4" />
                                                {config.label}
                                            </div>
                                        </SelectItem>
                                    )
                                })}
                            </SelectContent>
                        </Select>
                        {messages.length > 0 && (
                            <Button variant="ghost" size="icon" onClick={clearChat}>
                                <RefreshCw className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                </div>

                {/* Usage Stats (Session Only) */}
                {totalTokens > 0 && (
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground bg-muted/30 px-3 py-1.5 rounded-md w-fit">
                        <span>Session Usage:</span>
                        <div className="flex items-center gap-1">
                            <span className="font-medium text-foreground">{queryCount}</span> queries
                        </div>
                        <div className="w-px h-3 bg-border" />
                        <div className="flex items-center gap-1">
                            <span className="font-medium text-foreground">{totalTokens.toLocaleString()}</span> tokens used
                        </div>
                    </div>
                )}
                <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                    <UseCaseIcon className="h-4 w-4" />
                    {currentConfig.description}
                </div>
            </CardHeader>

            <CardContent className="flex-1 p-0 overflow-hidden">
                <ScrollArea className="h-full p-4" ref={scrollRef}>
                    {messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center py-12">
                            <div className="p-4 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-950 dark:to-purple-950 mb-4">
                                <Bot className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                            </div>
                            <h3 className="font-semibold text-lg mb-2">Selamat Datang!</h3>
                            <p className="text-muted-foreground max-w-sm">
                                Saya dapat membantu dengan pertanyaan tentang ajaran Gereja Katolik,
                                dengan sumber dari Magisterium, Kitab Suci, dan Bapa-Bapa Gereja.
                            </p>
                            <div className="flex flex-wrap gap-2 mt-4 justify-center">
                                <Badge variant="secondary" className="cursor-pointer" onClick={() => setInput('Apa itu Sakramen Ekaristi?')}>
                                    Apa itu Sakramen Ekaristi?
                                </Badge>
                                <Badge variant="secondary" className="cursor-pointer" onClick={() => setInput('Jelaskan tentang devosi Rosario')}>
                                    Devosi Rosario
                                </Badge>
                                <Badge variant="secondary" className="cursor-pointer" onClick={() => setInput('Apa ajaran Gereja tentang keadilan sosial?')}>
                                    Keadilan Sosial
                                </Badge>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {messages.map((msg) => (
                                <div
                                    key={msg.id}
                                    className={cn(
                                        "flex gap-3",
                                        msg.role === 'user' ? "justify-end" : "justify-start"
                                    )}
                                >
                                    {msg.role === 'assistant' && (
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shrink-0">
                                            <Bot className="h-4 w-4 text-white" />
                                        </div>
                                    )}
                                    <div
                                        className={cn(
                                            "max-w-[85%] rounded-xl",
                                            msg.role === 'user'
                                                ? "bg-primary text-primary-foreground px-4 py-3"
                                                : "bg-card border shadow-sm"
                                        )}
                                    >
                                        {msg.role === 'user' ? (
                                            <p className="text-sm">{msg.content}</p>
                                        ) : (
                                            <div className="p-4">
                                                {/* Formatted AI Response */}
                                                <div
                                                    className="prose prose-sm dark:prose-invert max-w-none
                                                        prose-headings:font-bold prose-headings:text-foreground prose-headings:mt-4 prose-headings:mb-2
                                                        prose-h2:text-base prose-h3:text-sm
                                                        prose-p:text-sm prose-p:leading-relaxed prose-p:my-2
                                                        prose-strong:font-semibold prose-strong:text-foreground
                                                        prose-em:italic prose-em:text-muted-foreground
                                                        prose-ul:my-2 prose-ul:pl-4 prose-li:text-sm prose-li:my-1
                                                        prose-ol:my-2 prose-ol:pl-4
                                                        prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:bg-blue-50 dark:prose-blockquote:bg-blue-950/30 prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:my-3 prose-blockquote:text-sm prose-blockquote:not-italic
                                                        [&_sup]:text-xs [&_sup]:text-blue-600 dark:[&_sup]:text-blue-400 [&_sup]:font-medium
                                                        [&_a]:text-blue-600 dark:[&_a]:text-blue-400 [&_a]:no-underline hover:[&_a]:underline"
                                                    dangerouslySetInnerHTML={{
                                                        __html: formatAIResponse(msg.content)
                                                    }}
                                                />

                                                {/* Citations */}
                                                {msg.citations && msg.citations.length > 0 && (
                                                    <div className="mt-4 pt-3 border-t">
                                                        <p className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1">
                                                            <BookOpen className="h-3 w-3" />
                                                            Sumber Referensi ({msg.citations.length})
                                                        </p>
                                                        <div className="space-y-2">
                                                            {msg.citations.map((c, i) => (
                                                                <div
                                                                    key={i}
                                                                    className="text-xs bg-muted/50 rounded-lg px-3 py-2 border-l-2 border-blue-500"
                                                                >
                                                                    <div className="flex items-start gap-2">
                                                                        <span className="font-bold text-blue-600 dark:text-blue-400 shrink-0">[{i + 1}]</span>
                                                                        <div>
                                                                            <span className="font-medium">{c.title}</span>
                                                                            {c.reference && <span className="text-muted-foreground">, {c.reference}</span>}
                                                                            <span className="text-muted-foreground"> — {c.author}</span>
                                                                        </div>
                                                                    </div>
                                                                    {c.excerpt && (
                                                                        <p className="mt-1 text-muted-foreground italic line-clamp-2 pl-5">
                                                                            &ldquo;{c.excerpt}&rdquo;
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Related Questions */}
                                                {msg.relatedQuestions && msg.relatedQuestions.length > 0 && (
                                                    <div className="mt-4 pt-3 border-t">
                                                        <p className="text-xs font-semibold text-muted-foreground mb-2">
                                                            Pertanyaan Terkait
                                                        </p>
                                                        <div className="flex flex-wrap gap-2">
                                                            {msg.relatedQuestions.map((q, i) => (
                                                                <Badge
                                                                    key={i}
                                                                    variant="outline"
                                                                    className="cursor-pointer hover:bg-primary/10 text-xs"
                                                                    onClick={() => setInput(q)}
                                                                >
                                                                    ↳ {q}
                                                                </Badge>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Copy button */}
                                                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-dashed">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
                                                        onClick={() => copyToClipboard(msg.content, msg.id)}
                                                    >
                                                        {copiedId === msg.id ? (
                                                            <><Check className="h-3 w-3 mr-1" /> Tersalin</>
                                                        ) : (
                                                            <><Copy className="h-3 w-3 mr-1" /> Salin Teks</>
                                                        )}
                                                    </Button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    {msg.role === 'user' && (
                                        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
                                            <User className="h-4 w-4 text-primary-foreground" />
                                        </div>
                                    )}
                                </div>
                            ))}

                            {/* Loading indicator */}
                            {isLoading && (
                                <div className="flex gap-3">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shrink-0">
                                        <Bot className="h-4 w-4 text-white" />
                                    </div>
                                    <div className="bg-muted rounded-lg px-4 py-3">
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </ScrollArea>
            </CardContent>

            <CardFooter className="border-t p-4 shrink-0">
                <div className="flex gap-2 w-full">
                    <Textarea
                        ref={inputRef}
                        placeholder="Ketik pertanyaan Anda..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="min-h-[44px] max-h-32 resize-none"
                        rows={1}
                    />
                    <Button
                        onClick={sendMessage}
                        disabled={!input.trim() || isLoading}
                        size="icon"
                        className="shrink-0"
                    >
                        {isLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Send className="h-4 w-4" />
                        )}
                    </Button>
                </div>
            </CardFooter>
        </Card >
    )
}
