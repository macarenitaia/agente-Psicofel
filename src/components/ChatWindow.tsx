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

    const handleSend = async () => {
        if (!input.trim() || !leadId) return;

        const userMsg = input.trim();
        setInput("");
        setMessages((prev) => [...prev, { role: "user", content: userMsg }]);
        setIsTyping(true);
        saveChatMessage(leadId, "user", userMsg);

        setTimeout(() => {
            let botResponse = "";
            let nextStep = step;
            let newUserData = { ...userData };

            // PASO 0: NOMBRE
            if (step === 0) {
                const isGreeting = ["hola", "buenos dias", "buenas", "hoola", "holaa"].includes(userMsg.toLowerCase());
                if (isGreeting && userMsg.length < 6) {
                    botResponse = "¡Hola! Un placer saludarte. Pero aún no sé tu nombre... ¿Cómo te llamas?";
                    nextStep = 0;
                } else {
                    const name = userMsg.replace(/(me llamo|soy|mi nombre es)\s+/i, "");
                    newUserData.name = name;
                    botResponse = `Encantada de conocerte, ${name}. ¿Me podrías facilitar un número de teléfono? Es solo para tener un registro por si se cortara la comunicación en algún momento.`;
                    nextStep = 1;
                    updateLeadInfo(leadId, { name: name });
                }
            }
            // PASO 1: TELÉFONO
            else if (step === 1) {
                const containsNameCorrection = userMsg.toLowerCase().includes("llamo") || userMsg.toLowerCase().includes("nombre");
                const containsNumbers = /\d/.test(userMsg);

                if (containsNameCorrection && !containsNumbers) {
                    const newName = userMsg.replace(/(me llamo|soy|mi nombre es|no, me llamo)\s+/i, "");
                    newUserData.name = newName;
                    botResponse = `¡Ah, perdona! Entendido, ${newName}. Ahora sí, ¿cuál es tu teléfono?`;
                    nextStep = 1;
                    updateLeadInfo(leadId, { name: newName });
                } else {
                    newUserData.phone = userMsg;
                    botResponse = `Gracias, ${newUserData.name}. Ahora, cuéntame un poco, ¿qué es lo que te ocurre? Te escucho.`;
                    nextStep = 2;
                    updateLeadInfo(leadId, { phone: userMsg });
                }
            }
            // PASO 2: MOTIVO / DERIVACIÓN
            else if (step === 2) {
                newUserData.reason = userMsg;
                const derivation = getDerivation(userMsg);
                botResponse = `Entiendo perfectamente, ${newUserData.name}. Por lo que me cuentas, creo que ${derivation.doctor} es la persona ideal para ayudarte. Puedes contactar directamente si lo deseas, aunque nosotros ya tenemos tu registro aquí por si fuera necesario.`;

                setMessages((prev) => [
                    ...prev,
                    { role: "assistant", content: botResponse },
                    {
                        role: "assistant",
                        content: "Aquí tienes los datos de contacto del especialista:",
                        type: "derivation",
                        data: { doctor: derivation.doctor, phone: derivation.phone }
                    }
                ]);

                saveChatMessage(leadId, "assistant", botResponse);
                updateLeadInfo(leadId, { assigned_specialist: derivation.doctor, status: 'Qualified' });
                setIsTyping(false);
                setUserData(newUserData);
                setStep(3);
                return;
            }
            // PASO 3+: CONVERSACIÓN LIBRE POST-TRIAJE
            else {
                const query = userMsg.toLowerCase();
                if (query.includes("gracias") || query.includes("grtacias") || query.includes("grcias") || query.includes("perfecto") || query.includes("vale") || query.includes("ok")) {
                    botResponse = `¡De nada, ${newUserData.name}! Un placer ayudarte. Si necesitas cualquier otra cosa, aquí estaré.`;
                } else if (query.includes("adios") || query.includes("adiós") || query.includes("hasta luego") || query.includes("chao")) {
                    botResponse = `¡Hasta pronto, ${newUserData.name}! Que tengas un buen día.`;
                } else if (query.includes("por qué") || query.includes("porque") || query.includes("motivo") || query.includes("mejor")) {
                    botResponse = "He seleccionado a este especialista basándome en las palabras clave de tu consulta para intentar ofrecerte la ayuda más específica posible. No obstante, en Psicofel todos nuestros profesionales son excelentes y podemos reajustar tu cita si lo prefieres.";
                } else if (query.includes("psicólogo") || query.includes("psicologa") || query.includes("especialista")) {
                    botResponse = "¡Claro! En nuestro equipo contamos con psicoterapeutas, psicólogos sanitarios y especialistas en diversas áreas (como logopedia o infantil). Si tienes alguna duda sobre la formación de un profesional concreto, estaré encantada de informarte.";
                } else if (query.includes("donde") || query.includes("sitio") || query.includes("clinica")) {
                    botResponse = "Estamos en Psicofel. Si deseas concertar una cita presencial u online, lo mejor es que contactes con el número que te he facilitado arriba o nos dejes un mensaje y nosotros te llamaremos.";
                } else {
                    const responses = [
                        "Entiendo perfectamente. Si tienes alguna otra duda sobre nuestros servicios o especialistas, dímela sin compromiso.",
                        "Estoy aquí para ayudarte. ¿Hay algo específico sobre la terapia o la clínica que quieras saber?",
                        "Te escucho. Si necesitas más información sobre cómo trabajamos en Psicofel, solo tienes que preguntarme.",
                        "Comprendo. Recuerda que puedes usar el contacto de arriba para agilizar tu primera cita."
                    ];
                    botResponse = responses[Math.floor(Math.random() * responses.length)];
                }
                nextStep = 3;
            }

            setUserData(newUserData);
            setStep(nextStep);
            setMessages((prev) => [...prev, { role: "assistant", content: botResponse }]);
            saveChatMessage(leadId, "assistant", botResponse);
            setIsTyping(false);
        }, 1200);
    };

    return (
        <div className={`flex flex-col h-full w-full ${standalone ? 'bg-[#1a1c20]' : 'bg-transparent'}`}>
            {/* Header */}
            <div className="p-4 border-b border-white/10 flex items-center gap-3 bg-white/5">
                <div className="w-10 h-10 rounded-full bg-[#4e6a85] flex items-center justify-center shadow-lg overflow-hidden border border-white/20">
                    <User className="text-white" size={24} />
                </div>
                <div>
                    <h2 className="text-sm font-bold text-white uppercase tracking-tighter">Psicofel Assist</h2>
                    <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                        <p className="text-[10px] text-white/50 uppercase tracking-widest">En línea</p>
                    </div>
                </div>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#2a2d34]/20 scroll-smooth">
                {messages.length === 0 && (
                    <div className="flex justify-center p-10"><div className="w-6 h-6 border-2 border-[#4e6a85] border-t-transparent rounded-full animate-spin"></div></div>
                )}
                {messages.map((msg, i) => (
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
                                    <a href={`tel:${msg.data.phone.replace(/\s/g, '')}`} className="text-xs font-mono text-white/80 hover:text-white transition-colors underline decoration-emerald-500/30">
                                        {msg.data.phone}
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
                {isTyping && (
                    <div className="flex justify-start">
                        <div className="bg-white/5 p-3 rounded-2xl flex gap-1 border border-white/5">
                            <div className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce"></div>
                            <div className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                            <div className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                        </div>
                    </div>
                )}
            </div>

            {/* Input */}
            <div className="p-4 bg-white/5 border-t border-white/10">
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
            </div>
        </div>
    );
}
