import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, X, Send, Sparkles, Brain } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
    role: "user" | "assistant";
    content: string;
}

interface SocraticTutorProps {
    problemContext: string; // e.g., "P vs NP", "Riemann Hypothesis"
}

export const SocraticTutor = ({ problemContext }: SocraticTutorProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { role: "assistant", content: `Greetings. I am your Socratic Guide for ${problemContext}. Ask me anything, and I shall guide you to the answer.` }
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMsg = input.trim();
        setMessages(prev => [...prev, { role: "user", content: userMsg }]);
        setInput("");
        setIsLoading(true);

        try {
            const { data, error } = await supabase.functions.invoke('socratic-tutor', {
                body: {
                    messages: [...messages, { role: "user", content: userMsg }],
                    context: problemContext
                }
            });

            if (error) throw error;

            setMessages(prev => [...prev, { role: "assistant", content: data.reply }]);
        } catch (e: any) {
            toast.error("I momentarily lost my train of thought. (Error: " + e.message + ")");
            setMessages(prev => [...prev, { role: "assistant", content: "My apologies, I encountered an error connecting to the ether. Please try again." }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <div className="fixed bottom-6 right-6 z-50">
                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="mb-4 w-[350px] md:w-[400px]"
                        >
                            <Card className="flex flex-col h-[500px] border-primary/20 shadow-2xl bg-black/90 backdrop-blur-xl">
                                {/* Header */}
                                <div className="p-4 border-b border-primary/20 flex items-center justify-between bg-primary/5 rounded-t-xl">
                                    <div className="flex items-center gap-2">
                                        <div className="bg-primary/20 p-1.5 rounded-full">
                                            <Brain className="w-4 h-4 text-cyan-400" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-sm text-cyan-400">Socratic Tutor</h3>
                                            <p className="text-[10px] text-muted-foreground">Guided Learning AI</p>
                                        </div>
                                    </div>
                                    <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => setIsOpen(false)}>
                                        <X className="w-4 h-4" />
                                    </Button>
                                </div>

                                {/* Chat Area */}
                                <ScrollArea className="flex-1 p-4">
                                    <div className="space-y-4">
                                        {messages.map((m, i) => (
                                            <div
                                                key={i}
                                                className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                            >
                                                <div
                                                    className={`max-w-[85%] px-3 py-2 rounded-lg text-sm leading-relaxed ${m.role === 'user'
                                                            ? 'bg-primary text-primary-foreground rounded-tr-none'
                                                            : 'bg-muted border border-white/10 text-muted-foreground rounded-tl-none'
                                                        }`}
                                                >
                                                    {m.content}
                                                </div>
                                            </div>
                                        ))}
                                        {isLoading && (
                                            <div className="flex justify-start">
                                                <div className="bg-muted px-3 py-2 rounded-lg rounded-tl-none flex gap-1 items-center">
                                                    <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" />
                                                    <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce delay-75" />
                                                    <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce delay-150" />
                                                </div>
                                            </div>
                                        )}
                                        <div ref={scrollRef} />
                                    </div>
                                </ScrollArea>

                                {/* Input Area */}
                                <div className="p-4 border-t border-white/10 flex gap-2">
                                    <Input
                                        placeholder="I don't understand..."
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                        className="bg-black/50 border-white/10 focus-visible:ring-cyan-400"
                                    />
                                    <Button size="icon" onClick={handleSend} disabled={isLoading || !input.trim()}>
                                        <Send className="w-4 h-4" />
                                    </Button>
                                </div>
                            </Card>
                        </motion.div>
                    )}
                </AnimatePresence>

                <Button
                    size="lg"
                    className={`rounded-full shadow-lg h-14 w-14 border-2 border-cyan-500/50 hover:scale-110 transition-transform duration-300 ${isOpen ? 'hidden' : 'flex'}`}
                    onClick={() => setIsOpen(true)}
                >
                    <Sparkles className="w-6 h-6 text-cyan-400" />
                </Button>
            </div>
        </>
    );
};
