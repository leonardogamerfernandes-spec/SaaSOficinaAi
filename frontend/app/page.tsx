"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import type { Customer, Vehicle, ServiceOrder, ServiceItem, DashboardMetrics, Tenant } from "@/lib/api";

import Sidebar from "./components/Sidebar";
import LoginPage from "./components/LoginPage";
import Modal from "./components/Modal";
import ChatPage from "./components/ChatPage";
import AgendaPage from "./components/AgendaPage";
import InspectionChecklist from "./components/InspectionChecklist";
import VehicleHistoryPanel from "./components/VehicleHistoryPanel";
import PartsFinderChat from "./components/PartsFinderChat";
import ReportsPage from "./components/ReportsPage";
import InventoryPage from "./components/InventoryPage";
import RemindersPage from "./components/RemindersPage";
import PlansPage from "./components/PlansPage";
import UpgradeModal from "./components/UpgradeModal";

export default function Home() {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState("dashboard");

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [orders, setOrders] = useState<ServiceOrder[]>([]);

  const [selectedOrder, setSelectedOrder] = useState<ServiceOrder | null>(null);
  const [orderSubTab, setOrderSubTab] = useState<"items" | "inspection" | "history">("items");
  
  const [dashboardMetrics, setDashboardMetrics] = useState<DashboardMetrics | null>(null);

  const [isAddingCustomer, setIsAddingCustomer] = useState(false);
  const [isAddingVehicle, setIsAddingVehicle] = useState(false);
  const [isAddingOrder, setIsAddingOrder] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  
  // Upgrade Modal State
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [pendingUpgradeTab, setPendingUpgradeTab] = useState<string | null>(null);

  const [newCust, setNewCust] = useState({ name: "", email: "", phone: "", cpfCnpj: "", address: "" });
  const [newVeh, setNewVeh] = useState({ customerId: "", plate: "", brand: "", model: "", year: 2020, color: "", vin: "", mileage: 0, engineInfo: "" });
  const [newOrder, setNewOrder] = useState({ customerId: "", vehicleId: "", notes: "" });
  const [newItem, setNewItem] = useState({ description: "", quantity: 1, unitPrice: 0, type: "PART" as "PART" | "LABOR" });

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
      }
    } catch (e) {
      console.error("Failed to fetch data:", e);
    }
  }

  // Refresh plan status in context
  async function refreshPlanStatus() {
    try {
      const res = await api.plans.getStatus();
      if (tenant) {
        const updatedTenant = { ...tenant, plan: res.plan, maxUsers: res.limits.users };
        setTenant(updatedTenant);
        localStorage.setItem("tenant", JSON.stringify(updatedTenant));
      }
      if (pendingUpgradeTab) {
        setActiveTab(pendingUpgradeTab);
        setPendingUpgradeTab(null);
      }
    } catch (err) {
      console.error("Failed to refresh plan status:", err);
    }
  }

  function handleAuthSuccess(newToken: string, newUser: any, newTenant: any) {
    setToken(newToken);
    setUser(newUser);
    setTenant(newTenant);
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

  function handleTabChange(tab: string) {
    // Plan Guard for PRO features
    const isProTab = ["parts-finder", "inventory", "reminders", "reports"].includes(tab);
    if (isProTab && tenant?.plan === "FREE") {
      setPendingUpgradeTab(tab);
      setIsUpgradeModalOpen(true);
      return;
    }
    
    setActiveTab(tab);
    setSelectedOrder(null);
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
      const created = await api.vehicles.create({
        ...newVeh,
        year: Number(newVeh.year),
        mileage: newVeh.mileage ? Number(newVeh.mileage) : undefined,
      });
      setVehicles(prev => [...prev, created]);
      setIsAddingVehicle(false);
      setNewVeh({ customerId: "", plate: "", brand: "", model: "", year: 2020, color: "", vin: "", mileage: 0, engineInfo: "" });
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
      setSelectedOrder(created);
      setOrderSubTab("items");
    } catch (err: any) {
      alert(err.message);
    }
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

  const statusBadge = (status: string) => {
    const map: Record<string, { text: string; cls: string }> = {
      COMPLETED: { text: "Concluído", cls: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/15" },
      IN_PROGRESS: { text: "Em Execução", cls: "bg-amber-500/10 text-amber-400 border border-amber-500/15" },
      DRAFT_BUDGET: { text: "Orçamento", cls: "bg-indigo-500/10 text-indigo-400 border border-indigo-500/15" },
      BUDGET_APPROVED: { text: "Aprovado", cls: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/15" },
      CANCELLED: { text: "Cancelado", cls: "bg-red-500/10 text-red-400 border border-red-500/15" },
    };
    const s = map[status] || map.DRAFT_BUDGET;
    return <span className={`px-2 py-0.5 rounded text-xs font-semibold inline-block ${s.cls}`}>{s.text}</span>;
  };

  const tabTitle: Record<string, string> = {
    dashboard: "Dashboard",
    orders: "Ordens de Serviço e Orçamentos",
    clients: "Clientes",
    vehicles: "Veículos",
    agenda: "Agenda da Oficina",
    chat: "Assistente de IA",
    "parts-finder": "Buscador Inteligente de Peças (IA)",
    inventory: "Controle de Estoque",
    reminders: "Lembretes Automáticos",
    reports: "Relatórios Financeiros",
    plans: "Minha Assinatura",
  };

  if (loading) return <div className="flex min-h-screen bg-zinc-950 items-center justify-center text-zinc-400">Carregando...</div>;

  if (!token) return <LoginPage onAuthSuccess={handleAuthSuccess} />;

  return (
    <div className="flex min-h-screen bg-zinc-950 font-sans text-zinc-100 antialiased selection:bg-indigo-500 selection:text-white">
      <Sidebar user={user} tenant={tenant} activeTab={activeTab} onTabChange={handleTabChange} onLogout={handleLogout} />

      <main className="flex-1 overflow-y-auto px-10 py-8">
        <header className="flex justify-between items-center mb-8 pb-5 border-b border-zinc-800">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">{tabTitle[activeTab] || "Dashboard"}</h1>
            <p className="text-sm text-zinc-500 mt-1">Gerenciamento completo integrado com Inteligência Artificial.</p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setIsAddingOrder(true)} className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-semibold transition shadow-md shadow-indigo-600/10 flex items-center gap-2">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
              Nova OS
            </button>
          </div>
        </header>

        {/* DASHBOARD */}
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
                <button onClick={() => handleTabChange("agenda")} className="p-4 rounded-lg bg-zinc-800/40 border border-zinc-700 hover:border-indigo-500 transition text-left flex flex-col gap-2 group">
                  <span className="h-8 w-8 rounded bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold">A</span>
                  <span className="text-sm font-semibold group-hover:text-indigo-400 transition">Agendar Serviço</span>
                  <span className="text-xs text-zinc-500">Insira um agendamento na grade da oficina.</span>
                </button>
                <button onClick={() => handleTabChange("chat")} className="p-4 rounded-lg bg-zinc-800/40 border border-zinc-700 hover:border-indigo-500 transition text-left flex flex-col gap-2 group">
                  <span className="h-8 w-8 rounded bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold">IA</span>
                  <span className="text-sm font-semibold group-hover:text-indigo-400 transition">Chat de Ajuda da IA</span>
                  <span className="text-xs text-zinc-500">Tire dúvidas de torque, códigos de falha ou óleo.</span>
                </button>
              </div>
            </div>

            <div className="border border-zinc-800 rounded-xl bg-zinc-900/10 overflow-hidden">
              <div className="px-6 py-4 border-b border-zinc-800 flex justify-between items-center">
                <h2 className="text-base font-bold">Ordens de Serviço Recentes</h2>
                <button onClick={() => handleTabChange("orders")} className="text-indigo-400 hover:text-indigo-300 text-xs font-semibold">Ver todas →</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-zinc-300">
                  <thead className="bg-zinc-900/60 text-zinc-500 text-xs font-semibold uppercase tracking-wider">
                    <tr><th className="px-6 py-3">ID OS</th><th className="px-6 py-3">Cliente</th><th className="px-6 py-3">Veículo</th><th className="px-6 py-3">Status</th><th className="px-6 py-3">Total</th><th className="px-6 py-3 text-right">Ações</th></tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800">
                    {orders.slice(0, 5).map(o => (
                      <tr key={o.id} className="hover:bg-zinc-800/20 transition-colors">
                        <td className="px-6 py-4 font-mono font-medium text-white">{o.id?.slice(0, 8)}</td>
                        <td className="px-6 py-4">{getCustomerName(o.customerId)}</td>
                        <td className="px-6 py-4">{getVehicleModel(o.vehicleId)}</td>
                        <td className="px-6 py-4">{statusBadge(o.status)}</td>
                        <td className="px-6 py-4 font-semibold text-white">R$ {o.totalPrice.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</td>
                        <td className="px-6 py-4 text-right">
                          <button onClick={() => { setActiveTab("orders"); setSelectedOrder(o); setOrderSubTab("items"); }} className="bg-zinc-800 hover:bg-zinc-700 px-3 py-1 rounded text-xs font-semibold border border-zinc-700 transition">Visualizar</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ORDERS LIST */}
        {activeTab === "orders" && !selectedOrder && (
          <div className="border border-zinc-800 rounded-xl bg-zinc-900/10 overflow-hidden">
            <div className="px-6 py-4 border-b border-zinc-800 bg-zinc-900/40"><h2 className="text-base font-bold">Listagem Geral de Ordens e Orçamentos</h2></div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-zinc-300">
                <thead className="bg-zinc-900/60 text-zinc-500 text-xs font-semibold uppercase tracking-wider">
                  <tr><th className="px-6 py-3">Código</th><th className="px-6 py-3">Abertura</th><th className="px-6 py-3">Cliente</th><th className="px-6 py-3">Veículo</th><th className="px-6 py-3">Status</th><th className="px-6 py-3">Valor Total</th><th className="px-6 py-3 text-right">Ação</th></tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {orders.map(o => (
                    <tr key={o.id} className="hover:bg-zinc-800/20 transition-colors">
                      <td className="px-6 py-4 font-mono font-medium text-white">{o.id?.slice(0, 8)}</td>
                      <td className="px-6 py-4 text-xs text-zinc-500">{o.createdAt ? new Date(o.createdAt).toLocaleDateString("pt-BR") : "---"}</td>
                      <td className="px-6 py-4">{getCustomerName(o.customerId)}</td>
                      <td className="px-6 py-4">{getVehicleModel(o.vehicleId)} ({getVehiclePlate(o.vehicleId)})</td>
                      <td className="px-6 py-4">{statusBadge(o.status)}</td>
                      <td className="px-6 py-4 font-semibold text-white">R$ {o.totalPrice.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</td>
                      <td className="px-6 py-4 text-right">
                        <button onClick={() => { setSelectedOrder(o); setOrderSubTab("items"); }} className="bg-zinc-800 hover:bg-zinc-700 px-3 py-1 rounded text-xs font-semibold border border-zinc-700 transition">Gerenciar</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ORDER DETAIL (INCLUDES CHECKLIST AND HISTORY TABS) */}
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
                    <select value={selectedOrder.status} onChange={(e) => handleStatusChange(e.target.value)} className="bg-zinc-800 border border-zinc-700 rounded-md text-xs px-2.5 py-1 text-white focus:outline-none focus:border-indigo-500 font-semibold">
                      <option value="DRAFT_BUDGET">Orçamento Inicial</option>
                      <option value="BUDGET_APPROVED">Orçamento Aprovado</option>
                      <option value="IN_PROGRESS">Em Execução</option>
                      <option value="COMPLETED">Serviço Concluído</option>
                      <option value="CANCELLED">Cancelado</option>
                    </select>
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

                {/* Sub Tab Navigation inside OS Detail */}
                <div className="flex gap-2 border-b border-zinc-800 pb-px">
                  <button onClick={() => setOrderSubTab("items")} className={`px-4 py-2 border-b-2 text-xs font-bold uppercase tracking-wider transition ${orderSubTab === "items" ? "border-indigo-600 text-white" : "border-transparent text-zinc-500 hover:text-zinc-300"}`}>Itens do Orçamento</button>
                  <button onClick={() => setOrderSubTab("inspection")} className={`px-4 py-2 border-b-2 text-xs font-bold uppercase tracking-wider transition ${orderSubTab === "inspection" ? "border-indigo-600 text-white" : "border-transparent text-zinc-500 hover:text-zinc-300"}`}>Checklist Entrada</button>
                  <button onClick={() => setOrderSubTab("history")} className={`px-4 py-2 border-b-2 text-xs font-bold uppercase tracking-wider transition ${orderSubTab === "history" ? "border-indigo-600 text-white" : "border-transparent text-zinc-500 hover:text-zinc-300"}`}>Histórico Veículo</button>
                </div>

                {orderSubTab === "items" && (
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
                        <thead><tr className="text-zinc-500 font-bold border-b border-zinc-800 uppercase tracking-wide"><th className="py-2">Descrição</th><th className="py-2">Tipo</th><th className="py-2 text-center">Qtd</th><th className="py-2 text-right">Unitário</th><th className="py-2 text-right">Subtotal</th><th className="py-2 text-right">Ação</th></tr></thead>
                        <tbody className="divide-y divide-zinc-800/50">
                          {!selectedOrder.items?.length ? (
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
                )}

                {orderSubTab === "inspection" && (
                  <InspectionChecklist serviceOrderId={selectedOrder.id} />
                )}

                {orderSubTab === "history" && (
                  <div className="p-6 rounded-xl border border-zinc-800 bg-zinc-900/30">
                    <VehicleHistoryPanel vehicleId={selectedOrder.vehicleId} />
                  </div>
                )}
              </div>

              {/* AI PANEL */}
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
                      <div className="text-xs text-zinc-300 whitespace-pre-wrap leading-5">{selectedOrder.aiDiagnostic}</div>
                    ) : (
                      <span className="text-xs text-zinc-600 italic text-center py-8">Nenhum diagnóstico gerado ainda. Clique no botão acima para acionar a IA.</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* CLIENTS */}
        {activeTab === "clients" && (
          <div className="flex flex-col gap-6">
            <div className="flex justify-end">
              <button onClick={() => setIsAddingCustomer(true)} className="bg-indigo-600 hover:bg-indigo-500 text-white px-3.5 py-2 rounded-lg text-xs font-bold transition shadow">Cadastrar Cliente</button>
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

        {/* VEHICLES */}
        {activeTab === "vehicles" && (
          <div className="flex flex-col gap-6">
            <div className="flex justify-end">
              <button onClick={() => setIsAddingVehicle(true)} className="bg-indigo-600 hover:bg-indigo-500 text-white px-3.5 py-2 rounded-lg text-xs font-bold transition shadow">Cadastrar Veículo</button>
            </div>
            <div className="border border-zinc-800 rounded-xl bg-zinc-900/10 overflow-hidden">
              <table className="w-full text-left text-sm text-zinc-300">
                <thead className="bg-zinc-900/60 text-zinc-500 text-xs font-semibold uppercase tracking-wider"><tr><th className="px-6 py-3">Placa</th><th className="px-6 py-3">Modelo</th><th className="px-6 py-3">Marca</th><th className="px-6 py-3">Ano</th><th className="px-6 py-3">Cor</th><th className="px-6 py-3">Quilometragem</th><th className="px-6 py-3">Proprietário</th></tr></thead>
                <tbody className="divide-y divide-zinc-800">
                  {vehicles.map(v => (
                    <tr key={v.id} className="hover:bg-zinc-800/10 transition-colors">
                      <td className="px-6 py-4 font-mono font-bold text-indigo-400">{v.plate}</td>
                      <td className="px-6 py-4 text-white font-medium">{v.model}</td>
                      <td className="px-6 py-4">{v.brand}</td>
                      <td className="px-6 py-4">{v.year}</td>
                      <td className="px-6 py-4">{v.color || "---"}</td>
                      <td className="px-6 py-4 font-mono">{v.mileage ? `${v.mileage.toLocaleString()} Km` : "---"}</td>
                      <td className="px-6 py-4 text-zinc-400">{getCustomerName(v.customerId)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* AGENDA */}
        {activeTab === "agenda" && <AgendaPage customers={customers} vehicles={vehicles} />}

        {/* CHAT */}
        {activeTab === "chat" && <ChatPage />}

        {/* AI PARTS FINDER (PRO) */}
        {activeTab === "parts-finder" && <PartsFinderChat />}

        {/* INVENTORY (PRO) */}
        {activeTab === "inventory" && <InventoryPage />}

        {/* REMINDERS (PRO) */}
        {activeTab === "reminders" && <RemindersPage customers={customers} vehicles={vehicles} />}

        {/* REPORTS (PRO) */}
        {activeTab === "reports" && <ReportsPage />}

        {/* PLANS SIGNATURES */}
        {activeTab === "plans" && <PlansPage onPlanUpdated={refreshPlanStatus} />}
      </main>

      {/* MODALS */}
      <Modal title="Cadastrar Novo Cliente" isOpen={isAddingCustomer} onClose={() => setIsAddingCustomer(false)}>
        <form onSubmit={handleAddCustomer} className="flex flex-col gap-3 text-xs">
          <div><label className="block text-[10px] text-zinc-400 font-bold uppercase mb-1">Nome Completo</label><input type="text" placeholder="Ex: João da Silva" value={newCust.name} onChange={(e) => setNewCust({ ...newCust, name: e.target.value })} className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-white focus:outline-none focus:border-indigo-500" required /></div>
          <div><label className="block text-[10px] text-zinc-400 font-bold uppercase mb-1">Telefone Celular</label><input type="text" placeholder="Ex: (11) 99999-9999" value={newCust.phone} onChange={(e) => setNewCust({ ...newCust, phone: e.target.value })} className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-white focus:outline-none" required /></div>
          <div><label className="block text-[10px] text-zinc-400 font-bold uppercase mb-1">E-mail</label><input type="email" placeholder="Ex: joao@email.com" value={newCust.email} onChange={(e) => setNewCust({ ...newCust, email: e.target.value })} className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-white focus:outline-none" /></div>
          <div><label className="block text-[10px] text-zinc-400 font-bold uppercase mb-1">CPF ou CNPJ</label><input type="text" placeholder="Ex: 123.456.789-00" value={newCust.cpfCnpj} onChange={(e) => setNewCust({ ...newCust, cpfCnpj: e.target.value })} className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-white focus:outline-none" /></div>
          <div><label className="block text-[10px] text-zinc-400 font-bold uppercase mb-1">Endereço</label><input type="text" placeholder="Ex: Rua das Flores, 45" value={newCust.address} onChange={(e) => setNewCust({ ...newCust, address: e.target.value })} className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-white focus:outline-none" /></div>
          <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 rounded text-sm transition mt-2">Confirmar Cadastro</button>
        </form>
      </Modal>

      <Modal title="Cadastrar Novo Veículo" isOpen={isAddingVehicle} onClose={() => setIsAddingVehicle(false)}>
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
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-[10px] text-zinc-400 font-bold uppercase mb-1">Quilometragem Inicial</label><input type="number" value={newVeh.mileage} onChange={(e) => setNewVeh({ ...newVeh, mileage: Number(e.target.value) })} className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-white focus:outline-none" required /></div>
            <div><label className="block text-[10px] text-zinc-400 font-bold uppercase mb-1">Motor (Configuração)</label><input type="text" placeholder="Ex: 1.0 12V Turbo" value={newVeh.engineInfo} onChange={(e) => setNewVeh({ ...newVeh, engineInfo: e.target.value })} className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-white focus:outline-none" /></div>
          </div>
          <div><label className="block text-[10px] text-zinc-400 font-bold uppercase mb-1">Código do Chassi (VIN)</label><input type="text" placeholder="Código de 17 dígitos" value={newVeh.vin} onChange={(e) => setNewVeh({ ...newVeh, vin: e.target.value })} className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-white focus:outline-none" /></div>
          <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 rounded text-sm transition mt-2">Confirmar Cadastro</button>
        </form>
      </Modal>

      <Modal title="Criar Ordem de Serviço / Orçamento" isOpen={isAddingOrder} onClose={() => setIsAddingOrder(false)}>
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
      </Modal>

      {/* Gated Upgrade Modal */}
      <UpgradeModal
        isOpen={isUpgradeModalOpen}
        onClose={() => { setIsUpgradeModalOpen(false); setPendingUpgradeTab(null); }}
        requiredPlan="PRO"
        onUpgradeSuccess={refreshPlanStatus}
      />
    </div>
  );
}
