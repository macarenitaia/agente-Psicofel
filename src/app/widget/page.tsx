"use client";

import ChatWindow from "@/components/ChatWindow";

export default function WidgetPage() {
    return (
        <main className="h-screen w-screen bg-[#1a1c20] overflow-hidden">
            {/* 
         This page is designed for iframes. 
         It renders the ChatWindow directly (opening automatically 
         since it's not wrapped in the Widget/Bubble logic).
      */}
            <ChatWindow standalone={true} />
        </main>
    );
}
