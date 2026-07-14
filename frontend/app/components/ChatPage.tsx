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
    <div className="flex flex-col border border-zinc-800 bg-zinc-900/10 rounded-xl h-[600px] overflow-hidden">
      <div className="px-6 py-4 border-b border-zinc-800 bg-zinc-900/40 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse"></div>
          <span className="text-sm font-semibold text-white">Canal de Ajuda Mecânica - IA OficinaAI</span>
        </div>
        <span className="text-xs text-zinc-500">Gemini 1.5 Flash</span>
      </div>
      <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-4 bg-zinc-950/20">
        {chatMessages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-zinc-600">
            <div className="h-12 w-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 mb-4">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
            </div>
            <p className="text-sm font-semibold">Assistente Técnico de IA</p>
            <p className="text-xs mt-1">Pergunte sobre torque, diagnóstico de falhas, lubrificantes e mais.</p>
          </div>
        )}
        {chatMessages.map(msg => (
          <div key={msg.id} className={`flex flex-col max-w-[80%] ${msg.role === "user" ? "self-end items-end" : "self-start items-start"}`}>
            <div className={`p-4 rounded-xl text-sm leading-6 whitespace-pre-wrap ${msg.role === "user" ? "bg-indigo-600 text-white rounded-br-none" : "bg-zinc-900 text-zinc-200 border border-zinc-800 rounded-bl-none"}`}>{msg.content}</div>
            <span className="text-[10px] text-zinc-600 mt-1 font-semibold capitalize">{msg.role === "user" ? "Mecânico (Você)" : "IA Assistente"}</span>
          </div>
        ))}
        {isTyping && (
          <div className="self-start flex flex-col items-start gap-1">
            <div className="bg-zinc-900 border border-zinc-800 text-zinc-400 px-4 py-3 rounded-xl text-xs rounded-bl-none flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-zinc-500 animate-bounce"></div>
              <div className="h-1.5 w-1.5 rounded-full bg-zinc-500 animate-bounce delay-75"></div>
              <div className="h-1.5 w-1.5 rounded-full bg-zinc-500 animate-bounce delay-150"></div>
            </div>
          </div>
        )}
      </div>
      <form onSubmit={handleSendChatMessage} className="p-4 border-t border-zinc-800 bg-zinc-900/20 flex gap-3">
        <input type="text" placeholder="Pergunte sobre torque, diagnóstico de injeção, óleo..." value={chatInput} onChange={(e) => setChatInput(e.target.value)} className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500" />
        <button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition shadow-md shadow-indigo-600/10">Enviar</button>
      </form>
    </div>
  );
}
