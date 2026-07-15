"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import type { ChatMessage } from "@/lib/api";

export default function ChatPage() {
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [chatSessionId, setChatSessionId] = useState<string | null>(null);

  async function handleSendChatMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg: ChatMessage = { id: "msg-" + Date.now(), role: "user", content: chatInput };
    setChatMessages(prev => [...prev, userMsg]);
    const inputText = chatInput;
    setChatInput("");
    setIsTyping(true);

    try {
      let sessionId = chatSessionId;
      if (!sessionId) {
        const session = await api.ai.createSession("Diagnóstico: " + inputText.slice(0, 40));
        sessionId = session.id;
        setChatSessionId(sessionId);
      }

      const res = await api.ai.sendMessage(sessionId!, inputText);
      const aiMsg: ChatMessage = { id: res.aiMessage.id, role: "model", content: res.aiMessage.content };
      setChatMessages(prev => [...prev, aiMsg]);
    } catch {
      const fallback: ChatMessage = { id: "fallback-" + Date.now(), role: "model", content: "Desculpe, ocorreu um erro ao processar sua mensagem. Tente novamente." };
      setChatMessages(prev => [...prev, fallback]);
    } finally {
      setIsTyping(false);
    }
  }

  return (
    <div className="flex flex-col border border-zinc-900 bg-zinc-900/10 backdrop-blur-sm rounded-2xl h-[600px] overflow-hidden">
      <div className="px-6 py-4.5 border-b border-zinc-900 bg-zinc-900/20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
          <span className="text-xs font-bold text-white uppercase tracking-wider">Canal de Ajuda Mecânica - Assistente IA</span>
        </div>
        <span className="text-[10px] text-zinc-500 font-extrabold uppercase tracking-widest">Gemini 1.5 Flash</span>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-5 bg-zinc-950/20">
        {chatMessages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="h-14 w-14 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/15 flex items-center justify-center text-2xl mb-4 shadow-lg shadow-indigo-500/5 animate-pulse">
              🤖
            </div>
            <p className="text-xs font-black text-white uppercase tracking-wider">Assistente Técnico de IA</p>
            <p className="text-[11px] text-zinc-500 mt-1 max-w-xs leading-relaxed">
              Pergunte sobre especificações de torque, diagnóstico de códigos de falha, capacidades de lubrificantes e esquemas elétricos.
            </p>
          </div>
        )}

        {chatMessages.map(msg => {
          const isUser = msg.role === "user";
          return (
            <div key={msg.id} className={`flex flex-col max-w-[85%] ${isUser ? "self-end items-end" : "self-start items-start"}`}>
              <div 
                className={`px-4.5 py-3 rounded-2xl text-xs leading-relaxed whitespace-pre-wrap border ${
                  isUser 
                    ? "bg-gradient-to-tr from-indigo-600 to-violet-600 text-white rounded-tr-none border-indigo-600/30 shadow-md shadow-indigo-600/10" 
                    : "bg-zinc-900/80 text-zinc-200 border-zinc-800/80 rounded-tl-none"
                }`}
              >
                {msg.content}
              </div>
              <span className="text-[9px] text-zinc-500 mt-1.5 font-bold uppercase tracking-wider">
                {isUser ? "Você" : "Assistente OficinaAI"}
              </span>
            </div>
          );
        })}

        {isTyping && (
          <div className="self-start flex flex-col items-start gap-1.5">
            <div className="bg-zinc-900/80 border border-zinc-800/80 text-zinc-400 px-4 py-3 rounded-2xl rounded-tl-none flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-zinc-500 animate-bounce" style={{ animationDelay: "0ms" }}></span>
              <span className="h-1.5 w-1.5 rounded-full bg-zinc-500 animate-bounce" style={{ animationDelay: "150ms" }}></span>
              <span className="h-1.5 w-1.5 rounded-full bg-zinc-500 animate-bounce" style={{ animationDelay: "300ms" }}></span>
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSendChatMessage} className="p-4 border-t border-zinc-900 bg-zinc-900/15 flex gap-3 relative z-10">
        <input 
          type="text" 
          placeholder="Pergunte sobre torque, diagnóstico de injeção, óleo..." 
          value={chatInput} 
          onChange={(e) => setChatInput(e.target.value)} 
          className="flex-1 bg-zinc-950/60 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/50 transition-all duration-200" 
        />
        <button 
          type="submit" 
          className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition shadow-lg shadow-indigo-600/10"
        >
          Enviar
        </button>
      </form>
    </div>
  );
}
