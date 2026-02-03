"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { MessageSquare, Users, Phone, Menu, X, CheckCircle, Clock } from "lucide-react";

// Specialist Knowledge Base (Static)
const SPECIALISTS = [
    { name: "Francisco Pardo", role: "Adultos, pareja, LGTBIQ+", phone: "+34 647 07 26 86" },
    { name: "Francesc Mengual", role: "Adultos, deportes", phone: "+34 611 81 31 09" },
    { name: "Patricia Soriano", role: "Adultos, familia", phone: "+34 697 26 28 80" },
    { name: "Celia García", role: "Jóvenes, adolescentes", phone: "+34 664 66 33 45" },
    { name: "Paula de Andrés", role: "Infantil, adolescentes", phone: "+34 647 07 12 61" },
    { name: "Rocío", role: "Logopeda", phone: "+34 647 07 11 18" },
    { name: "Elisa Greco", role: "Perinatal, embarazo", phone: "+34 647 072 089" }
];

export default function AdminDashboard() {
    const [leads, setLeads] = useState<any[]>([]);
    const [selectedLead, setSelectedLead] = useState<any | null>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Fetch Leads (Polling for real-time feel)
    useEffect(() => {
        const fetchLeads = async () => {
            const { data } = await supabase.from('leads').select('*').order('created_at', { ascending: false });
            if (data) setLeads(data);
        };
        fetchLeads();
        const interval = setInterval(fetchLeads, 5000);
        return () => clearInterval(interval);
    }, []);

    // Fetch Messages when Lead Selected
    useEffect(() => {
        if (!selectedLead) return;
        const fetchMessages = async () => {
            const { data } = await supabase.from('messages').select('*').eq('lead_id', selectedLead.id).order('created_at', { ascending: true });
            if (data) setMessages(data);
        };
        fetchMessages();
    }, [selectedLead]);

    return (
        <div className="flex h-screen w-full bg-[#f3f4f6] font-sans text-slate-800 overflow-hidden relative">

            {/* Mobile Toggle */}
            <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="md:hidden absolute top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md text-slate-600"
            >
                {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Sidebar (List of Leads) */}
            <aside className={`
        fixed md:relative z-40 w-80 h-full bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
                <div className="p-6 border-b border-slate-100">
                    <h2 className="text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
                        <span className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></span>
                        Consultas Activas
                    </h2>
                    <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider">Panel de Control en Tiempo Real</p>
                </div>

                <div className="overflow-y-auto h-[calc(100%-80px)] p-4 space-y-3">
                    {leads.length === 0 ? (
                        <div className="text-center py-10 text-slate-400 text-sm">
                            No hay consultas activas por el momento.
                        </div>
                    ) : (
                        leads.map(lead => (
                            <div
                                key={lead.id}
                                onClick={() => { setSelectedLead(lead); setIsSidebarOpen(false); }}
                                className={`p-4 rounded-xl cursor-pointer transition-all border ${selectedLead?.id === lead.id
                                        ? 'bg-emerald-50 border-emerald-200 shadow-sm'
                                        : 'bg-white border-slate-100 hover:bg-slate-50'
                                    }`}
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <h3 className="font-bold text-slate-700">{lead.name || "Nuevo Paciente"}</h3>
                                    <span className="text-[10px] text-slate-400">{new Date(lead.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                                <p className="text-xs text-slate-500 truncate mb-2">{lead.role === 'Qualified' ? '✅ Derivado' : '⏳ En proceso'}</p>
                                {lead.assigned_specialist && (
                                    <span className="inline-block px-2 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded-md uppercase tracking-wide">
                                        {lead.assigned_specialist}
                                    </span>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col h-full overflow-hidden w-full relative">

                {selectedLead ? (
                    /* Chat View */
                    <div className="flex-1 flex flex-col h-full bg-white/50 backdrop-blur-sm">
                        {/* Header */}
                        <header className="p-6 bg-white border-b border-slate-200 flex justify-between items-center shadow-sm">
                            <div className="pl-12 md:pl-0">
                                <h2 className="text-2xl font-bold text-slate-800">{selectedLead.name || "Paciente Anónimo"}</h2>
                                <div className="flex items-center gap-3 text-sm text-slate-500 mt-1">
                                    <span className="flex items-center gap-1"><Phone size={14} /> {selectedLead.phone || "Sin teléfono"}</span>
                                    {selectedLead.assigned_specialist && (
                                        <span className="flex items-center gap-1 text-emerald-600 font-medium">
                                            <CheckCircle size={14} /> Derivado a {selectedLead.assigned_specialist}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <button onClick={() => setSelectedLead(null)} className="text-sm text-slate-400 hover:text-slate-600 underline">
                                Volver al resumen
                            </button>
                        </header>

                        {/* Chat History */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50">
                            {messages.map((msg, idx) => (
                                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`
                    max-w-[80%] p-4 rounded-2xl text-sm shadow-sm
                    ${msg.role === 'user'
                                            ? 'bg-slate-800 text-white rounded-tr-none'
                                            : 'bg-white text-slate-700 border border-slate-200 rounded-tl-none'}
                  `}>
                                        {msg.content}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                ) : (
                    /* Dashboard Overview (Specialist Grid) */
                    <div className="flex-1 overflow-y-auto p-6 md:p-10">
                        <div className="pl-10 md:pl-0 max-w-6xl mx-auto space-y-10">

                            {/* Banner (Clean, NO BUTTON) */}
                            <div className="bg-emerald-600 rounded-3xl p-8 md:p-12 text-white shadow-xl shadow-emerald-600/20 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

                                <h2 className="text-3xl md:text-4xl font-bold mb-4">Panel de Control Psicofel</h2>
                                <p className="text-emerald-100 text-lg max-w-xl leading-relaxed opacity-90">
                                    Resumen de actividad en tiempo real. Los datos aquí mostrados provienen directamente de las interacciones activas con el Agente Autónomo.
                                </p>
                                {/* BUTTON REMOVED AS REQUESTED */}
                            </div>

                            {/* Specialists Grid */}
                            <div>
                                <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                                    <Users size={20} className="text-emerald-600" />
                                    Equipo de Especialistas (Base de Conocimiento)
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {SPECIALISTS.map((spec, i) => (
                                        <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow group">
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 font-bold text-lg group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
                                                    {spec.name.charAt(0)}
                                                </div>
                                                <span className="text-xs font-mono text-slate-400 bg-slate-50 px-2 py-1 rounded-md">{spec.phone}</span>
                                            </div>
                                            <h4 className="font-bold text-slate-800 text-lg">{spec.name}</h4>
                                            <p className="text-sm text-slate-500 mt-1">{spec.role}</p>

                                            {/* Clean Stats (Only showing real DB count would be complex here without more queries, so leaving purely informational as user asked specific numbers to be cleaned) */}
                                            <div className="mt-6 pt-4 border-t border-slate-100 flex justify-between items-center text-xs text-slate-400">
                                                <span>Estado</span>
                                                <span className="text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">Activo</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
