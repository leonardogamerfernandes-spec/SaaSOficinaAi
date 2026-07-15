"use client";

import type { User, Tenant } from "@/lib/api";

interface SidebarProps {
  user: User | null;
  tenant: Tenant | null;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onLogout: () => void;
}

const navItems = [
  { id: "dashboard", label: "Dashboard", requiredPlan: "FREE", icon: (
    <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zM14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z" /></svg>
  )},
  { id: "orders", label: "Ordens & Orçamentos", requiredPlan: "FREE", icon: (
    <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
  )},
  { id: "clients", label: "Clientes", requiredPlan: "FREE", icon: (
    <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
  )},
  { id: "vehicles", label: "Veículos", requiredPlan: "FREE", icon: (
    <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 04-4 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10M21 16v-4a1 1 0 00-.3-.7l-3-3a1 1 0 00-.7-.3H13m8 8h-8" /></svg>
  )},
  { id: "agenda", label: "Agenda de Serviços", requiredPlan: "FREE", icon: (
    <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
  )},
  { id: "chat", label: "Assistente de IA", requiredPlan: "FREE", icon: (
    <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
  )},
  { id: "parts-finder", label: "Buscador de Peças", requiredPlan: "PRO", icon: (
    <svg className="h-4.5 w-4.5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
  )},
  { id: "inventory", label: "Estoque de Peças", requiredPlan: "PRO", icon: (
    <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
  )},
  { id: "reminders", label: "Lembretes Automáticos", requiredPlan: "PRO", icon: (
    <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
  )},
  { id: "reports", label: "Relatórios & Finanças", requiredPlan: "PRO", icon: (
    <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z" /></svg>
  )},
  { id: "plans", label: "Minha Assinatura", requiredPlan: "FREE", icon: (
    <svg className="h-4.5 w-4.5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
  )},
];

export default function Sidebar({ user, tenant, activeTab, onTabChange, onLogout }: SidebarProps) {
  const currentPlan = tenant?.plan || "FREE";
  
  return (
    <aside className="w-64 flex-shrink-0 border-r border-zinc-800/80 bg-zinc-950/70 backdrop-blur-xl px-5 py-7 flex flex-col justify-between overflow-y-auto">
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-3 px-2">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-500 via-indigo-600 to-violet-600 flex items-center justify-center font-black text-xl text-white shadow-lg shadow-indigo-600/30">
            O
          </div>
          <div>
            <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-indigo-200 to-white bg-clip-text text-transparent">OficinaAI</span>
            <span className="block text-[9px] text-zinc-500 font-bold tracking-widest uppercase">SaaS Mecânica</span>
          </div>
        </div>

        <div className="h-px bg-gradient-to-r from-zinc-800/80 to-transparent mx-2" />

        <nav className="flex flex-col gap-1">
          {navItems.map(item => {
            const hasAccess = item.requiredPlan === "FREE" || currentPlan !== "FREE";
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`group flex items-center justify-between px-3 py-2.5 rounded-xl text-[11px] font-bold transition-all duration-200 ${
                  isActive
                    ? "bg-gradient-to-r from-indigo-600/90 to-violet-600/90 text-white shadow-lg shadow-indigo-600/20"
                    : "text-zinc-400 hover:bg-zinc-900/80 hover:text-zinc-200"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`transition-transform duration-200 ${isActive ? "scale-110" : "group-hover:scale-105"}`}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>
                {!hasAccess && (
                  <span className="text-[10px] text-zinc-600 group-hover:text-indigo-400 transition" title="Exclusivo Pro">🔒</span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="border-t border-zinc-900 pt-5 mt-4">
        <div className="flex items-center justify-between bg-zinc-900/40 border border-zinc-800/50 rounded-2xl p-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-500/10 to-violet-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-sm">
              {user?.name?.charAt(0).toUpperCase() || "U"}
            </div>
            <div className="min-w-0">
              <span className="block text-[11px] font-extrabold truncate text-zinc-100">{user?.name || "Usuário"}</span>
              <span className="inline-block mt-0.5 px-1.5 py-0.2 rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/15 text-[8px] font-black tracking-wide uppercase">
                {currentPlan}
              </span>
            </div>
          </div>
          <button 
            onClick={onLogout} 
            className="text-zinc-500 hover:text-red-400 p-1.5 rounded-lg hover:bg-red-500/10 transition-colors"
            title="Sair"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </div>
    </aside>
  );
}
