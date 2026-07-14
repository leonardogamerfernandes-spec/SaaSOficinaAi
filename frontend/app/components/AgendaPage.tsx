"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import type { Appointment, Customer, Vehicle } from "@/lib/api";
import Modal from "./Modal";

interface AgendaPageProps {
  customers: Customer[];
  vehicles: Vehicle[];
}

export default function AgendaPage({ customers, vehicles }: AgendaPageProps) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newApt, setNewApt] = useState({ customerId: "", vehicleId: "", scheduledTime: "", notes: "" });

  useEffect(() => {
    fetchAppointments();
  }, []);

  async function fetchAppointments() {
    try {
      const data = await api.appointments.list();
      setAppointments(data);
    } catch (err) {
      console.error("Failed to fetch appointments:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleAddAppointment(e: React.FormEvent) {
    e.preventDefault();
    if (!newApt.customerId || !newApt.vehicleId || !newApt.scheduledTime) return;

    try {
      const created = await api.appointments.create({
        customerId: newApt.customerId,
        vehicleId: newApt.vehicleId,
        scheduledTime: new Date(newApt.scheduledTime).toISOString(),
        notes: newApt.notes || undefined,
      });
      setAppointments(prev => [...prev, created]);
      setIsAdding(false);
      setNewApt({ customerId: "", vehicleId: "", scheduledTime: "", notes: "" });
    } catch (err: any) {
      alert(err.message);
    }
  }

  async function handleCancelAppointment(id: string) {
    try {
      await api.appointments.update(id, { status: "CANCELLED" });
      setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: "CANCELLED" } : a));
    } catch (err: any) {
      alert(err.message);
    }
  }

  const getCustomerName = (id: string) => customers.find(c => c.id === id)?.name || "Cliente desconhecido";
  const getVehicleInfo = (id: string) => {
    const v = vehicles.find(veh => veh.id === id);
    return v ? `${v.brand} ${v.model} (${v.plate})` : "Veículo desconhecido";
  };

  const statusLabel: Record<string, { text: string; cls: string }> = {
    SCHEDULED: { text: "Agendado", cls: "bg-indigo-500/10 text-indigo-400 border border-indigo-500/15" },
    CONFIRMED: { text: "Confirmado", cls: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/15" },
    CANCELLED: { text: "Cancelado", cls: "bg-red-500/10 text-red-400 border border-red-500/15" },
    COMPLETED: { text: "Concluído", cls: "bg-zinc-500/10 text-zinc-400 border border-zinc-500/15" },
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-end">
        <button onClick={() => setIsAdding(true)} className="bg-indigo-600 hover:bg-indigo-500 text-white px-3.5 py-2 rounded-lg text-xs font-bold transition shadow flex items-center gap-1.5">Agendar Horário</button>
      </div>

      <div className="border border-zinc-800 rounded-xl bg-zinc-900/10 overflow-hidden">
        {loading ? (
          <div className="px-6 py-10 text-center text-zinc-500">
            <p className="text-sm">Carregando agendamentos...</p>
          </div>
        ) : appointments.length === 0 ? (
          <div className="px-6 py-10 text-center text-zinc-500">
            <p className="text-sm font-semibold">Nenhum agendamento encontrado.</p>
            <p className="text-xs text-zinc-600 mt-2">Clique em "Agendar Horário" para criar o primeiro.</p>
          </div>
        ) : (
          <table className="w-full text-left text-sm text-zinc-300">
            <thead className="bg-zinc-900/60 text-zinc-500 text-xs font-semibold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3">Data / Hora</th>
                <th className="px-6 py-3">Cliente</th>
                <th className="px-6 py-3">Veículo</th>
                <th className="px-6 py-3">Descrição</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {appointments.map(a => {
                const st = statusLabel[a.status] || statusLabel.SCHEDULED;
                return (
                  <tr key={a.id} className="hover:bg-zinc-800/10 transition-colors">
                    <td className="px-6 py-4 font-semibold text-white">
                      {new Date(a.scheduledTime).toLocaleDateString("pt-BR")} às {new Date(a.scheduledTime).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                    </td>
                    <td className="px-6 py-4">{getCustomerName(a.customerId)}</td>
                    <td className="px-6 py-4">{getVehicleInfo(a.vehicleId)}</td>
                    <td className="px-6 py-4 text-xs text-zinc-400">{a.notes || "---"}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded text-xs font-semibold inline-block ${st.cls}`}>{st.text}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {a.status === "SCHEDULED" && (
                        <button onClick={() => handleCancelAppointment(a.id)} className="text-red-400 hover:text-red-300 text-xs font-bold">Cancelar</button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <Modal title="Agendar Horário" isOpen={isAdding} onClose={() => setIsAdding(false)}>
        <form onSubmit={handleAddAppointment} className="flex flex-col gap-3 text-xs">
          <div>
            <label className="block text-[10px] text-zinc-400 font-bold uppercase mb-1">Cliente</label>
            <select value={newApt.customerId} onChange={(e) => setNewApt({ ...newApt, customerId: e.target.value, vehicleId: "" })} className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-white focus:outline-none" required>
              <option value="">Selecione o cliente...</option>
              {customers.map(c => (<option key={c.id} value={c.id}>{c.name}</option>))}
            </select>
          </div>
          <div>
            <label className="block text-[10px] text-zinc-400 font-bold uppercase mb-1">Veículo</label>
            <select value={newApt.vehicleId} onChange={(e) => setNewApt({ ...newApt, vehicleId: e.target.value })} className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-white focus:outline-none" disabled={!newApt.customerId} required>
              <option value="">Selecione o veículo...</option>
              {vehicles.filter(v => v.customerId === newApt.customerId).map(v => (<option key={v.id} value={v.id}>{v.brand} {v.model} ({v.plate})</option>))}
            </select>
          </div>
          <div>
            <label className="block text-[10px] text-zinc-400 font-bold uppercase mb-1">Data e Horário</label>
            <input type="datetime-local" value={newApt.scheduledTime} onChange={(e) => setNewApt({ ...newApt, scheduledTime: e.target.value })} className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-white focus:outline-none" required />
          </div>
          <div>
            <label className="block text-[10px] text-zinc-400 font-bold uppercase mb-1">Descrição</label>
            <input type="text" placeholder="Ex: Troca de óleo rápida" value={newApt.notes} onChange={(e) => setNewApt({ ...newApt, notes: e.target.value })} className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-white focus:outline-none" />
          </div>
          <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 rounded text-sm transition mt-2">Confirmar Agendamento</button>
        </form>
      </Modal>
    </div>
  );
}
