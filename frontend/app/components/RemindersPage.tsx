"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import type { ServiceReminder, Customer, Vehicle } from "@/lib/api";
import Modal from "./Modal";

interface RemindersPageProps {
  customers: Customer[];
  vehicles: Vehicle[];
}

export default function RemindersPage({ customers, vehicles }: RemindersPageProps) {
  const [reminders, setReminders] = useState<ServiceReminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newReminder, setNewReminder] = useState({
    customerId: "",
    vehicleId: "",
    type: "OIL_CHANGE",
    description: "",
    dueDateKm: "",
    dueDate: "",
  });

  useEffect(() => {
    fetchReminders();
  }, []);

  async function fetchReminders() {
    setLoading(true);
    try {
      const data = await api.reminders.list();
      setReminders(data);
    } catch (err) {
      console.error("Erro ao carregar lembretes:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newReminder.customerId || !newReminder.vehicleId || !newReminder.description) return;

    try {
      const created = await api.reminders.create({
        customerId: newReminder.customerId,
        vehicleId: newReminder.vehicleId,
        type: newReminder.type,
        description: newReminder.description,
        dueDateKm: newReminder.dueDateKm ? Number(newReminder.dueDateKm) : undefined,
        dueDate: newReminder.dueDate ? new Date(newReminder.dueDate).toISOString() : undefined,
      });

      setReminders(prev => [created, ...prev]);
      setIsAdding(false);
      setNewReminder({
        customerId: "",
        vehicleId: "",
        type: "OIL_CHANGE",
        description: "",
        dueDateKm: "",
        dueDate: "",
      });
      fetchReminders(); // Refresh list to get relationships
    } catch (err: any) {
      alert("Erro ao criar lembrete: " + err.message);
    }
  }

  async function handleUpdateStatus(id: string, status: "SENT" | "COMPLETED" | "DISMISSED") {
    try {
      await api.reminders.update(id, { status });
      setReminders(prev => prev.map(r => r.id === id ? { ...r, status } : r));
    } catch (err: any) {
      alert("Erro ao atualizar status: " + err.message);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Deseja deletar este lembrete?")) return;
    try {
      await api.reminders.delete(id);
      setReminders(prev => prev.filter(r => r.id !== id));
    } catch (err: any) {
      alert("Erro ao deletar lembrete: " + err.message);
    }
  }

  const reminderTypeLabel: Record<string, string> = {
    OIL_CHANGE: "Troca de Óleo",
    REVISION: "Revisão Geral",
    TIMING_BELT: "Correia Dentada",
    BRAKE_CHECK: "Inspeção de Freios",
    TIRE_ROTATION: "Rodízio de Pneus",
    CUSTOM: "Outro Lembrete",
  };

  const statusLabel: Record<string, { text: string; cls: string }> = {
    PENDING: { text: "Pendente", cls: "bg-indigo-500/10 text-indigo-400 border border-indigo-500/15" },
    SENT: { text: "Enviado", cls: "bg-blue-500/10 text-blue-400 border border-blue-500/15" },
    COMPLETED: { text: "Concluído", cls: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/15" },
    DISMISSED: { text: "Descartado", cls: "bg-zinc-500/10 text-zinc-400 border border-zinc-500/15" },
  };

  return (
    <div className="flex flex-col gap-6 text-xs text-zinc-300">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Lembretes de Revisão Automáticos</h3>
          <p className="text-zinc-500 mt-0.5">Agende alertas de manutenção preventiva para fidelizar clientes.</p>
        </div>
        <button onClick={() => setIsAdding(true)} className="bg-indigo-600 hover:bg-indigo-500 text-white px-3.5 py-2 rounded-lg text-xs font-bold transition shadow">Programar Lembrete</button>
      </div>

      <div className="border border-zinc-800 rounded-xl bg-zinc-900/10 overflow-hidden">
        {loading ? (
          <div className="px-6 py-10 text-center text-zinc-500">Carregando lembretes...</div>
        ) : reminders.length === 0 ? (
          <div className="px-6 py-10 text-center text-zinc-500">
            <p className="text-sm font-semibold">Nenhum lembrete programado ainda.</p>
            <p className="text-xs text-zinc-600 mt-2">Clientes ativos adoram receber lembretes de revisão por WhatsApp/Email!</p>
          </div>
        ) : (
          <table className="w-full text-left text-sm text-zinc-300">
            <thead className="bg-zinc-900/60 text-zinc-500 text-xs font-semibold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3">Cliente</th>
                <th className="px-6 py-3">Veículo</th>
                <th className="px-6 py-3">Tipo Lembrete</th>
                <th className="px-6 py-3">Descrição / Meta</th>
                <th className="px-6 py-3">Data Estimada</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {reminders.map(r => {
                const customer = customers.find(c => c.id === r.customerId);
                const vehicle = vehicles.find(v => v.id === r.vehicleId);
                const st = statusLabel[r.status] || statusLabel.PENDING;

                return (
                  <tr key={r.id} className="hover:bg-zinc-800/10 transition-colors">
                    <td className="px-6 py-4 font-semibold text-white">
                      <span>{customer?.name || "Cliente"}</span>
                      {customer?.phone && (
                        <span className="block text-[10px] text-zinc-500 font-mono">{customer.phone}</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span>{vehicle ? `${vehicle.brand} ${vehicle.model}` : "Veículo"}</span>
                      {vehicle?.plate && (
                        <span className="block text-[10px] text-indigo-400 font-mono">{vehicle.plate}</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-0.5 rounded text-xs bg-zinc-800 border border-zinc-700 font-medium">
                        {reminderTypeLabel[r.type] || r.type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="block text-zinc-200">{r.description}</span>
                      {r.dueDateKm && (
                        <span className="block text-[10px] text-amber-500 font-bold font-mono">Meta: {r.dueDateKm.toLocaleString()} Km</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {r.dueDate ? new Date(r.dueDate).toLocaleDateString("pt-BR") : "Baseado em Km"}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded text-xs font-semibold inline-block ${st.cls}`}>{st.text}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2.5">
                        {r.status === "PENDING" && (
                          <>
                            <button
                              onClick={() => {
                                const msg = encodeURIComponent(`Olá ${customer?.name}, aqui é da Oficina do Zeca! Lembramos que está próximo da revisão de ${reminderTypeLabel[r.type]} do seu ${vehicle?.model} (${vehicle?.plate}). Agende um horário conosco!`);
                                window.open(`https://api.whatsapp.com/send?phone=${customer?.phone.replace(/\D/g, "")}&text=${msg}`, "_blank");
                                handleUpdateStatus(r.id, "SENT");
                              }}
                              className="text-emerald-400 hover:text-emerald-300 font-semibold"
                            >
                              WhatsApp
                            </button>
                            <button onClick={() => handleUpdateStatus(r.id, "COMPLETED")} className="text-indigo-400 hover:text-indigo-300 font-semibold">Concluir</button>
                          </>
                        )}
                        <button onClick={() => handleDelete(r.id)} className="text-red-400 hover:text-red-300">Excluir</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Add Modal */}
      <Modal title="Programar Lembrete de Revisão" isOpen={isAdding} onClose={() => setIsAdding(false)}>
        <form onSubmit={handleCreate} className="flex flex-col gap-3 text-xs">
          <div>
            <label className="block text-[10px] text-zinc-400 font-bold uppercase mb-1">Cliente</label>
            <select value={newReminder.customerId} onChange={(e) => setNewReminder({ ...newReminder, customerId: e.target.value, vehicleId: "" })} className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-white focus:outline-none" required>
              <option value="">Selecione o cliente...</option>
              {customers.map(c => (<option key={c.id} value={c.id}>{c.name}</option>))}
            </select>
          </div>
          <div>
            <label className="block text-[10px] text-zinc-400 font-bold uppercase mb-1">Veículo do Cliente</label>
            <select value={newReminder.vehicleId} onChange={(e) => setNewReminder({ ...newReminder, vehicleId: e.target.value })} className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-white focus:outline-none" disabled={!newReminder.customerId} required>
              <option value="">Selecione o veículo...</option>
              {vehicles.filter(v => v.customerId === newReminder.customerId).map(v => (<option key={v.id} value={v.id}>{v.brand} {v.model} ({v.plate})</option>))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] text-zinc-400 font-bold uppercase mb-1">Tipo de Lembrete</label>
              <select value={newReminder.type} onChange={(e) => setNewReminder({ ...newReminder, type: e.target.value })} className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-white focus:outline-none">
                <option value="OIL_CHANGE">Troca de Óleo</option>
                <option value="REVISION">Revisão Geral</option>
                <option value="TIMING_BELT">Correia Dentada</option>
                <option value="BRAKE_CHECK">Inspeção de Freios</option>
                <option value="TIRE_ROTATION">Rodízio de Pneus</option>
                <option value="CUSTOM">Outro Lembrete</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] text-zinc-400 font-bold uppercase mb-1">Km da Revisão (Meta)</label>
              <input type="number" placeholder="Ex: 50000" value={newReminder.dueDateKm} onChange={(e) => setNewReminder({ ...newReminder, dueDateKm: e.target.value })} className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-white focus:outline-none" />
            </div>
          </div>
          <div>
            <label className="block text-[10px] text-zinc-400 font-bold uppercase mb-1">Data da Revisão (Meta)</label>
            <input type="date" value={newReminder.dueDate} onChange={(e) => setNewReminder({ ...newReminder, dueDate: e.target.value })} className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-white focus:outline-none" />
          </div>
          <div>
            <label className="block text-[10px] text-zinc-400 font-bold uppercase mb-1">Mensagem do Lembrete</label>
            <input type="text" placeholder="Ex: Troca de óleo Shell Helix 5W30 recomendada após rodar 10.000km" value={newReminder.description} onChange={(e) => setNewReminder({ ...newReminder, description: e.target.value })} className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-white focus:outline-none" required />
          </div>
          <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 rounded text-sm transition mt-2">Programar Lembrete</button>
        </form>
      </Modal>
    </div>
  );
}
