"use client";

import { useState, useRef, useEffect } from "react";
import { Send, User, Bot, Phone, ClipboardList, MessageSquare, GraduationCap, School, Users, ChevronRight } from "lucide-react";
import { GraduationCap as GradIcon, School as SchoolIcon, Users as UsersIcon, ChevronRight as ChevronIcon } from "lucide-react";
import ChatWidget from "@/components/ChatWidget";

export default function ChatPage() {
  return (
    <main className="relative min-h-screen w-full flex flex-col items-center justify-between text-white overflow-hidden font-sans">
      {/* Real Background Image with Overlay */}
      <div
        className="fixed inset-0 bg-cover bg-center -z-20 transition-all duration-1000 scale-105"
        style={{ backgroundImage: 'url("/psicofel-real-bg.jpg")' }}
      >
        <div className="absolute inset-0 bg-[#0f172a]/80 backdrop-blur-[2px]"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-[#0f172a]/95 via-[#0f172a]/60 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-[#0f172a]/20 via-transparent to-[#0f172a]/90"></div>
      </div>

      {/* Header / Logo */}
      <header className="z-10 w-full max-w-7xl px-8 pt-12 flex justify-start items-start">
        <div className="flex flex-col">
          <span className="text-2xl font-bold tracking-[0.2em] text-white">PSICOFEL</span>
          <span className="text-[10px] tracking-[0.1em] text-white/60">Gabinete de Psicología</span>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="z-10 w-full max-w-7xl px-8 flex flex-col lg:flex-row items-center justify-between gap-20 py-20 flex-grow">

        {/* Left Column: Hero Text */}
        <div className="flex-1 flex flex-col gap-8 items-start max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[10px] tracking-wider uppercase text-white/80">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></span>
            Sitio en actualización
          </div>

          <h1 className="text-6xl md:text-8xl font-bold tracking-tighter leading-[1.1] animate-in fade-in slide-in-from-left-8 duration-1000">
            Evolucionando para<br />
            <span className="text-white/90">cuidarte mejor</span>
          </h1>

          <p className="text-xl text-white/50 leading-relaxed max-w-lg animate-in fade-in duration-1000 delay-300">
            Estamos renovando nuestro espacio digital. Mientras tanto, seguimos atendiéndote con la cercanía y profesionalidad de siempre.
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mt-8 animate-in slide-in-from-bottom-8 duration-1000 delay-500">
            {/* Main Chatbot Button */}
            <button
              onClick={() => {
                const widgetBtn = document.querySelector('button[aria-label="Toggle Chat"]') as HTMLButtonElement;
                if (widgetBtn) widgetBtn.click();
              }}
              className="bg-[#4e6a85] hover:bg-[#3d556c] text-white px-8 py-4 rounded-xl flex items-center justify-center gap-3 font-bold transition-all shadow-[0_10px_40px_rgba(78,106,133,0.3)] hover:scale-105 group border border-white/10"
            >
              <MessageSquare size={20} className="group-hover:rotate-12 transition-transform" />
              Chatea con nuestro Asistente Psicofel
            </button>

            <button className="bg-white/5 hover:bg-white/10 text-white/80 px-8 py-4 rounded-xl border border-white/10 font-bold transition-all flex items-center justify-center gap-2 backdrop-blur-sm">
              <UsersIcon size={20} />
              Doctoralia
            </button>

            <button className="bg-white/5 hover:bg-white/10 text-white/80 p-4 rounded-xl border border-white/10 font-bold transition-all backdrop-blur-sm flex items-center justify-center">
              <Phone size={20} />
            </button>
          </div>
        </div>

        {/* Right Column: Training Card (Glassmorphism) */}
        <div className="w-full max-w-lg animate-in fade-in slide-in-from-right-8 duration-1000 delay-700">
          <div className="bg-white/5 backdrop-blur-xl rounded-[2.5rem] p-8 border border-white/10 shadow-2xl relative overflow-hidden group">
            {/* Subtle Gradient Glow */}
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 blur-[80px] rounded-full group-hover:bg-blue-500/20 transition-colors duration-700"></div>

            <div className="relative z-10 flex flex-col gap-6">
              <div className="flex items-center gap-4">
                <div className="p-4 rounded-2xl bg-blue-500/20 border border-blue-400/30 text-blue-300">
                  <GradIcon size={32} />
                </div>
                <div>
                  <h3 className="text-2xl font-bold">Formaciones Psicofel</h3>
                  <p className="text-sm text-white/40 uppercase tracking-widest">Acceso directo</p>
                </div>
              </div>

              <div className="flex flex-col gap-3 mt-4">
                <button className="w-full flex items-center justify-between p-5 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all text-left group/item">
                  <div className="flex items-center gap-4">
                    <SchoolIcon className="text-white/40 group-hover/item:text-blue-400 transition-colors" size={20} />
                    <span className="font-semibold text-white/80">Centros Educativos</span>
                  </div>
                  <ChevronIcon size={20} className="text-white/20 group-hover/item:translate-x-1 transition-transform" />
                </button>

                <button className="w-full flex items-center justify-between p-5 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all text-left group/item">
                  <div className="flex items-center gap-4">
                    <UsersIcon className="text-white/40 group-hover/item:text-blue-400 transition-colors" size={20} />
                    <span className="font-semibold text-white/80">Nuevos Profesionales</span>
                  </div>
                  <ChevronIcon size={20} className="text-white/20 group-hover/item:translate-x-1 transition-transform" />
                </button>
              </div>

              <p className="text-[10px] text-center text-white/20 mt-4 leading-relaxed">
                Las plataformas de formación siguen operativas con normalidad.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="z-10 w-full max-w-7xl px-8 py-8 flex flex-col md:flex-row justify-between items-center gap-4 border-t border-white/5 text-[10px] tracking-wider text-white/30 uppercase">
        <p>&copy; 2025 PSICOFEL. Todos los derechos reservados.</p>
        <div className="flex gap-6">
          <button className="hover:text-white transition-colors">Privacidad</button>
          <button className="hover:text-white transition-colors">Aviso legal</button>
          <button className="hover:text-white transition-colors">Cookies</button>
        </div>
      </footer>

      {/* Floating Chatbot Widget (Hidden visually but functional) */}
      <ChatWidget />

      {/* Pure aesthetic radial glows */}
      <div className="fixed top-[-20%] left-[-10%] w-[60%] h-[60%] bg-[#e84c64]/5 blur-[160px] rounded-full -z-10 pointer-events-none"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/5 blur-[160px] rounded-full -z-10 pointer-events-none"></div>
    </main>
  );
}
