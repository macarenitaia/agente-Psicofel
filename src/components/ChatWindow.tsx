"use client";

import { useState, useRef, useEffect } from "react";
import { Send, User, Bot, Phone, ClipboardList } from "lucide-react";
import { createInitialLead, updateLeadInfo, saveChatMessage, supabase } from "@/lib/supabase";

interface Message {
    role: "user" | "assistant";
    content: string;
    type?: "text" | "derivation";
    data?: {
        doctor?: string;
        phone?: string;
    };
}

interface ChatWindowProps {
    standalone?: boolean;
}

export default function ChatWindow({ standalone = false }: ChatWindowProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [step, setStep] = useState(0);
    const [userData, setUserData] = useState({ name: "", phone: "", reason: "" });
    const [isTyping, setIsTyping] = useState(false);
    const [leadId, setLeadId] = useState<string | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    // PERSISTENCIA: Recuperar sesión anterior o crear una nueva
    useEffect(() => {
        const init = async () => {
            const savedLeadId = localStorage.getItem("psicofel_lead_id");

            if (savedLeadId) {
                // Intentamos recuperar los mensajes previos
                const { data: previousMessages } = await supabase
                    .from("messages")
                    .select("role, content")
                    .eq("lead_id", savedLeadId)
                    .order("created_at", { ascending: true });

                if (previousMessages && previousMessages.length > 0) {
                    setLeadId(savedLeadId);
                    setMessages(previousMessages as Message[]);

                    // Calculamos en qué paso nos quedamos basándonos en los mensajes (simplificado)
                    const { data: lead } = await supabase.from("leads").select("*").eq("id", savedLeadId).single();
                    if (lead) {
                        setUserData({ name: lead.name || "", phone: lead.phone || "", reason: "" });
                        if (lead.status === 'Qualified') setStep(3);
                        else if (lead.phone) setStep(2);
                        else if (lead.name && lead.name !== "Nuevo Paciente (Chat)") setStep(1);
                        else setStep(0);
                    }
                    return;
                }
            }

            // Si no hay sesión, empezamos de cero
            const startMsg = "Hola. Soy el asistente de Psicofel. Antes de nada, me gustaría saber tu nombre para poder hablarte de forma más cercana. ¿Cómo te llamas?";
            setMessages([{ role: "assistant", content: startMsg }]);

            const lead = await createInitialLead();
            if (lead) {
                setLeadId(lead.id);
                localStorage.setItem("psicofel_lead_id", lead.id);
                saveChatMessage(lead.id, "assistant", startMsg);
            }
        };
        init();
    }, []);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isTyping]);

    const getDerivation = (reason: string) => {
        const r = reason.toLowerCase();
        // Logopeda: keywords more specific than just 'hablar'
        if (r.includes("logope") || r.includes("pronuncia") || r.includes("lenguaje") || r.includes("tartamudeo") || r.includes("dislexia"))
            return { doctor: "Rocío (Logopeda)", phone: "+34 647 07 11 18" };

        if (r.includes("niño") || r.includes("hijo") || r.includes("infantil") || r.includes("pequeño"))
            return { doctor: "Paula de Andrés", phone: "+34 647 07 12 61" };

        if (r.includes("pareja") || r.includes("espos") || r.includes("marido") || r.includes("mujer") || r.includes("novi"))
            return { doctor: "Francisco Pardo", phone: "+34 647 07 26 86" };

        if (r.includes("embarazo") || r.includes("bebé") || r.includes("parto") || r.includes("neonatal") || r.includes("postparto"))
            return { doctor: "Elisa Greco", phone: "+34 647 072 089" };

        if (r.includes("deporte") || r.includes("rendimiento") || r.includes("atleta"))
            return { doctor: "Francesc Mengual", phone: "+34 611 81 31 09" };

        if (r.includes("adolescente") || r.includes("joven") || r.includes("estudios") || r.includes("bullying"))
            return { doctor: "Celia García", phone: "+34 664 66 33 45" };

        // Default to Patricia for general psychology
        return { doctor: "Patricia Soriano", phone: "+34 697 26 28 80" };
    };

    const resetChat = () => {
        localStorage.removeItem("psicofel_lead_id");
        window.location.reload();
    };

    const handleSend = async () => {
        if (!input.trim() || !leadId) return;

        const userMsg = input.trim();
        setInput("");
        const newMessages: Message[] = [...messages, { role: "user", content: userMsg }];
        setMessages(newMessages);
        setIsTyping(true);
        saveChatMessage(leadId, "user", userMsg);

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages: newMessages.map(m => ({ role: m.role, content: m.content })) })
            });

            const data = await response.json();
            if (data.error) throw new Error(data.error);

            let botResponse = data.content;

            // Detectar si el agente ha calificado al lead
            const qualificationMatch = botResponse.match(/\[CALIFICADO: (.*?)\]/);

            if (qualificationMatch && step < 3) {
                const specialistName = qualificationMatch[1];
                botResponse = botResponse.replace(/\[CALIFICADO: .*?\]/, "").trim();

                // Buscar datos del especialista (esto es estático por seguridad en el demo)
                const specialists: Record<string, string> = {
                    "Francisco Pardo": "+34 647 07 26 86",
                    "Francesc Mengual": "+34 611 81 31 09",
                    "Patricia Soriano": "+34 697 26 28 80",
                    "Celia García": "+34 664 66 33 45",
                    "Paula de Andrés": "+34 647 07 12 61",
                    "Rocío": "+34 647 07 11 18",
                    "Elisa Greco": "+34 647 072 089"
                };

                const phone = specialists[specialistName] || "+34 697 26 28 80";

                setMessages((prev) => [
                    ...prev,
                    { role: "assistant", content: botResponse },
                    {
                        role: "assistant",
                        content: "Aquí tienes los datos de contacto del especialista:",
                        type: "derivation",
                        data: { doctor: specialistName, phone: phone }
                    }
                ]);

                updateLeadInfo(leadId, { assigned_specialist: specialistName, status: 'Qualified' });
                setStep(3);
                saveChatMessage(leadId, "assistant", botResponse);
            } else {
                // LIMPIAR TAG SIEMPRE: Incluso si ya pasó el paso de calificación, limpiar para que no se vea feo
                botResponse = botResponse.replace(/\[CALIFICADO: .*?\]/, "").trim();
                setMessages((prev) => [...prev, { role: "assistant", content: botResponse }]);
                saveChatMessage(leadId, "assistant", botResponse);

                // Intentar extraer el nombre de forma simple para la UI (opcional)
                if (step === 0 && !userData.name) {
                    // El agente es autónomo ahora, no forzamos el setStep aquí tan rígidamente
                    // pero mantenemos el flujo para la UI
                }
            }
        } catch (error) {
            console.error("Error calling agent:", error);
            setMessages((prev) => [...prev, { role: "assistant", content: "Lo siento, mi conexión con el servidor de inteligencia ha fallado. ¿Podrías intentarlo de nuevo?" }]);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <div className={`flex flex-col h-full w-full ${standalone ? 'bg-[#1a1c20]' : 'bg-transparent'}`}>
            {/* Header */}
            <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/5">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#e84c64] flex items-center justify-center shadow-lg overflow-hidden border border-white/20">
                        <Bot className="text-white" size={24} />
                    </div>
                    <div>
                        <h2 className="text-sm font-bold text-white uppercase tracking-tighter">Agente Autónomo Psicofel</h2>
                        <div className="flex items-center gap-1">
                            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                            <p className="text-[10px] text-white/50 uppercase tracking-widest">IA Activa</p>
                        </div>
                    </div>
                </div>
                {!standalone && (
                    <button onClick={resetChat} className="text-[10px] text-white/40 hover:text-white/80 transition-colors uppercase tracking-widest flex items-center gap-1 border border-white/10 px-2 py-1 rounded-lg">
                        Reiniciar chat ↺
                    </button>
                )}
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#2a2d34]/20 scroll-smooth">
                {messages.length === 0 && (
                    <div className="flex justify-center p-10"><div className="w-6 h-6 border-2 border-[#4e6a85] border-t-transparent rounded-full animate-spin"></div></div>
                )}
                {
                    messages.map((msg, i) => (
                        <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-2`}>
                            <div className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed ${msg.role === "user" ? "bg-[#4e6a85] text-white rounded-tr-none shadow-md" : "bg-white/10 text-white/90 rounded-tl-none border border-white/5"
                                }`}>
                                {msg.content}
                                {msg.type === "derivation" && msg.data && (
                                    <div className="mt-3 bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl flex items-center justify-between gap-3 animate-in zoom-in duration-500">
                                        <div className="flex items-center gap-2">
                                            <Phone size={14} className="text-emerald-400" />
                                            <div className="flex flex-col">
                                                <span className="font-bold text-emerald-400 text-xs">{msg.data.doctor}</span>
                                                <span className="text-[10px] opacity-70 text-white uppercase">Especialista</span>
                                            </div>
                                        </div>
                                        {msg.data.phone && (
                                            <a href={`tel:${msg.data.phone.replace(/\s/g, '')}`} className="text-xs font-mono text-white/80 hover:text-white transition-colors underline decoration-emerald-500/30">
                                                {msg.data.phone}
                                            </a>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                }
                {
                    isTyping && (
                        <div className="flex justify-start">
                            <div className="bg-white/5 p-3 rounded-2xl flex gap-1 border border-white/5">
                                <div className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce"></div>
                                <div className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                                <div className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                            </div>
                        </div>
                    )
                }
            </div >

            {/* Input */}
            < div className="p-4 bg-white/5 border-t border-white/10" >
                <div className="relative flex items-center gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSend()}
                        placeholder={step === 3 ? "Dime algo más si necesitas..." : "Escribe aquí..."}
                        className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#e84c64]/50 text-white placeholder:text-white/20 shadow-inner backdrop-blur-sm transition-all"
                    />
                    <button
                        aria-label="Send Message"
                        onClick={handleSend}
                        className="bg-[#e84c64] p-3 rounded-xl text-white font-bold hover:bg-[#d13b52] transition-all shadow-lg shadow-[#e84c64]/20 disabled:opacity-50 group"
                    >
                        <Send size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    </button>
                    {(step === 3 || messages.length > 5) && (
                        <button
                            onClick={() => {
                                localStorage.removeItem("psicofel_lead_id");
                                window.location.reload();
                            }}
                            className="absolute -top-12 right-0 text-[10px] text-white/30 hover:text-white transition-colors"
                        >
                            Reiniciar chat ↺
                        </button>
                    )}
                </div>
            </div >
        </div >
    );
}
