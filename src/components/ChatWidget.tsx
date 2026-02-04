"use client";

import { useState, useRef, useEffect } from "react";
import { MessageSquare, X } from "lucide-react";
import ChatWindow from "./ChatWindow";

export default function ChatWidget() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            {/* Floating Button with PSICOFEL Aesthetic */}
            <button
                aria-label="Toggle Chat"
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-6 right-6 w-14 h-14 bg-[#4e6a85] rounded-full flex items-center justify-center shadow-lg shadow-[#4e6a85]/30 hover:scale-110 active:scale-95 transition-all z-50 text-white group"
            >
                {isOpen ? (
                    <X size={28} className="animate-in fade-in zoom-in duration-300" />
                ) : (
                    <MessageSquare size={28} className="animate-in fade-in zoom-in duration-300" />
                )}
            </button>

            {/* Chat Window Container */}
            {isOpen && (
                <div className="fixed bottom-24 right-6 w-[90vw] md:w-[400px] h-[600px] max-h-[70vh] bg-[#1a1c20] shadow-[0_20px_50px_rgba(0,0,0,0.5)] rounded-3xl overflow-hidden flex flex-col z-50 animate-in slide-in-from-bottom-10 fade-in duration-500 border border-white/10">
                    <ChatWindow />
                </div>
            )}
        </>
    );
}
