"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";

interface Customer {
  id: string; name: string; email: string; phone: string; cpfCnpj: string; address: string;
}
interface Vehicle {
  id: string; customerId: string; plate: string; brand: string; model: string; year: number; color: string;
}
interface ServiceItem {
  id: string; description: string; quantity: number; unitPrice: number; totalPrice: number; type: "PART" | "LABOR";
}
interface ServiceOrder {
  id: string; customerId: string; vehicleId: string; status: string; discount: number; totalPrice: number; notes: string; aiDiagnostic?: string; createdAt: string; items: ServiceItem[];
}
interface Appointment {
  id: string; customerId: string; vehicleId: string; scheduledTime: string; notes: string; status: string;
}
interface ChatMessage {
  id: string; role: "user" | "model"; content: string;
}
interface DashboardMetrics {
  totalCustomers: number; totalVehicles: number; activeOrdersCount: number; pendingBudgetsCount: number; totalRevenue: number;
}

export default function Home() {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [tenant, setTenant] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<"dashboard" | "clients" | "vehicles" | "orders" | "agenda" | "chat">("dashboard");

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [orders, setOrders] = useState<ServiceOrder[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  const [selectedOrder, setSelectedOrder] = useState<ServiceOrder | null>(null);
  const [dashboardMetrics, setDashboardMetrics] = useState<DashboardMetrics | null>(null);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [chatSessionId, setChatSessionId] = useState<string | null>(null);

  const [isAddingCustomer, setIsAddingCustomer] = useState(false);
  const [isAddingVehicle, setIsAddingVehicle] = useState(false);
  const [isAddingOrder, setIsAddingOrder] = useState(false);
  const [isAddingAppointment, setIsAddingAppointment] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  const [newCust, setNewCust] = useState({ name: "", email: "", phone: "", cpfCnpj: "", address: "" });
  const [newVeh, setNewVeh] = useState({ customerId: "", plate: "", brand: "", model: "", year: 2020, color: "" });
  const [newOrder, setNewOrder] = useState({ customerId: "", vehicleId: "", notes: "" });
  const [newApt, setNewApt] = useState({ customerId: "", vehicleId: "", scheduledTime: "", notes: "" });
  const [newItem, setNewItem] = useState({ description: "", quantity: 1, unitPrice: 0, type: "PART" as "PART" | "LABOR" });

  const [loginEmail, setLoginEmail] = useState("zeca@oficina.com");
  const [loginPassword, setLoginPassword] = useState("123456");
  const [loginError, setLoginError] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [registerData, setRegisterData] = useState({ name: "", email: "", password: "", tenantName: "", cnpj: "" });
  const [registerError, setRegisterError] = useState("");

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");
    const savedTenant = localStorage.getItem("tenant");
    if (savedToken) {
      setToken(savedToken);
      if (savedUser) setUser(JSON.parse(savedUser));
      if (savedTenant) setTenant(JSON.parse(savedTenant));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (token) fetchAllData();
  }, [token]);

  async function fetchAllData() {
    try {
      const [c, v, o, d] = await Promise.all([
        api.customers.list().catch(() => []),
        api.vehicles.list().catch(() => []),
        api.serviceOrders.list().catch(() => []),
        api.dashboard.metrics().catch(() => null),
      ]);
      setCustomers(c);
      setVehicles(v);
      setOrders(o);
      if (d) {
        setDashboardMetrics(d.metrics);
        setRecentOrders(d.recentOrders || []);
      }
    } catch (e) {
      console.error("Failed to fetch data:", e);
    }
  }

  async function fetchAppointments() {
    try {
      const appts = await api.serviceOrders.list();  // Reusing; appointments endpoint needed
      setAppointments([]);
    } catch {}
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoggingIn(true);
    setLoginError("");
    try {
      const res = await api.auth.login(loginEmail, loginPassword);
      localStorage.setItem("token", res.token);
      localStorage.setItem("user", JSON.stringify(res.user));
      localStorage.setItem("tenant", JSON.stringify(res.tenant));
      setToken(res.token);
      setUser(res.user);
      setTenant(res.tenant);
    } catch (err: any) {
      setLoginError(err.message || "Login failed");
    } finally {
      setLoggingIn(false);
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setLoggingIn(true);
    setRegisterError("");
    try {
      const res = await api.auth.register(registerData);
      localStorage.setItem("token", res.token);
      localStorage.setItem("user", JSON.stringify(res.user));
      localStorage.setItem("tenant", JSON.stringify(res.tenant));
      setToken(res.token);
      setUser(res.user);
      setTenant(res.tenant);
    } catch (err: any) {
      setRegisterError(err.message || "Registration failed");
    } finally {
      setLoggingIn(false);
    }
  }

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("tenant");
    setToken(null);
    setUser(null);
    setTenant(null);
    setCustomers([]);
    setVehicles([]);
    setOrders([]);
  }

  async function handleAddCustomer(e: React.FormEvent) {
    e.preventDefault();
    if (!newCust.name || !newCust.phone) return;
    try {
      const created = await api.customers.create(newCust);
      setCustomers(prev => [...prev, created]);
      setIsAddingCustomer(false);
      setNewCust({ name: "", email: "", phone: "", cpfCnpj: "", address: "" });
    } catch (err: any) {
      alert(err.message);
    }
  }

  async function handleAddVehicle(e: React.FormEvent) {
    e.preventDefault();
    if (!newVeh.customerId || !newVeh.plate || !newVeh.brand || !newVeh.model) return;
    try {
      const created = await api.vehicles.create({ ...newVeh, year: Number(newVeh.year) });
      setVehicles(prev => [...prev, created]);
      setIsAddingVehicle(false);
      setNewVeh({ customerId: "", plate: "", brand: "", model: "", year: 2020, color: "" });
    } catch (err: any) {
      alert(err.message);
    }
  }

  async function handleAddOrder(e: React.FormEvent) {
    e.preventDefault();
    if (!newOrder.customerId || !newOrder.vehicleId) return;
    try {
      const created = await api.serviceOrders.create(newOrder);
      setOrders(prev => [created, ...prev]);
      setIsAddingOrder(false);
      setNewOrder({ customerId: "", vehicleId: "", notes: "" });
    } catch (err: any) {
      alert(err.message);
    }
  }

  async function handleAddAppointment(e: React.FormEvent) {
    e.preventDefault();
    if (!newApt.customerId || !newApt.vehicleId || !newApt.scheduledTime) return;
    // Appointments endpoint not exposed via API currently
    alert("Appointments endpoint not yet available via API. Coming soon.");
    setIsAddingAppointment(false);
  }

  async function handleAddItem(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedOrder || !newItem.description || newItem.unitPrice <= 0) return;
    try {
      await api.serviceOrders.addItem(selectedOrder.id, {
        description: newItem.description,
        quantity: Number(newItem.quantity),
        unitPrice: Number(newItem.unitPrice),
        type: newItem.type,
      });
      const updated = await api.serviceOrders.get(selectedOrder.id);
      setOrders(prev => prev.map(o => o.id === selectedOrder.id ? updated : o));
      setSelectedOrder(updated);
      setNewItem({ description: "", quantity: 1, unitPrice: 0, type: "PART" });
    } catch (err: any) {
      alert(err.message);
    }
  }

  async function handleRemoveItem(itemId: string) {
    if (!selectedOrder) return;
    try {
      await api.serviceOrders.removeItem(selectedOrder.id, itemId);
      const updated = await api.serviceOrders.get(selectedOrder.id);
      setOrders(prev => prev.map(o => o.id === selectedOrder.id ? updated : o));
      setSelectedOrder(updated);
    } catch (err: any) {
      alert(err.message);
    }
  }

  async function handleStatusChange(status: string) {
    if (!selectedOrder) return;
    try {
      await api.serviceOrders.update(selectedOrder.id, { status });
      const updated = await api.serviceOrders.get(selectedOrder.id);
      setOrders(prev => prev.map(o => o.id === selectedOrder.id ? updated : o));
      setSelectedOrder(updated);
    } catch (err: any) {
      alert(err.message);
    }
  }

  async function handleAIGenerateDiagnostic() {
    if (!selectedOrder) return;
    setIsGeneratingAI(true);
    try {
      const res = await api.serviceOrders.aiAnalyze(selectedOrder.id);
      const updated = res.order || await api.serviceOrders.get(selectedOrder.id);
      setOrders(prev => prev.map(o => o.id === selectedOrder.id ? updated : o));
      setSelectedOrder(updated);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsGeneratingAI(false);
    }
  }

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
        const welcome: ChatMessage = { id: "welcome-" + Date.now(), role: "model", content: `Sessão de chat criada. Como posso ajudar?` };
        setChatMessages(prev => [...prev, welcome]);
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

  const getCustomerName = (id: string) => customers.find(c => c.id === id)?.name || "Cliente desconhecido";
  const getVehiclePlate = (id: string) => vehicles.find(v => v.id === id)?.plate || "---";
  const getVehicleModel = (id: string) => {
    const v = vehicles.find(veh => veh.id === id);
    return v ? `${v.brand} ${v.model}` : "Veículo desconhecido";
  };

  const activeOrdersCount = dashboardMetrics?.activeOrdersCount ?? orders.filter(o => o.status === "IN_PROGRESS").length;
  const pendingBudgetsCount = dashboardMetrics?.pendingBudgetsCount ?? orders.filter(o => o.status === "DRAFT_BUDGET").length;
  const totalRevenue = dashboardMetrics?.totalRevenue ?? orders
    .filter(o => ["COMPLETED", "BUDGET_APPROVED", "IN_PROGRESS"].includes(o.status))
    .reduce((sum, o) => sum + o.totalPrice, 0);

  if (loading) return <div className="flex min-h-screen bg-zinc-950 items-center justify-center text-zinc-400">Carregando...</div>;

  if (!token) {
    return (
      <div className="flex min-h-screen bg-zinc-950 items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-600 flex items-center justify-center font-bold text-xl text-white shadow-lg shadow-indigo-500/20">O</div>
            <div>
              <span className="font-bold text-2xl tracking-tight bg-gradient-to-r from-indigo-200 to-white bg-clip-text text-transparent">OficinaAI</span>
              <span className="block text-xs text-zinc-500 font-semibold tracking-wider uppercase">SaaS para Mecânicas</span>
            </div>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 shadow-2xl">
            <h2 className="text-xl font-bold text-white mb-6">{showRegister ? "Criar Conta" : "Entrar"}</h2>

            {showRegister ? (
              <form onSubmit={handleRegister} className="flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] text-zinc-400 font-bold uppercase mb-1">Seu Nome</label>
                    <input type="text" value={registerData.name} onChange={e => setRegisterData({ ...registerData, name: e.target.value })} className="w-full bg-zinc-950 border border-zinc-800 rounded p-2.5 text-sm text-white focus:outline-none focus:border-indigo-500" required />
                  </div>
                  <div>
                    <label className="block text-[10px] text-zinc-400 font-bold uppercase mb-1">Seu Email</label>
                    <input type="email" value={registerData.email} onChange={e => setRegisterData({ ...registerData, email: e.target.value })} className="w-full bg-zinc-950 border border-zinc-800 rounded p-2.5 text-sm text-white focus:outline-none focus:border-indigo-500" required />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] text-zinc-400 font-bold uppercase mb-1">Senha</label>
                  <input type="password" value={registerData.password} onChange={e => setRegisterData({ ...registerData, password: e.target.value })} className="w-full bg-zinc-950 border border-zinc-800 rounded p-2.5 text-sm text-white focus:outline-none focus:border-indigo-500" required />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] text-zinc-400 font-bold uppercase mb-1">Nome da Oficina</label>
                    <input type="text" value={registerData.tenantName} onChange={e => setRegisterData({ ...registerData, tenantName: e.target.value })} className="w-full bg-zinc-950 border border-zinc-800 rounded p-2.5 text-sm text-white focus:outline-none focus:border-indigo-500" required />
                  </div>
                  <div>
                    <label className="block text-[10px] text-zinc-400 font-bold uppercase mb-1">CNPJ</label>
                    <input type="text" value={registerData.cnpj} onChange={e => setRegisterData({ ...registerData, cnpj: e.target.value })} className="w-full bg-zinc-950 border border-zinc-800 rounded p-2.5 text-sm text-white focus:outline-none focus:border-indigo-500" required />
                  </div>
                </div>
                {registerError && <p className="text-red-400 text-xs">{registerError}</p>}
                <button type="submit" disabled={loggingIn} className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-zinc-700 text-white font-bold py-2.5 rounded text-sm transition">{loggingIn ? "Criando..." : "Criar Conta"}</button>
                <p className="text-xs text-zinc-500 text-center">Já tem conta? <button type="button" onClick={() => setShowRegister(false)} className="text-indigo-400 hover:underline">Entrar</button></p>
              </form>
            ) : (
              <form onSubmit={handleLogin} className="flex flex-col gap-4">
                <div>
                  <label className="block text-[10px] text-zinc-400 font-bold uppercase mb-1">Email</label>
                  <input type="email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded p-2.5 text-sm text-white focus:outline-none focus:border-indigo-500" required />
                </div>
                <div>
                  <label className="block text-[10px] text-zinc-400 font-bold uppercase mb-1">Senha</label>
                  <input type="password" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded p-2.5 text-sm text-white focus:outline-none focus:border-indigo-500" required />
                </div>
                {loginError && <p className="text-red-400 text-xs">{loginError}</p>}
                <button type="submit" disabled={loggingIn} className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-zinc-700 text-white font-bold py-2.5 rounded text-sm transition">{loggingIn ? "Entrando..." : "Entrar"}</button>
                <p className="text-xs text-zinc-500 text-center">Seed: <code className="text-indigo-400">zeca@oficina.com</code> / <code className="text-indigo-400">123456</code></p>
                <p className="text-xs text-zinc-500 text-center">Não tem conta? <button type="button" onClick={() => setShowRegister(true)} className="text-indigo-400 hover:underline">Registrar</button></p>
              </form>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-zinc-950 font-sans text-zinc-100 antialiased selection:bg-indigo-500 selection:text-white">
      <aside className="w-64 flex-shrink-0 border-r border-zinc-800 bg-zinc-900/50 backdrop-blur-md px-6 py-8 flex flex-col justify-between">
        <div className="flex flex-col gap-8">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-600 flex items-center justify-center font-bold text-lg text-white shadow-lg shadow-indigo-500/20">O</div>
            <div>
              <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-indigo-200 to-white bg-clip-text text-transparent">OficinaAI</span>
              <span className="block text-xs text-zinc-500 font-semibold tracking-wider uppercase">SaaS Mecânica</span>
            </div>
          </div>
          <nav className="flex flex-col gap-1.5">
            {[
              { id: "dashboard", label: "Dashboard", icon: <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zM14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z" /></svg> },
              { id: "orders", label: "Ordens & Orçamentos", icon: <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg> },
              { id: "clients", label: "Clientes", icon: <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg> },
              { id: "vehicles", label: "Veículos", icon: <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10M21 16v-4a1 1 0 00-.3-.7l-3-3a1 1 0 00-.7-.3H13m8 8h-8" /></svg> },
              { id: "agenda", label: "Agenda de Serviços", icon: <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg> },
              { id: "chat", label: "Assistente de IA", icon: <svg className="h-5 w-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg> },
            ].map(item => (
              <button key={item.id} onClick={() => { setActiveTab(item.id as typeof activeTab); setSelectedOrder(null); }} className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === item.id ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10 font-semibold" : "text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-200"}`}>
                {item.icon}
                {item.label}
              </button>
            ))}
          </nav>
        </div>
        <div className="border-t border-zinc-800 pt-6">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-zinc-800 flex items-center justify-center font-bold text-sm border border-zinc-700">{user?.name?.charAt(0) || "U"}</div>
            <div className="flex-1 min-w-0">
              <span className="block text-sm font-semibold truncate">{user?.name || "Usuário"}</span>
              <span className="block text-xs text-zinc-500 truncate">{tenant?.name || "Oficina"}</span>
            </div>
            <button onClick={handleLogout} className="text-zinc-500 hover:text-red-400 text-xs font-bold" title="Sair">⏻</button>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto px-10 py-8">
        <header className="flex justify-between items-center mb-8 pb-5 border-b border-zinc-800">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white capitalize">
              {activeTab === "orders" ? "Ordens de Serviço e Orçamentos" : activeTab === "agenda" ? "Agenda da Oficina" : activeTab === "clients" ? "Clientes" : activeTab === "vehicles" ? "Veículos" : activeTab === "chat" ? "Assistente de IA" : "Dashboard"}
            </h1>
            <p className="text-sm text-zinc-500 mt-1">Gerenciamento completo integrado com Inteligência Artificial.</p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setIsAddingOrder(true)} className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-semibold transition shadow-md shadow-indigo-600/10 flex items-center gap-2">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
              Nova OS
            </button>
          </div>
        </header>

        {activeTab === "dashboard" && (
          <div className="flex flex-col gap-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                { label: "Faturamento Acumulado", val: `R$ ${totalRevenue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`, color: "border-emerald-500/20 bg-emerald-500/5 text-emerald-400" },
                { label: "Ordens em Andamento", val: activeOrdersCount, color: "border-amber-500/20 bg-amber-500/5 text-amber-400" },
                { label: "Orçamentos Pendentes", val: pendingBudgetsCount, color: "border-indigo-500/20 bg-indigo-500/5 text-indigo-400" },
                { label: "Total de Clientes", val: dashboardMetrics?.totalCustomers ?? customers.length, color: "border-zinc-800 bg-zinc-900/40 text-zinc-200" },
              ].map((m, idx) => (
                <div key={idx} className={`p-6 rounded-xl border ${m.color} flex flex-col gap-2`}>
                  <span className="text-xs text-zinc-500 font-bold uppercase tracking-wider">{m.label}</span>
                  <span className="text-3xl font-extrabold tracking-tight">{m.val}</span>
                </div>
              ))}
            </div>

            <div className="p-6 rounded-xl border border-zinc-800 bg-zinc-900/30">
              <h2 className="text-base font-bold mb-4">Ações Rápidas do Sistema</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <button onClick={() => setIsAddingCustomer(true)} className="p-4 rounded-lg bg-zinc-800/40 border border-zinc-700 hover:border-indigo-500 transition text-left flex flex-col gap-2 group">
                  <span className="h-8 w-8 rounded bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold">C</span>
                  <span className="text-sm font-semibold group-hover:text-indigo-400 transition">Novo Cliente</span>
                  <span className="text-xs text-zinc-500">Cadastre os dados cadastrais básicos.</span>
                </button>
                <button onClick={() => setIsAddingVehicle(true)} className="p-4 rounded-lg bg-zinc-800/40 border border-zinc-700 hover:border-indigo-500 transition text-left flex flex-col gap-2 group">
                  <span className="h-8 w-8 rounded bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold">V</span>
                  <span className="text-sm font-semibold group-hover:text-indigo-400 transition">Novo Veículo</span>
                  <span className="text-xs text-zinc-500">Cadastre um carro vinculando-o a um proprietário.</span>
                </button>
                <button onClick={() => setIsAddingAppointment(true)} className="p-4 rounded-lg bg-zinc-800/40 border border-zinc-700 hover:border-indigo-500 transition text-left flex flex-col gap-2 group">
                  <span className="h-8 w-8 rounded bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold">A</span>
                  <span className="text-sm font-semibold group-hover:text-indigo-400 transition">Agendar Serviço</span>
                  <span className="text-xs text-zinc-500">Insira um agendamento na grade da oficina.</span>
                </button>
                <button onClick={() => setActiveTab("chat")} className="p-4 rounded-lg bg-zinc-800/40 border border-zinc-700 hover:border-indigo-500 transition text-left flex flex-col gap-2 group">
                  <span className="h-8 w-8 rounded bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold">IA</span>
                  <span className="text-sm font-semibold group-hover:text-indigo-400 transition">Chat de Ajuda da IA</span>
                  <span className="text-xs text-zinc-500">Tire dúvidas de torque, códigos de falha ou óleo.</span>
                </button>
              </div>
            </div>

            <div className="border border-zinc-800 rounded-xl bg-zinc-900/10 overflow-hidden">
              <div className="px-6 py-4 border-b border-zinc-800 flex justify-between items-center">
                <h2 className="text-base font-bold">Ordens de Serviço Recentes</h2>
                <button onClick={() => setActiveTab("orders")} className="text-indigo-400 hover:text-indigo-300 text-xs font-semibold">Ver todas →</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-zinc-300">
                  <thead className="bg-zinc-900/60 text-zinc-500 text-xs font-semibold uppercase tracking-wider">
                    <tr>
                      <th className="px-6 py-3">ID OS</th>
                      <th className="px-6 py-3">Cliente</th>
                      <th className="px-6 py-3">Veículo</th>
                      <th className="px-6 py-3">Status</th>
                      <th className="px-6 py-3">Total</th>
                      <th className="px-6 py-3 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800">
                    {orders.slice(0, 5).map(o => (
                      <tr key={o.id} className="hover:bg-zinc-800/20 transition-colors">
                        <td className="px-6 py-4 font-mono font-medium text-white">{o.id?.slice(0, 8) || o.id}</td>
                        <td className="px-6 py-4">{getCustomerName(o.customerId)}</td>
                        <td className="px-6 py-4">{getVehicleModel(o.vehicleId)}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-0.5 rounded text-xs font-semibold inline-block ${o.status === "COMPLETED" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/15" : o.status === "IN_PROGRESS" ? "bg-amber-500/10 text-amber-400 border border-amber-500/15" : "bg-indigo-500/10 text-indigo-400 border border-indigo-500/15"}`}>
                            {o.status === "COMPLETED" ? "Concluído" : o.status === "IN_PROGRESS" ? "Em Execução" : "Orçamento"}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-semibold text-white">R$ {o.totalPrice.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</td>
                        <td className="px-6 py-4 text-right">
                          <button onClick={() => setSelectedOrder(o)} className="bg-zinc-800 hover:bg-zinc-700 px-3 py-1 rounded text-xs font-semibold border border-zinc-700 transition">Visualizar</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === "orders" && !selectedOrder && (
          <div className="border border-zinc-800 rounded-xl bg-zinc-900/10 overflow-hidden">
            <div className="px-6 py-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/40">
              <h2 className="text-base font-bold">Listagem Geral de Ordens e Orçamentos</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-zinc-300">
                <thead className="bg-zinc-900/60 text-zinc-500 text-xs font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-3">Código</th>
                    <th className="px-6 py-3">Abertura</th>
                    <th className="px-6 py-3">Cliente</th>
                    <th className="px-6 py-3">Veículo</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3">Valor Total</th>
                    <th className="px-6 py-3 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {orders.map(o => (
                    <tr key={o.id} className="hover:bg-zinc-800/20 transition-colors">
                      <td className="px-6 py-4 font-mono font-medium text-white">{o.id?.slice(0, 8) || o.id}</td>
                      <td className="px-6 py-4 text-xs text-zinc-500">{o.createdAt ? new Date(o.createdAt).toLocaleDateString("pt-BR") : "---"}</td>
                      <td className="px-6 py-4">{getCustomerName(o.customerId)}</td>
                      <td className="px-6 py-4">{getVehicleModel(o.vehicleId)} ({getVehiclePlate(o.vehicleId)})</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 rounded text-xs font-semibold inline-block ${o.status === "COMPLETED" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/15" : o.status === "IN_PROGRESS" ? "bg-amber-500/10 text-amber-400 border border-amber-500/15" : "bg-indigo-500/10 text-indigo-400 border border-indigo-500/15"}`}>
                          {o.status === "COMPLETED" ? "Concluído" : o.status === "IN_PROGRESS" ? "Em Execução" : "Orçamento"}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-semibold text-white">R$ {o.totalPrice.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</td>
                      <td className="px-6 py-4 text-right">
                        <button onClick={() => setSelectedOrder(o)} className="bg-zinc-800 hover:bg-zinc-700 px-3 py-1 rounded text-xs font-semibold border border-zinc-700 transition">Gerenciar</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {selectedOrder && (
          <div className="flex flex-col gap-6">
            <button onClick={() => setSelectedOrder(null)} className="text-xs font-bold text-zinc-400 hover:text-zinc-200 flex items-center gap-1.5 self-start">← Voltar para listagem</button>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 flex flex-col gap-6">
                <div className="p-6 rounded-xl border border-zinc-800 bg-zinc-900/30 flex flex-col gap-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-xs font-mono text-zinc-500">CÓDIGO: {selectedOrder.id}</span>
                      <h2 className="text-lg font-bold text-white mt-0.5">Detalhes da Ordem de Serviço</h2>
                    </div>
                    <div className="flex gap-2">
                      <select value={selectedOrder.status} onChange={(e) => handleStatusChange(e.target.value)} className="bg-zinc-800 border border-zinc-700 rounded-md text-xs px-2.5 py-1 text-white focus:outline-none focus:border-indigo-500 font-semibold">
                        <option value="DRAFT_BUDGET">Orçamento Inicial</option>
                        <option value="BUDGET_APPROVED">Orçamento Aprovado</option>
                        <option value="IN_PROGRESS">Em Execução</option>
                        <option value="COMPLETED">Serviço Concluído</option>
                        <option value="CANCELLED">Cancelado</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 border-t border-zinc-800/80 pt-4">
                    <div><span className="block text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Cliente</span><span className="text-sm font-semibold text-zinc-200">{getCustomerName(selectedOrder.customerId)}</span></div>
                    <div><span className="block text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Veículo</span><span className="text-sm font-semibold text-zinc-200">{getVehicleModel(selectedOrder.vehicleId)}</span></div>
                    <div><span className="block text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Placa</span><span className="text-sm font-semibold font-mono text-indigo-400">{getVehiclePlate(selectedOrder.vehicleId)}</span></div>
                    <div><span className="block text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Data Entrada</span><span className="text-sm font-semibold text-zinc-200">{selectedOrder.createdAt ? new Date(selectedOrder.createdAt).toLocaleDateString("pt-BR") : "---"}</span></div>
                  </div>
                  <div className="border-t border-zinc-800/80 pt-4 flex flex-col gap-1.5">
                    <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Sintomas / Observações</span>
                    <p className="text-sm text-zinc-300 italic">&ldquo;{selectedOrder.notes || "Sem observações detalhadas."}&rdquo;</p>
                  </div>
                </div>
                <div className="p-6 rounded-xl border border-zinc-800 bg-zinc-900/30 flex flex-col gap-4">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">Peças e Mão de Obra</h3>
                  <form onSubmit={handleAddItem} className="grid grid-cols-1 md:grid-cols-5 gap-3 bg-zinc-950 p-4 rounded-lg border border-zinc-800/50">
                    <div className="md:col-span-2">
                      <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Descrição</label>
                      <input type="text" placeholder="Ex: Pastilha de freio Bosch" value={newItem.description} onChange={(e) => setNewItem({ ...newItem, description: e.target.value })} className="w-full bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500" required />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Tipo</label>
                      <select value={newItem.type} onChange={(e) => setNewItem({ ...newItem, type: e.target.value as "PART" | "LABOR" })} className="w-full bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500">
                        <option value="PART">Peça</option>
                        <option value="LABOR">Mão de Obra</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Qtd / Unit.</label>
                      <div className="flex gap-1.5">
                        <input type="number" value={newItem.quantity} min={1} onChange={(e) => setNewItem({ ...newItem, quantity: Number(e.target.value) })} className="w-12 bg-zinc-900 border border-zinc-800 rounded px-1.5 py-1.5 text-xs text-white text-center focus:outline-none" />
                        <input type="number" placeholder="0,00" value={newItem.unitPrice || ""} onChange={(e) => setNewItem({ ...newItem, unitPrice: Number(e.target.value) })} className="flex-1 bg-zinc-900 border border-zinc-800 rounded px-2 py-1.5 text-xs text-white focus:outline-none" required />
                      </div>
                    </div>
                    <div className="flex items-end">
                      <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white rounded py-1.5 text-xs font-bold transition">Adicionar</button>
                    </div>
                  </form>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead><tr className="text-zinc-500 font-bold border-b border-zinc-800 pb-2 uppercase tracking-wide"><th className="py-2">Descrição</th><th className="py-2">Tipo</th><th className="py-2 text-center">Qtd</th><th className="py-2 text-right">Unitário</th><th className="py-2 text-right">Subtotal</th><th className="py-2 text-right">Ação</th></tr></thead>
                      <tbody className="divide-y divide-zinc-800/50">
                        {selectedOrder.items?.length === 0 ? (
                          <tr><td colSpan={6} className="py-6 text-center text-zinc-500">Nenhum item adicionado a este orçamento ainda.</td></tr>
                        ) : (
                          selectedOrder.items?.map(item => (
                            <tr key={item.id} className="hover:bg-zinc-800/10">
                              <td className="py-2.5 font-medium text-white">{item.description}</td>
                              <td className="py-2.5"><span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${item.type === "PART" ? "bg-blue-500/10 text-blue-400" : "bg-purple-500/10 text-purple-400"}`}>{item.type === "PART" ? "Peça" : "Mão de Obra"}</span></td>
                              <td className="py-2.5 text-center">{item.quantity}</td>
                              <td className="py-2.5 text-right">R$ {item.unitPrice.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</td>
                              <td className="py-2.5 text-right font-semibold text-white">R$ {item.totalPrice.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</td>
                              <td className="py-2.5 text-right"><button onClick={() => handleRemoveItem(item.id)} className="text-red-400 hover:text-red-300 font-bold">Remover</button></td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                  <div className="flex justify-between items-center border-t border-zinc-800 pt-4 bg-zinc-950/40 p-4 rounded-lg">
                    <span className="text-sm font-semibold text-zinc-400">Total do Orçamento</span>
                    <span className="text-xl font-extrabold text-white">R$ {selectedOrder.totalPrice.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </div>
              <div className="lg:col-span-1">
                <div className="p-6 rounded-xl border border-indigo-500/20 bg-indigo-500/5 flex flex-col gap-4 sticky top-6">
                  <div className="flex items-center gap-2"><div className="h-6 w-6 rounded bg-indigo-500/10 flex items-center justify-center text-indigo-400">✨</div><h3 className="text-sm font-bold text-white uppercase tracking-wider">Suporte Técnico IA</h3></div>
                  <p className="text-xs text-zinc-400">O assistente de inteligência artificial analisa os sintomas relatados para sugerir falhas prováveis e listar peças que comumente precisam de substituição.</p>
                  <button onClick={handleAIGenerateDiagnostic} disabled={isGeneratingAI} className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-zinc-800 text-white font-semibold text-xs py-2 rounded transition flex items-center justify-center gap-1.5 shadow">
                    {isGeneratingAI ? "Pensando..." : selectedOrder.aiDiagnostic ? "Atualizar Análise IA" : "Gerar Pré-Diagnóstico IA"}
                  </button>
                  <div className="border-t border-indigo-500/20 pt-4 flex flex-col gap-3 min-h-[150px] bg-zinc-950/60 p-4 rounded-lg max-h-[400px] overflow-y-auto">
                    {isGeneratingAI ? (
                      <div className="flex flex-col gap-2 items-center justify-center h-full py-8">
                        <div className="h-5 w-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-xs text-zinc-500">Gerando análise detalhada...</span>
                      </div>
                    ) : selectedOrder.aiDiagnostic ? (
                      <div className="text-xs text-zinc-300 whitespace-pre-wrap leading-5 prose prose-invert">{selectedOrder.aiDiagnostic}</div>
                    ) : (
                      <span className="text-xs text-zinc-600 italic text-center py-8">Nenhum diagnóstico gerado ainda. Clique no botão acima para acionar a IA.</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "clients" && (
          <div className="flex flex-col gap-6">
            <div className="flex justify-end">
              <button onClick={() => setIsAddingCustomer(true)} className="bg-indigo-600 hover:bg-indigo-500 text-white px-3.5 py-2 rounded-lg text-xs font-bold transition shadow flex items-center gap-1.5">Cadastrar Cliente</button>
            </div>
            <div className="border border-zinc-800 rounded-xl bg-zinc-900/10 overflow-hidden">
              <table className="w-full text-left text-sm text-zinc-300">
                <thead className="bg-zinc-900/60 text-zinc-500 text-xs font-semibold uppercase tracking-wider"><tr><th className="px-6 py-3">Nome</th><th className="px-6 py-3">Telefone</th><th className="px-6 py-3">Email</th><th className="px-6 py-3">CPF / CNPJ</th><th className="px-6 py-3">Endereço</th></tr></thead>
                <tbody className="divide-y divide-zinc-800">
                  {customers.map(c => (
                    <tr key={c.id} className="hover:bg-zinc-800/10 transition-colors">
                      <td className="px-6 py-4 font-semibold text-white">{c.name}</td>
                      <td className="px-6 py-4">{c.phone}</td>
                      <td className="px-6 py-4">{c.email || "---"}</td>
                      <td className="px-6 py-4 font-mono text-xs">{c.cpfCnpj || "---"}</td>
                      <td className="px-6 py-4 text-xs text-zinc-400">{c.address || "---"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "vehicles" && (
          <div className="flex flex-col gap-6">
            <div className="flex justify-end">
              <button onClick={() => setIsAddingVehicle(true)} className="bg-indigo-600 hover:bg-indigo-500 text-white px-3.5 py-2 rounded-lg text-xs font-bold transition shadow flex items-center gap-1.5">Cadastrar Veículo</button>
            </div>
            <div className="border border-zinc-800 rounded-xl bg-zinc-900/10 overflow-hidden">
              <table className="w-full text-left text-sm text-zinc-300">
                <thead className="bg-zinc-900/60 text-zinc-500 text-xs font-semibold uppercase tracking-wider"><tr><th className="px-6 py-3">Placa</th><th className="px-6 py-3">Modelo</th><th className="px-6 py-3">Marca</th><th className="px-6 py-3">Ano</th><th className="px-6 py-3">Cor</th><th className="px-6 py-3">Proprietário</th></tr></thead>
                <tbody className="divide-y divide-zinc-800">
                  {vehicles.map(v => (
                    <tr key={v.id} className="hover:bg-zinc-800/10 transition-colors">
                      <td className="px-6 py-4 font-mono font-bold text-indigo-400">{v.plate}</td>
                      <td className="px-6 py-4 text-white font-medium">{v.model}</td>
                      <td className="px-6 py-4">{v.brand}</td>
                      <td className="px-6 py-4">{v.year}</td>
                      <td className="px-6 py-4">{v.color || "---"}</td>
                      <td className="px-6 py-4 text-zinc-400">{getCustomerName(v.customerId)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "agenda" && (
          <div className="flex flex-col gap-6">
            <div className="flex justify-end">
              <button onClick={() => setIsAddingAppointment(true)} className="bg-indigo-600 hover:bg-indigo-500 text-white px-3.5 py-2 rounded-lg text-xs font-bold transition shadow flex items-center gap-1.5">Agendar Horário</button>
            </div>
            <div className="border border-zinc-800 rounded-xl bg-zinc-900/10 overflow-hidden">
              <div className="px-6 py-10 text-center text-zinc-500">
                <p className="text-sm font-semibold">Endpoint de agendamentos será implementado em breve.</p>
                <p className="text-xs text-zinc-600 mt-2">Os agendamentos são gerenciados pelo backend via API REST.</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === "chat" && (
          <div className="flex flex-col border border-zinc-800 bg-zinc-900/10 rounded-xl h-[600px] overflow-hidden">
            <div className="px-6 py-4 border-b border-zinc-800 bg-zinc-900/40 flex items-center justify-between">
              <div className="flex items-center gap-2.5"><div className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse"></div><span className="text-sm font-semibold text-white">Canal de Ajuda Mecânica - IA OficinaAI</span></div>
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
                  <div className={`p-4 rounded-xl text-sm leading-6 whitespace-pre-wrap ${msg.role === "user" ? "bg-indigo-600 text-white rounded-br-none" : "bg-zinc-900 text-zinc-200 border border-zinc-800 rounded-bl-none prose prose-invert"}`}>{msg.content}</div>
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
        )}
      </main>

      {isAddingCustomer && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl w-full max-w-md p-6 shadow-2xl flex flex-col gap-4">
            <div className="flex justify-between items-center"><h3 className="text-base font-bold text-white">Cadastrar Novo Cliente</h3><button onClick={() => setIsAddingCustomer(false)} className="text-zinc-500 hover:text-zinc-300 font-bold">✕</button></div>
            <form onSubmit={handleAddCustomer} className="flex flex-col gap-3 text-xs">
              <div><label className="block text-[10px] text-zinc-400 font-bold uppercase mb-1">Nome Completo</label><input type="text" placeholder="Ex: João da Silva" value={newCust.name} onChange={(e) => setNewCust({ ...newCust, name: e.target.value })} className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-white focus:outline-none focus:border-indigo-500" required /></div>
              <div><label className="block text-[10px] text-zinc-400 font-bold uppercase mb-1">Telefone Celular</label><input type="text" placeholder="Ex: (11) 99999-9999" value={newCust.phone} onChange={(e) => setNewCust({ ...newCust, phone: e.target.value })} className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-white focus:outline-none" required /></div>
              <div><label className="block text-[10px] text-zinc-400 font-bold uppercase mb-1">E-mail</label><input type="email" placeholder="Ex: joao@email.com" value={newCust.email} onChange={(e) => setNewCust({ ...newCust, email: e.target.value })} className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-white focus:outline-none" /></div>
              <div><label className="block text-[10px] text-zinc-400 font-bold uppercase mb-1">CPF ou CNPJ</label><input type="text" placeholder="Ex: 123.456.789-00" value={newCust.cpfCnpj} onChange={(e) => setNewCust({ ...newCust, cpfCnpj: e.target.value })} className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-white focus:outline-none" /></div>
              <div><label className="block text-[10px] text-zinc-400 font-bold uppercase mb-1">Endereço</label><input type="text" placeholder="Ex: Rua das Flores, 45" value={newCust.address} onChange={(e) => setNewCust({ ...newCust, address: e.target.value })} className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-white focus:outline-none" /></div>
              <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 rounded text-sm transition mt-2">Confirmar Cadastro</button>
            </form>
          </div>
        </div>
      )}

      {isAddingVehicle && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl w-full max-w-md p-6 shadow-2xl flex flex-col gap-4">
            <div className="flex justify-between items-center"><h3 className="text-base font-bold text-white">Cadastrar Novo Veículo</h3><button onClick={() => setIsAddingVehicle(false)} className="text-zinc-500 hover:text-zinc-300 font-bold">✕</button></div>
            <form onSubmit={handleAddVehicle} className="flex flex-col gap-3 text-xs">
              <div><label className="block text-[10px] text-zinc-400 font-bold uppercase mb-1">Proprietário (Cliente)</label>
                <select value={newVeh.customerId} onChange={(e) => setNewVeh({ ...newVeh, customerId: e.target.value })} className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-white focus:outline-none" required>
                  <option value="">Selecione um cliente...</option>
                  {customers.map(c => (<option key={c.id} value={c.id}>{c.name}</option>))}
                </select>
              </div>
              <div><label className="block text-[10px] text-zinc-400 font-bold uppercase mb-1">Placa</label><input type="text" placeholder="Ex: BRA2E19" value={newVeh.plate} onChange={(e) => setNewVeh({ ...newVeh, plate: e.target.value })} className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-white focus:outline-none" required /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-[10px] text-zinc-400 font-bold uppercase mb-1">Marca</label><input type="text" placeholder="Ex: Chevrolet" value={newVeh.brand} onChange={(e) => setNewVeh({ ...newVeh, brand: e.target.value })} className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-white focus:outline-none" required /></div>
                <div><label className="block text-[10px] text-zinc-400 font-bold uppercase mb-1">Modelo</label><input type="text" placeholder="Ex: Onix 1.0T" value={newVeh.model} onChange={(e) => setNewVeh({ ...newVeh, model: e.target.value })} className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-white focus:outline-none" required /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-[10px] text-zinc-400 font-bold uppercase mb-1">Ano</label><input type="number" value={newVeh.year} onChange={(e) => setNewVeh({ ...newVeh, year: Number(e.target.value) })} className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-white focus:outline-none" required /></div>
                <div><label className="block text-[10px] text-zinc-400 font-bold uppercase mb-1">Cor</label><input type="text" placeholder="Ex: Cinza" value={newVeh.color} onChange={(e) => setNewVeh({ ...newVeh, color: e.target.value })} className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-white focus:outline-none" /></div>
              </div>
              <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 rounded text-sm transition mt-2">Confirmar Cadastro</button>
            </form>
          </div>
        </div>
      )}

      {isAddingOrder && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl w-full max-w-md p-6 shadow-2xl flex flex-col gap-4">
            <div className="flex justify-between items-center"><h3 className="text-base font-bold text-white">Criar Ordem de Serviço / Orçamento</h3><button onClick={() => setIsAddingOrder(false)} className="text-zinc-500 hover:text-zinc-300 font-bold">✕</button></div>
            <form onSubmit={handleAddOrder} className="flex flex-col gap-3 text-xs">
              <div><label className="block text-[10px] text-zinc-400 font-bold uppercase mb-1">Cliente</label>
                <select value={newOrder.customerId} onChange={(e) => { setNewOrder({ ...newOrder, customerId: e.target.value, vehicleId: "" }); }} className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-white focus:outline-none" required>
                  <option value="">Selecione o cliente...</option>
                  {customers.map(c => (<option key={c.id} value={c.id}>{c.name}</option>))}
                </select>
              </div>
              <div><label className="block text-[10px] text-zinc-400 font-bold uppercase mb-1">Veículo do Cliente</label>
                <select value={newOrder.vehicleId} onChange={(e) => setNewOrder({ ...newOrder, vehicleId: e.target.value })} className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-white focus:outline-none" disabled={!newOrder.customerId} required>
                  <option value="">Selecione o veículo...</option>
                  {vehicles.filter(v => v.customerId === newOrder.customerId).map(v => (<option key={v.id} value={v.id}>{v.brand} {v.model} ({v.plate})</option>))}
                </select>
              </div>
              <div><label className="block text-[10px] text-zinc-400 font-bold uppercase mb-1">Sintomas Relatados</label>
                <textarea placeholder="Ex: Barulho na suspensão ao frear forte." value={newOrder.notes} onChange={(e) => setNewOrder({ ...newOrder, notes: e.target.value })} className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-white focus:outline-none min-h-[80px]" required />
              </div>
              <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 rounded text-sm transition mt-2">Abrir Ordem de Serviço</button>
            </form>
          </div>
        </div>
      )}

      {isAddingAppointment && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl w-full max-w-md p-6 shadow-2xl flex flex-col gap-4">
            <div className="flex justify-between items-center"><h3 className="text-base font-bold text-white">Agendar Horário</h3><button onClick={() => setIsAddingAppointment(false)} className="text-zinc-500 hover:text-zinc-300 font-bold">✕</button></div>
            <form onSubmit={handleAddAppointment} className="flex flex-col gap-3 text-xs">
              <div><label className="block text-[10px] text-zinc-400 font-bold uppercase mb-1">Cliente</label>
                <select value={newApt.customerId} onChange={(e) => setNewApt({ ...newApt, customerId: e.target.value, vehicleId: "" })} className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-white focus:outline-none" required>
                  <option value="">Selecione o cliente...</option>
                  {customers.map(c => (<option key={c.id} value={c.id}>{c.name}</option>))}
                </select>
              </div>
              <div><label className="block text-[10px] text-zinc-400 font-bold uppercase mb-1">Veículo</label>
                <select value={newApt.vehicleId} onChange={(e) => setNewApt({ ...newApt, vehicleId: e.target.value })} className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-white focus:outline-none" disabled={!newApt.customerId} required>
                  <option value="">Selecione o veículo...</option>
                  {vehicles.filter(v => v.customerId === newApt.customerId).map(v => (<option key={v.id} value={v.id}>{v.brand} {v.model} ({v.plate})</option>))}
                </select>
              </div>
              <div><label className="block text-[10px] text-zinc-400 font-bold uppercase mb-1">Data e Horário</label><input type="text" placeholder="Ex: 14/07/2026 às 09:30" value={newApt.scheduledTime} onChange={(e) => setNewApt({ ...newApt, scheduledTime: e.target.value })} className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-white focus:outline-none" required /></div>
              <div><label className="block text-[10px] text-zinc-400 font-bold uppercase mb-1">Descrição</label><input type="text" placeholder="Ex: Troca de óleo rápida" value={newApt.notes} onChange={(e) => setNewApt({ ...newApt, notes: e.target.value })} className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-white focus:outline-none" /></div>
              <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 rounded text-sm transition mt-2">Confirmar Agendamento</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
