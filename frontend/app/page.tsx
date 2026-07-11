"use client";

import { useState } from "react";
import Image from "next/image";

// Types
interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  cpfCnpj: string;
  address: string;
}

interface Vehicle {
  id: string;
  customerId: string;
  plate: string;
  brand: string;
  model: string;
  year: number;
  color: string;
}

interface ServiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  type: "PART" | "LABOR";
}

interface ServiceOrder {
  id: string;
  customerId: string;
  vehicleId: string;
  status: "DRAFT_BUDGET" | "BUDGET_APPROVED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  discount: number;
  totalPrice: number;
  notes: string;
  aiDiagnostic?: string;
  createdAt: string;
  items: ServiceItem[];
}

interface Appointment {
  id: string;
  customerId: string;
  vehicleId: string;
  scheduledTime: string;
  notes: string;
  status: "SCHEDULED" | "CHECKED_IN" | "CANCELLED";
}

interface ChatMessage {
  id: string;
  role: "user" | "model";
  content: string;
}

export default function Home() {
  // Navigation
  const [activeTab, setActiveTab] = useState<"dashboard" | "clients" | "vehicles" | "orders" | "agenda" | "chat">("dashboard");

  // Mock State seeded from architecture design
  const [customers, setCustomers] = useState<Customer[]>([
    {
      id: "cust-1",
      name: "Leonardo Lima",
      email: "leonardo@email.com",
      phone: "(11) 99999-8888",
      cpfCnpj: "123.456.789-00",
      address: "Av. Paulista, 1000 - São Paulo, SP",
    },
    {
      id: "cust-2",
      name: "Mariana Souza",
      email: "mariana@email.com",
      phone: "(11) 97777-6666",
      cpfCnpj: "987.654.321-11",
      address: "Rua Augusta, 500 - São Paulo, SP",
    },
  ]);

  const [vehicles, setVehicles] = useState<Vehicle[]>([
    {
      id: "veh-1",
      customerId: "cust-1",
      plate: "BRA2E19",
      brand: "Volkswagen",
      model: "Gol 1.6 MSI",
      year: 2021,
      color: "Branco",
    },
    {
      id: "veh-2",
      customerId: "cust-2",
      plate: "OFF8I99",
      brand: "Chevrolet",
      model: "Onix 1.0 Turbo",
      year: 2022,
      color: "Preto",
    },
  ]);

  const [orders, setOrders] = useState<ServiceOrder[]>([
    {
      id: "os-1",
      customerId: "cust-1",
      vehicleId: "veh-1",
      status: "COMPLETED",
      discount: 0,
      totalPrice: 480.0,
      notes: "Barulho ao frear e trocar óleo do motor.",
      createdAt: "11/07/2026",
      aiDiagnostic: `### Diagnóstico Técnico Provável (IA OficinaAI)
O ruído ao frear indica desgaste das pastilhas de freio dianteiras.

### Lista de Peças e Mão de Obra Recomendadas
* Pastilhas de freio dianteiras (Par)
* Fluido de freio DOT 4
* Óleo 5W30 Sintético (4L)
* Filtro de óleo`,
      items: [
        { id: "item-1", description: "Pastilhas de freio dianteiras (Cobreq)", quantity: 1, unitPrice: 120.0, totalPrice: 120.0, type: "PART" },
        { id: "item-2", description: "Óleo 5W30 Sintético Shell Helix (Litro)", quantity: 4, unitPrice: 45.0, totalPrice: 180.0, type: "PART" },
        { id: "item-3", description: "Filtro de óleo Fram", quantity: 1, unitPrice: 30.0, totalPrice: 30.0, type: "PART" },
        { id: "item-4", description: "Mão de obra troca de óleo e pastilhas", quantity: 1, unitPrice: 150.0, totalPrice: 150.0, type: "LABOR" },
      ],
    },
    {
      id: "os-2",
      customerId: "cust-2",
      vehicleId: "veh-2",
      status: "IN_PROGRESS",
      discount: 0,
      totalPrice: 350.0,
      notes: "Barulho seco na suspensão dianteira ao passar em lombadas.",
      createdAt: "10/07/2026",
      aiDiagnostic: `### Diagnóstico Técnico Provável (IA OficinaAI)
Barulho do tipo "toc-toc" seco na suspensão indica provável desgaste das buchas das bandejas dianteiras ou das bieletas estabilizadoras.

### Lista de Peças e Mão de Obra Recomendadas
* Par de bieletas dianteiras
* Buchas da bandeja (Par)
* Mão de obra substituição e alinhamento`,
      items: [
        { id: "item-5", description: "Bieletas dianteiras Axios (Par)", quantity: 1, unitPrice: 110.0, totalPrice: 110.0, type: "PART" },
        { id: "item-6", description: "Mão de obra suspensão e alinhamento", quantity: 1, unitPrice: 240.0, totalPrice: 240.0, type: "LABOR" },
      ],
    },
    {
      id: "os-3",
      customerId: "cust-1",
      vehicleId: "veh-1",
      status: "DRAFT_BUDGET",
      discount: 0,
      totalPrice: 0.0,
      notes: "Motor oscilando em marcha lenta e luz de injeção piscando.",
      createdAt: "11/07/2026",
      items: [],
    },
  ]);

  const [appointments, setAppointments] = useState<Appointment[]>([
    {
      id: "apt-1",
      customerId: "cust-1",
      vehicleId: "veh-1",
      scheduledTime: "13/07/2026 às 14:00",
      notes: "Revisão periódica de 60.000 km",
      status: "SCHEDULED",
    },
  ]);

  // Chat Assistant State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: "m-1",
      role: "model",
      content: `Olá! Sou o assistente de IA da **OficinaAI**. 

Posso te ajudar com especificações de torque de cabeçote, tabelas de lubrificantes, diagnósticos de injeção eletrônica e barulhos mecânicos. 

**Como posso auxiliar no diagnóstico técnico ou reparo que você está realizando agora?**`,
    },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  // Modals / Selected Details
  const [selectedOrder, setSelectedOrder] = useState<ServiceOrder | null>(null);
  const [isAddingCustomer, setIsAddingCustomer] = useState(false);
  const [isAddingVehicle, setIsAddingVehicle] = useState(false);
  const [isAddingOrder, setIsAddingOrder] = useState(false);
  const [isAddingAppointment, setIsAddingAppointment] = useState(false);

  // Forms State
  const [newCust, setNewCust] = useState({ name: "", email: "", phone: "", cpfCnpj: "", address: "" });
  const [newVeh, setNewVeh] = useState({ customerId: "", plate: "", brand: "", model: "", year: 2020, color: "" });
  const [newOrder, setNewOrder] = useState({ customerId: "", vehicleId: "", notes: "" });
  const [newApt, setNewApt] = useState({ customerId: "", vehicleId: "", scheduledTime: "", notes: "" });
  const [newItem, setNewItem] = useState({ description: "", quantity: 1, unitPrice: 0, type: "PART" as "PART" | "LABOR" });

  // AI Generation Loading State
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  // Computed Metrics
  const activeOrdersCount = orders.filter(o => o.status === "IN_PROGRESS").length;
  const pendingBudgetsCount = orders.filter(o => o.status === "DRAFT_BUDGET").length;
  const totalRevenue = orders
    .filter(o => ["COMPLETED", "BUDGET_APPROVED", "IN_PROGRESS"].includes(o.status))
    .reduce((sum, o) => sum + o.totalPrice, 0);

  // Handler: Add Customer
  const handleAddCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCust.name || !newCust.phone) return;
    const added: Customer = {
      id: "cust-" + (customers.length + 1),
      ...newCust,
    };
    setCustomers([...customers, added]);
    setIsAddingCustomer(false);
    setNewCust({ name: "", email: "", phone: "", cpfCnpj: "", address: "" });
  };

  // Handler: Add Vehicle
  const handleAddVehicle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVeh.customerId || !newVeh.plate || !newVeh.brand || !newVeh.model) return;
    const added: Vehicle = {
      id: "veh-" + (vehicles.length + 1),
      customerId: newVeh.customerId,
      plate: newVeh.plate.toUpperCase(),
      brand: newVeh.brand,
      model: newVeh.model,
      year: Number(newVeh.year),
      color: newVeh.color,
    };
    setVehicles([...vehicles, added]);
    setIsAddingVehicle(false);
    setNewVeh({ customerId: "", plate: "", brand: "", model: "", year: 2020, color: "" });
  };

  // Handler: Add Order
  const handleAddOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrder.customerId || !newOrder.vehicleId) return;
    const added: ServiceOrder = {
      id: "os-" + (orders.length + 1),
      customerId: newOrder.customerId,
      vehicleId: newOrder.vehicleId,
      status: "DRAFT_BUDGET",
      discount: 0,
      totalPrice: 0,
      notes: newOrder.notes,
      createdAt: new Date().toLocaleDateString("pt-BR"),
      items: [],
    };
    setOrders([added, ...orders]);
    setIsAddingOrder(false);
    setNewOrder({ customerId: "", vehicleId: "", notes: "" });
  };

  // Handler: Add Appointment
  const handleAddAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newApt.customerId || !newApt.vehicleId || !newApt.scheduledTime) return;
    const added: Appointment = {
      id: "apt-" + (appointments.length + 1),
      customerId: newApt.customerId,
      vehicleId: newApt.vehicleId,
      scheduledTime: newApt.scheduledTime,
      notes: newApt.notes,
      status: "SCHEDULED",
    };
    setAppointments([...appointments, added]);
    setIsAddingAppointment(false);
    setNewApt({ customerId: "", vehicleId: "", scheduledTime: "", notes: "" });
  };

  // Handler: Add Item to Order
  const handleAddItemToOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder || !newItem.description || newItem.unitPrice <= 0) return;

    const addedItem: ServiceItem = {
      id: "item-" + Date.now(),
      description: newItem.description,
      quantity: Number(newItem.quantity),
      unitPrice: Number(newItem.unitPrice),
      totalPrice: Number(newItem.quantity) * Number(newItem.unitPrice),
      type: newItem.type,
    };

    const updatedItems = [...selectedOrder.items, addedItem];
    const subtotal = updatedItems.reduce((sum, item) => sum + item.totalPrice, 0);
    const total = Math.max(0, subtotal - selectedOrder.discount);

    const updatedOrder: ServiceOrder = {
      ...selectedOrder,
      items: updatedItems,
      totalPrice: total,
    };

    // Update list
    setOrders(orders.map(o => o.id === selectedOrder.id ? updatedOrder : o));
    setSelectedOrder(updatedOrder);
    setNewItem({ description: "", quantity: 1, unitPrice: 0, type: "PART" });
  };

  // Handler: Remove Item
  const handleRemoveItem = (itemId: string) => {
    if (!selectedOrder) return;
    const updatedItems = selectedOrder.items.filter(i => i.id !== itemId);
    const subtotal = updatedItems.reduce((sum, item) => sum + item.totalPrice, 0);
    const total = Math.max(0, subtotal - selectedOrder.discount);

    const updatedOrder: ServiceOrder = {
      ...selectedOrder,
      items: updatedItems,
      totalPrice: total,
    };

    setOrders(orders.map(o => o.id === selectedOrder.id ? updatedOrder : o));
    setSelectedOrder(updatedOrder);
  };

  // Handler: Change Status
  const handleStatusChange = (status: ServiceOrder["status"]) => {
    if (!selectedOrder) return;
    const updatedOrder: ServiceOrder = {
      ...selectedOrder,
      status,
    };
    setOrders(orders.map(o => o.id === selectedOrder.id ? updatedOrder : o));
    setSelectedOrder(updatedOrder);
  };

  // Simulate AI diagnostic generation
  const handleAIGenerateDiagnostic = () => {
    if (!selectedOrder) return;
    setIsGeneratingAI(true);

    setTimeout(() => {
      const vehicle = vehicles.find(v => v.id === selectedOrder.vehicleId);
      const vehicleInfo = vehicle ? `${vehicle.brand} ${vehicle.model} (${vehicle.year})` : "Veículo";
      const notes = selectedOrder.notes;

      let diagText = "";
      if (notes.toLowerCase().includes("freio") || notes.toLowerCase().includes("barulho ao frear")) {
        diagText = `### Diagnóstico Técnico Provável (IA OficinaAI)
O ruído metálico ao frear indica desgaste acentuado das pastilhas de freio dianteiras no veículo **${vehicleInfo}**. O desgaste já atingiu o indicador metálico de limite ou está em atrito direto contra o disco de freio, gerando sulcos no disco.

### Lista de Peças e Mão de Obra Recomendadas
*   **Jogo de Pastilhas de Freio Dianteiras** (Cobreq/Fras-le) - Peça
*   **Par de Discos de Freio Dianteiros** (Fremax) - Peça
*   **Fluido de Freio DOT 4** (Bosch) - Insumo
*   **Mão de Obra para Troca e Sangria** - Serviço`;
      } else if (notes.toLowerCase().includes("suspensão") || notes.toLowerCase().includes("buraco") || notes.toLowerCase().includes("barulho")) {
        diagText = `### Diagnóstico Técnico Provável (IA OficinaAI)
O barulho seco ("toc-toc") ao passar em lombadas ou vias esburacadas no veículo **${vehicleInfo}** é indicativo de fadiga das buchas das bandejas de suspensão ou desgaste das bieletas dianteiras. Recomenda-se também verificar a folga nos coxins dos amortecedores superiores.

### Lista de Peças e Mão de Obra Recomendadas
*   **Par de Bieletas Estabilizadoras Dianteiras** (Axios) - Peça
*   **Bucha da Bandeja Dianteira** (Par) - Peça
*   **Mão de Obra para Substituição e Geometria 3D** - Serviço`;
      } else {
        diagText = `### Diagnóstico Técnico Provável (IA OficinaAI)
Com base nas observações fornecidas, recomenda-se passar o scanner automotivo (OBD2) para verificar códigos de falha (DTC) gravados na memória da ECU do veículo **${vehicleInfo}**. Possíveis problemas na marcha lenta ou injeção podem ser causados por sujeira no corpo de borboleta (TBI) ou velas gastas.

### Lista de Peças e Mão de Obra Recomendadas
*   **Diagnóstico com Scanner OBD2** - Serviço Técnico
*   **Descarbonizante de Motor (Car 80)** - Insumo
*   **Jogo de Velas de Ignição** - Peça`;
      }

      const updatedOrder: ServiceOrder = {
        ...selectedOrder,
        aiDiagnostic: diagText,
      };

      setOrders(orders.map(o => o.id === selectedOrder.id ? updatedOrder : o));
      setSelectedOrder(updatedOrder);
      setIsGeneratingAI(false);
    }, 1500);
  };

  // Handler: Send Message in AI Chat
  const handleSendChatMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg: ChatMessage = {
      id: "msg-" + Date.now(),
      role: "user",
      content: chatInput,
    };

    setChatMessages(prev => [...prev, userMsg]);
    const currentInput = chatInput.toLowerCase();
    setChatInput("");
    setIsTyping(true);

    setTimeout(() => {
      let response = "";
      if (currentInput.includes("torque") || currentInput.includes("cabeçote") || currentInput.includes("aperto")) {
        response = `### Especificações de Aperto de Cabeçote (Motor VW EA111 1.6)

Aqui estão as especificações de torque para a tampa e cabeçote recomendados para este motor:
1. **1ª Etapa:** Aperte todos os parafusos com **30 Nm** seguindo a sequência espiral (do centro para fora).
2. **2ª Etapa:** Aperte com **50 Nm**.
3. **3ª Etapa:** Aplique aperto angular de **90°**.
4. **4ª Etapa:** Aplique aperto angular adicional de **90°**.

> [!TIP]
> Substitua sempre os parafusos do cabeçote por novos e limpe as roscas no bloco antes de iniciar o procedimento.`;
      } else if (currentInput.includes("oscilando") || currentInput.includes("marcha lenta") || currentInput.includes("falhando")) {
        response = `### Roteiro de Teste para Marcha Lenta Oscilando

1. **Limpeza do TBI (Corpo de Borboletas):** Depósitos de carvão bloqueiam a fresta mínima de ar. Limpe com descarbonizante e efetue o aprendizado de borboleta via scanner.
2. **Entradas de Ar Falsa:** Verifique a integridade das mangueiras do servo-freio (hidrovácuo) e a vedação do coletor.
3. **Sensor de Temperatura da Água (ECT):** Se estiver mandando sinal frio incorreto, o motor opera afogado.
4. **Sensor MAP:** Monitore o sinal em marcha lenta; deve ficar próximo a 300-400 mbar em motores aspirados saudáveis.`;
      } else if (currentInput.includes("óleo") || currentInput.includes("lubrificante") || currentInput.includes("filtro")) {
        response = `### Viscosidades e Filtros Recomendados

*   **Chevrolet Onix 1.0 Turbo:** Óleo **5W30 Sintético** (especificação dexos1 Gen 2/3). Capacidade: 3,75 litros com filtro.
*   **VW Gol 1.6 MSI:** Óleo **5W40 Sintético** (norma VW 508.88 / 502.00). Capacidade: 4,0 litros com filtro.

> [!WARNING]
> Certifique-se de substituir o filtro de óleo a cada troca para evitar contaminação do lubrificante novo e entupimento de canais internos de lubrificação da turbina.`;
      } else {
        response = `Entendi a sua dúvida técnica. Para melhor lhe ajudar, poderia fornecer mais informações sobre o veículo (marca, modelo, motor) e quais são os códigos de falha (DTC) apontados no scanner automotivo?`;
      }

      const aiMsg: ChatMessage = {
        id: "msg-" + (Date.now() + 1),
        role: "model",
        content: response,
      };

      setChatMessages(prev => [...prev, aiMsg]);
      setIsTyping(false);
    }, 1200);
  };

  // Helper resolvers
  const getCustomerName = (id: string) => customers.find(c => c.id === id)?.name || "Cliente desconhecido";
  const getVehiclePlate = (id: string) => vehicles.find(v => v.id === id)?.plate || "---";
  const getVehicleModel = (id: string) => {
    const v = vehicles.find(veh => veh.id === id);
    return v ? `${v.brand} ${v.model}` : "Veículo desconhecido";
  };

  return (
    <div className="flex min-h-screen bg-zinc-950 font-sans text-zinc-100 antialiased selection:bg-indigo-500 selection:text-white">
      {/* Sidebar Navigation */}
      <aside className="w-64 flex-shrink-0 border-r border-zinc-800 bg-zinc-900/50 backdrop-blur-md px-6 py-8 flex flex-col justify-between">
        <div className="flex flex-col gap-8">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-600 flex items-center justify-center font-bold text-lg text-white shadow-lg shadow-indigo-500/20">
              O
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-indigo-200 to-white bg-clip-text text-transparent">OficinaAI</span>
              <span className="block text-xs text-zinc-500 font-semibold tracking-wider uppercase">SaaS Mecânica</span>
            </div>
          </div>

          {/* Menu Links */}
          <nav className="flex flex-col gap-1.5">
            {[
              { id: "dashboard", label: "Dashboard", icon: <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zM14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z" /></svg> },
              { id: "orders", label: "Ordens & Orçamentos", icon: <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg> },
              { id: "clients", label: "Clientes", icon: <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg> },
              { id: "vehicles", label: "Veículos", icon: <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10M21 16v-4a1 1 0 00-.3-.7l-3-3a1 1 0 00-.7-.3H13m8 8h-8" /></svg> },
              { id: "agenda", label: "Agenda de Serviços", icon: <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg> },
              { id: "chat", label: "Assistente de IA", icon: <svg className="h-5 w-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg> },
            ].map(item => (
              <button
                key={item.id}
                onClick={() => { setActiveTab(item.id as any); setSelectedOrder(null); }}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  activeTab === item.id
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10 font-semibold"
                    : "text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-200"
                }`}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tenant Profile Footer */}
        <div className="border-t border-zinc-800 pt-6">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-zinc-800 flex items-center justify-center font-bold text-sm border border-zinc-700">
              ZS
            </div>
            <div>
              <span className="block text-sm font-semibold">Zeca Silva</span>
              <span className="block text-xs text-zinc-500">Oficina do Zeca</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto px-10 py-8">
        {/* Header bar */}
        <header className="flex justify-between items-center mb-8 pb-5 border-b border-zinc-800">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white capitalize">
              {activeTab === "orders" ? "Ordens de Serviço e Orçamentos" : activeTab === "agenda" ? "Agenda da Oficina" : activeTab}
            </h1>
            <p className="text-sm text-zinc-500 mt-1">Gerenciamento completo integrado com Inteligência Artificial.</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setIsAddingOrder(true)}
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-semibold transition shadow-md shadow-indigo-600/10 flex items-center gap-2"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
              Nova OS
            </button>
          </div>
        </header>

        {/* Dynamic Tab Render */}
        {activeTab === "dashboard" && (
          <div className="flex flex-col gap-8">
            {/* Metric Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                { label: "Faturamento Acumulado", val: `R$ ${totalRevenue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`, color: "border-emerald-500/20 bg-emerald-500/5 text-emerald-400" },
                { label: "Ordens em Andamento", val: activeOrdersCount, color: "border-amber-500/20 bg-amber-500/5 text-amber-400" },
                { label: "Orçamentos Pendentes", val: pendingBudgetsCount, color: "border-indigo-500/20 bg-indigo-500/5 text-indigo-400" },
                { label: "Total de Clientes", val: customers.length, color: "border-zinc-800 bg-zinc-900/40 text-zinc-200" },
              ].map((m, idx) => (
                <div key={idx} className={`p-6 rounded-xl border ${m.color} flex flex-col gap-2`}>
                  <span className="text-xs text-zinc-500 font-bold uppercase tracking-wider">{m.label}</span>
                  <span className="text-3xl font-extrabold tracking-tight">{m.val}</span>
                </div>
              ))}
            </div>

            {/* Quick Actions Panel */}
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

            {/* Recent Orders Table */}
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
                        <td className="px-6 py-4 font-mono font-medium text-white">{o.id}</td>
                        <td className="px-6 py-4">{getCustomerName(o.customerId)}</td>
                        <td className="px-6 py-4">{getVehicleModel(o.vehicleId)}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-0.5 rounded text-xs font-semibold inline-block ${
                            o.status === "COMPLETED" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/15" :
                            o.status === "IN_PROGRESS" ? "bg-amber-500/10 text-amber-400 border border-amber-500/15" :
                            "bg-indigo-500/10 text-indigo-400 border border-indigo-500/15"
                          }`}>
                            {o.status === "COMPLETED" ? "Concluído" : o.status === "IN_PROGRESS" ? "Em Execução" : "Orçamento"}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-semibold text-white">R$ {o.totalPrice.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => setSelectedOrder(o)}
                            className="bg-zinc-800 hover:bg-zinc-700 px-3 py-1 rounded text-xs font-semibold border border-zinc-700 transition"
                          >
                            Visualizar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab: Orders */}
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
                      <td className="px-6 py-4 font-mono font-medium text-white">{o.id}</td>
                      <td className="px-6 py-4 text-xs text-zinc-500">{o.createdAt}</td>
                      <td className="px-6 py-4">{getCustomerName(o.customerId)}</td>
                      <td className="px-6 py-4">{getVehicleModel(o.vehicleId)} ({getVehiclePlate(o.vehicleId)})</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 rounded text-xs font-semibold inline-block ${
                          o.status === "COMPLETED" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/15" :
                          o.status === "IN_PROGRESS" ? "bg-amber-500/10 text-amber-400 border border-amber-500/15" :
                          "bg-indigo-500/10 text-indigo-400 border border-indigo-500/15"
                        }`}>
                          {o.status === "COMPLETED" ? "Concluído" : o.status === "IN_PROGRESS" ? "Em Execução" : "Orçamento"}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-semibold text-white">R$ {o.totalPrice.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => setSelectedOrder(o)}
                          className="bg-zinc-800 hover:bg-zinc-700 px-3 py-1 rounded text-xs font-semibold border border-zinc-700 transition"
                        >
                          Gerenciar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Order Details View (Interactive Sandbox) */}
        {selectedOrder && (
          <div className="flex flex-col gap-6">
            <button
              onClick={() => setSelectedOrder(null)}
              className="text-xs font-bold text-zinc-400 hover:text-zinc-200 flex items-center gap-1.5 self-start"
            >
              ← Voltar para listagem
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Order Metadata and Actions */}
              <div className="lg:col-span-2 flex flex-col gap-6">
                {/* Meta details card */}
                <div className="p-6 rounded-xl border border-zinc-800 bg-zinc-900/30 flex flex-col gap-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-xs font-mono text-zinc-500">CÓDIGO: {selectedOrder.id}</span>
                      <h2 className="text-lg font-bold text-white mt-0.5">Detalhes da Ordem de Serviço</h2>
                    </div>
                    <div className="flex gap-2">
                      <select
                        value={selectedOrder.status}
                        onChange={(e) => handleStatusChange(e.target.value as any)}
                        className="bg-zinc-800 border border-zinc-700 rounded-md text-xs px-2.5 py-1 text-white focus:outline-none focus:border-indigo-500 font-semibold"
                      >
                        <option value="DRAFT_BUDGET">Orçamento Inicial</option>
                        <option value="BUDGET_APPROVED">Orçamento Aprovado</option>
                        <option value="IN_PROGRESS">Em Execução</option>
                        <option value="COMPLETED">Serviço Concluído</option>
                        <option value="CANCELLED">Cancelado</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 border-t border-zinc-800/80 pt-4">
                    <div>
                      <span className="block text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Cliente</span>
                      <span className="text-sm font-semibold text-zinc-200">{getCustomerName(selectedOrder.customerId)}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Veículo</span>
                      <span className="text-sm font-semibold text-zinc-200">{getVehicleModel(selectedOrder.vehicleId)}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Placa</span>
                      <span className="text-sm font-semibold font-mono text-indigo-400">{getVehiclePlate(selectedOrder.vehicleId)}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Data Entrada</span>
                      <span className="text-sm font-semibold text-zinc-200">{selectedOrder.createdAt}</span>
                    </div>
                  </div>

                  <div className="border-t border-zinc-800/80 pt-4 flex flex-col gap-1.5">
                    <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Sintomas / Observações</span>
                    <p className="text-sm text-zinc-300 italic">"{selectedOrder.notes || "Sem observações detalhadas."}"</p>
                  </div>
                </div>

                {/* Items/Budget block */}
                <div className="p-6 rounded-xl border border-zinc-800 bg-zinc-900/30 flex flex-col gap-4">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">Peças e Mão de Obra</h3>

                  {/* Add item form */}
                  <form onSubmit={handleAddItemToOrder} className="grid grid-cols-1 md:grid-cols-5 gap-3 bg-zinc-950 p-4 rounded-lg border border-zinc-800/50">
                    <div className="md:col-span-2">
                      <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Descrição</label>
                      <input
                        type="text"
                        placeholder="Ex: Pastilha de freio Bosch"
                        value={newItem.description}
                        onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Tipo</label>
                      <select
                        value={newItem.type}
                        onChange={(e) => setNewItem({ ...newItem, type: e.target.value as any })}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                      >
                        <option value="PART">Peça</option>
                        <option value="LABOR">Mão de Obra</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Qtd / Unit.</label>
                      <div className="flex gap-1.5">
                        <input
                          type="number"
                          value={newItem.quantity}
                          min={1}
                          onChange={(e) => setNewItem({ ...newItem, quantity: Number(e.target.value) })}
                          className="w-12 bg-zinc-900 border border-zinc-800 rounded px-1.5 py-1.5 text-xs text-white text-center focus:outline-none"
                        />
                        <input
                          type="number"
                          placeholder="0,00"
                          value={newItem.unitPrice || ""}
                          onChange={(e) => setNewItem({ ...newItem, unitPrice: Number(e.target.value) })}
                          className="flex-1 bg-zinc-900 border border-zinc-800 rounded px-2 py-1.5 text-xs text-white focus:outline-none"
                          required
                        />
                      </div>
                    </div>
                    <div className="flex items-end">
                      <button
                        type="submit"
                        className="w-full bg-indigo-600 hover:bg-indigo-500 text-white rounded py-1.5 text-xs font-bold transition"
                      >
                        Adicionar
                      </button>
                    </div>
                  </form>

                  {/* List items */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="text-zinc-500 font-bold border-b border-zinc-800 pb-2 uppercase tracking-wide">
                          <th className="py-2">Descrição</th>
                          <th className="py-2">Tipo</th>
                          <th className="py-2 text-center">Qtd</th>
                          <th className="py-2 text-right">Unitário</th>
                          <th className="py-2 text-right">Subtotal</th>
                          <th className="py-2 text-right">Ação</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-800/50">
                        {selectedOrder.items.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="py-6 text-center text-zinc-500">Nenhum item adicionado a este orçamento ainda.</td>
                          </tr>
                        ) : (
                          selectedOrder.items.map(item => (
                            <tr key={item.id} className="hover:bg-zinc-800/10">
                              <td className="py-2.5 font-medium text-white">{item.description}</td>
                              <td className="py-2.5">
                                <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${item.type === "PART" ? "bg-blue-500/10 text-blue-400" : "bg-purple-500/10 text-purple-400"}`}>
                                  {item.type === "PART" ? "Peça" : "Mão de Obra"}
                                </span>
                              </td>
                              <td className="py-2.5 text-center">{item.quantity}</td>
                              <td className="py-2.5 text-right">R$ {item.unitPrice.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</td>
                              <td className="py-2.5 text-right font-semibold text-white">R$ {item.totalPrice.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</td>
                              <td className="py-2.5 text-right">
                                <button
                                  onClick={() => handleRemoveItem(item.id)}
                                  className="text-red-400 hover:text-red-300 font-bold"
                                >
                                  Remover
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Summary */}
                  <div className="flex justify-between items-center border-t border-zinc-800 pt-4 bg-zinc-950/40 p-4 rounded-lg">
                    <span className="text-sm font-semibold text-zinc-400">Total do Orçamento</span>
                    <span className="text-xl font-extrabold text-white">R$ {selectedOrder.totalPrice.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </div>

              {/* AI Diagnostic Report Panel */}
              <div className="lg:col-span-1">
                <div className="p-6 rounded-xl border border-indigo-500/20 bg-indigo-500/5 flex flex-col gap-4 sticky top-6">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                      ✨
                    </div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">Suporte Técnico IA</h3>
                  </div>

                  <p className="text-xs text-zinc-400">
                    O assistente de inteligência artificial analisa os sintomas relatados para sugerir falhas prováveis e listar peças que comumente precisam de substituição.
                  </p>

                  <button
                    onClick={handleAIGenerateDiagnostic}
                    disabled={isGeneratingAI}
                    className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-zinc-800 text-white font-semibold text-xs py-2 rounded transition flex items-center justify-center gap-1.5 shadow"
                  >
                    {isGeneratingAI ? "Pensando..." : selectedOrder.aiDiagnostic ? "Atualizar Análise IA" : "Gerar Pré-Diagnóstico IA"}
                  </button>

                  <div className="border-t border-indigo-500/20 pt-4 flex flex-col gap-3 min-h-[150px] bg-zinc-950/60 p-4 rounded-lg max-h-[400px] overflow-y-auto">
                    {isGeneratingAI ? (
                      <div className="flex flex-col gap-2 items-center justify-center h-full py-8">
                        <div className="h-5 w-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-xs text-zinc-500">Gerando análise detalhada...</span>
                      </div>
                    ) : selectedOrder.aiDiagnostic ? (
                      <div className="text-xs text-zinc-300 whitespace-pre-wrap leading-5 prose prose-invert">
                        {selectedOrder.aiDiagnostic}
                      </div>
                    ) : (
                      <span className="text-xs text-zinc-600 italic text-center py-8">
                        Nenhum diagnóstico gerado ainda. Clique no botão acima para acionar a IA.
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab: Clients */}
        {activeTab === "clients" && (
          <div className="flex flex-col gap-6">
            <div className="flex justify-end">
              <button
                onClick={() => setIsAddingCustomer(true)}
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-3.5 py-2 rounded-lg text-xs font-bold transition shadow flex items-center gap-1.5"
              >
                Cadastrar Cliente
              </button>
            </div>

            <div className="border border-zinc-800 rounded-xl bg-zinc-900/10 overflow-hidden">
              <table className="w-full text-left text-sm text-zinc-300">
                <thead className="bg-zinc-900/60 text-zinc-500 text-xs font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-3">Nome</th>
                    <th className="px-6 py-3">Telefone</th>
                    <th className="px-6 py-3">Email</th>
                    <th className="px-6 py-3">CPF / CNPJ</th>
                    <th className="px-6 py-3">Endereço</th>
                  </tr>
                </thead>
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

        {/* Tab: Vehicles */}
        {activeTab === "vehicles" && (
          <div className="flex flex-col gap-6">
            <div className="flex justify-end">
              <button
                onClick={() => setIsAddingVehicle(true)}
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-3.5 py-2 rounded-lg text-xs font-bold transition shadow flex items-center gap-1.5"
              >
                Cadastrar Veículo
              </button>
            </div>

            <div className="border border-zinc-800 rounded-xl bg-zinc-900/10 overflow-hidden">
              <table className="w-full text-left text-sm text-zinc-300">
                <thead className="bg-zinc-900/60 text-zinc-500 text-xs font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-3">Placa</th>
                    <th className="px-6 py-3">Modelo</th>
                    <th className="px-6 py-3">Marca</th>
                    <th className="px-6 py-3">Ano</th>
                    <th className="px-6 py-3">Cor</th>
                    <th className="px-6 py-3">Proprietário</th>
                  </tr>
                </thead>
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

        {/* Tab: Agenda */}
        {activeTab === "agenda" && (
          <div className="flex flex-col gap-6">
            <div className="flex justify-end">
              <button
                onClick={() => setIsAddingAppointment(true)}
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-3.5 py-2 rounded-lg text-xs font-bold transition shadow flex items-center gap-1.5"
              >
                Agendar Horário
              </button>
            </div>

            <div className="border border-zinc-800 rounded-xl bg-zinc-900/10 overflow-hidden">
              <table className="w-full text-left text-sm text-zinc-300">
                <thead className="bg-zinc-900/60 text-zinc-500 text-xs font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-3">Horário Agendado</th>
                    <th className="px-6 py-3">Cliente</th>
                    <th className="px-6 py-3">Veículo</th>
                    <th className="px-6 py-3">Descrição / Notas</th>
                    <th className="px-6 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {appointments.map(a => (
                    <tr key={a.id} className="hover:bg-zinc-800/10 transition-colors">
                      <td className="px-6 py-4 font-semibold text-white">{a.scheduledTime}</td>
                      <td className="px-6 py-4">{getCustomerName(a.customerId)}</td>
                      <td className="px-6 py-4 font-medium">{getVehicleModel(a.vehicleId)} ({getVehiclePlate(a.vehicleId)})</td>
                      <td className="px-6 py-4 text-zinc-400">{a.notes || "---"}</td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-0.5 rounded text-xs font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/15">
                          Agendado
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab: AI Assistant Chat */}
        {activeTab === "chat" && (
          <div className="flex flex-col border border-zinc-800 bg-zinc-900/10 rounded-xl h-[600px] overflow-hidden">
            {/* Session title banner */}
            <div className="px-6 py-4 border-b border-zinc-800 bg-zinc-900/40 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse"></div>
                <span className="text-sm font-semibold text-white">Canal de Ajuda Mecânica - IA OficinaAI</span>
              </div>
              <span className="text-xs text-zinc-500">Gemini 1.5 Flash Ativo</span>
            </div>

            {/* Message Area */}
            <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-4 bg-zinc-950/20">
              {chatMessages.map(msg => (
                <div
                  key={msg.id}
                  className={`flex flex-col max-w-[80%] ${msg.role === "user" ? "self-end items-end" : "self-start items-start"}`}
                >
                  <div className={`p-4 rounded-xl text-sm leading-6 whitespace-pre-wrap ${
                    msg.role === "user"
                      ? "bg-indigo-600 text-white rounded-br-none"
                      : "bg-zinc-900 text-zinc-200 border border-zinc-800 rounded-bl-none prose prose-invert"
                  }`}>
                    {msg.content}
                  </div>
                  <span className="text-[10px] text-zinc-600 mt-1 font-semibold capitalize">
                    {msg.role === "user" ? "Mecânico (Você)" : "IA Assistente"}
                  </span>
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

            {/* Chat Input form */}
            <form onSubmit={handleSendChatMessage} className="p-4 border-t border-zinc-800 bg-zinc-900/20 flex gap-3">
              <input
                type="text"
                placeholder="Pergunte sobre torque, diagnóstico de injeção, óleo (Ex: 'torque do motor EA111')"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500"
              />
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition shadow-md shadow-indigo-600/10"
              >
                Enviar
              </button>
            </form>
          </div>
        )}
      </main>

      {/* MODAL: ADD CUSTOMER */}
      {isAddingCustomer && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl w-full max-w-md p-6 shadow-2xl flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-bold text-white">Cadastrar Novo Cliente</h3>
              <button onClick={() => setIsAddingCustomer(false)} className="text-zinc-500 hover:text-zinc-300 font-bold">✕</button>
            </div>
            <form onSubmit={handleAddCustomer} className="flex flex-col gap-3 text-xs">
              <div>
                <label className="block text-[10px] text-zinc-400 font-bold uppercase mb-1">Nome Completo</label>
                <input
                  type="text"
                  placeholder="Ex: João da Silva"
                  value={newCust.name}
                  onChange={(e) => setNewCust({ ...newCust, name: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-white focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] text-zinc-400 font-bold uppercase mb-1">Telefone Celular</label>
                <input
                  type="text"
                  placeholder="Ex: (11) 99999-9999"
                  value={newCust.phone}
                  onChange={(e) => setNewCust({ ...newCust, phone: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-white focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] text-zinc-400 font-bold uppercase mb-1">E-mail</label>
                <input
                  type="email"
                  placeholder="Ex: joao@email.com"
                  value={newCust.email}
                  onChange={(e) => setNewCust({ ...newCust, email: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-white focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] text-zinc-400 font-bold uppercase mb-1">CPF ou CNPJ</label>
                <input
                  type="text"
                  placeholder="Ex: 123.456.789-00"
                  value={newCust.cpfCnpj}
                  onChange={(e) => setNewCust({ ...newCust, cpfCnpj: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-white focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] text-zinc-400 font-bold uppercase mb-1">Endereço Residencial</label>
                <input
                  type="text"
                  placeholder="Ex: Rua das Flores, 45"
                  value={newCust.address}
                  onChange={(e) => setNewCust({ ...newCust, address: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-white focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 rounded text-sm transition mt-2"
              >
                Confirmar Cadastro
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD VEHICLE */}
      {isAddingVehicle && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl w-full max-w-md p-6 shadow-2xl flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-bold text-white">Cadastrar Novo Veículo</h3>
              <button onClick={() => setIsAddingVehicle(false)} className="text-zinc-500 hover:text-zinc-300 font-bold">✕</button>
            </div>
            <form onSubmit={handleAddVehicle} className="flex flex-col gap-3 text-xs">
              <div>
                <label className="block text-[10px] text-zinc-400 font-bold uppercase mb-1">Proprietário (Cliente)</label>
                <select
                  value={newVeh.customerId}
                  onChange={(e) => setNewVeh({ ...newVeh, customerId: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-white focus:outline-none"
                  required
                >
                  <option value="">Selecione um cliente...</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] text-zinc-400 font-bold uppercase mb-1">Placa</label>
                <input
                  type="text"
                  placeholder="Ex: BRA2E19"
                  value={newVeh.plate}
                  onChange={(e) => setNewVeh({ ...newVeh, plate: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-white focus:outline-none"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-zinc-400 font-bold uppercase mb-1">Marca</label>
                  <input
                    type="text"
                    placeholder="Ex: Chevrolet"
                    value={newVeh.brand}
                    onChange={(e) => setNewVeh({ ...newVeh, brand: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-white focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-zinc-400 font-bold uppercase mb-1">Modelo</label>
                  <input
                    type="text"
                    placeholder="Ex: Onix 1.0T"
                    value={newVeh.model}
                    onChange={(e) => setNewVeh({ ...newVeh, model: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-white focus:outline-none"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-zinc-400 font-bold uppercase mb-1">Ano Fabricação</label>
                  <input
                    type="number"
                    value={newVeh.year}
                    onChange={(e) => setNewVeh({ ...newVeh, year: Number(e.target.value) })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-white focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-zinc-400 font-bold uppercase mb-1">Cor</label>
                  <input
                    type="text"
                    placeholder="Ex: Cinza Metálico"
                    value={newVeh.color}
                    onChange={(e) => setNewVeh({ ...newVeh, color: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-white focus:outline-none"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 rounded text-sm transition mt-2"
              >
                Confirmar Cadastro
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD ORDER */}
      {isAddingOrder && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl w-full max-w-md p-6 shadow-2xl flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-bold text-white">Criar Ordem de Serviço / Orçamento</h3>
              <button onClick={() => setIsAddingOrder(false)} className="text-zinc-500 hover:text-zinc-300 font-bold">✕</button>
            </div>
            <form onSubmit={handleAddOrder} className="flex flex-col gap-3 text-xs">
              <div>
                <label className="block text-[10px] text-zinc-400 font-bold uppercase mb-1">Cliente</label>
                <select
                  value={newOrder.customerId}
                  onChange={(e) => {
                    const custId = e.target.value;
                    setNewOrder({ ...newOrder, customerId: custId, vehicleId: "" });
                  }}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-white focus:outline-none"
                  required
                >
                  <option value="">Selecione o cliente...</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] text-zinc-400 font-bold uppercase mb-1">Veículo do Cliente</label>
                <select
                  value={newOrder.vehicleId}
                  onChange={(e) => setNewOrder({ ...newOrder, vehicleId: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-white focus:outline-none"
                  disabled={!newOrder.customerId}
                  required
                >
                  <option value="">Selecione o veículo...</option>
                  {vehicles
                    .filter(v => v.customerId === newOrder.customerId)
                    .map(v => (
                      <option key={v.id} value={v.id}>{v.brand} {v.model} ({v.plate})</option>
                    ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] text-zinc-400 font-bold uppercase mb-1">Sintomas Relatados pelo Cliente</label>
                <textarea
                  placeholder="Ex: Barulho na suspensão ao frear forte. Vazamento de líquido do radiador."
                  value={newOrder.notes}
                  onChange={(e) => setNewOrder({ ...newOrder, notes: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-white focus:outline-none min-h-[80px]"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 rounded text-sm transition mt-2"
              >
                Abrir Ordem de Serviço
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD APPOINTMENT */}
      {isAddingAppointment && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl w-full max-w-md p-6 shadow-2xl flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-bold text-white">Agendar Horário</h3>
              <button onClick={() => setIsAddingAppointment(false)} className="text-zinc-500 hover:text-zinc-300 font-bold">✕</button>
            </div>
            <form onSubmit={handleAddAppointment} className="flex flex-col gap-3 text-xs">
              <div>
                <label className="block text-[10px] text-zinc-400 font-bold uppercase mb-1">Cliente</label>
                <select
                  value={newApt.customerId}
                  onChange={(e) => setNewApt({ ...newApt, customerId: e.target.value, vehicleId: "" })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-white focus:outline-none"
                  required
                >
                  <option value="">Selecione o cliente...</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] text-zinc-400 font-bold uppercase mb-1">Veículo</label>
                <select
                  value={newApt.vehicleId}
                  onChange={(e) => setNewApt({ ...newApt, vehicleId: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-white focus:outline-none"
                  disabled={!newApt.customerId}
                  required
                >
                  <option value="">Selecione o veículo...</option>
                  {vehicles
                    .filter(v => v.customerId === newApt.customerId)
                    .map(v => (
                      <option key={v.id} value={v.id}>{v.brand} {v.model} ({v.plate})</option>
                    ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] text-zinc-400 font-bold uppercase mb-1">Data e Horário</label>
                <input
                  type="text"
                  placeholder="Ex: 14/07/2026 às 09:30"
                  value={newApt.scheduledTime}
                  onChange={(e) => setNewApt({ ...newApt, scheduledTime: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-white focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] text-zinc-400 font-bold uppercase mb-1">Descrição / Notas do Agendamento</label>
                <input
                  type="text"
                  placeholder="Ex: Troca de óleo rápida e revisão de pastilhas."
                  value={newApt.notes}
                  onChange={(e) => setNewApt({ ...newApt, notes: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-white focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 rounded text-sm transition mt-2"
              >
                Confirmar Agendamento
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
