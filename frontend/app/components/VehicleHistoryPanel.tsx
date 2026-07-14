"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import type { Vehicle, ServiceOrder } from "@/lib/api";

interface VehicleHistoryPanelProps {
  vehicleId: string;
}

export default function VehicleHistoryPanel({ vehicleId }: VehicleHistoryPanelProps) {
  const [historyData, setHistoryData] = useState<{ vehicle: Vehicle; history: ServiceOrder[] } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, [vehicleId]);

  async function fetchHistory() {
    setLoading(true);
    try {
      const data = await api.vehicles.history(vehicleId);
      setHistoryData(data);
    } catch (err) {
      console.error("Erro ao buscar histórico do veículo:", err);
    } finally {
      setLoading(false);
    }
  }

  const getStatusLabel = (status: string) => {
    const map: Record<string, { text: string; cls: string }> = {
      COMPLETED: { text: "Concluído", cls: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/15" },
      IN_PROGRESS: { text: "Em Execução", cls: "bg-amber-500/10 text-amber-400 border border-amber-500/15" },
      DRAFT_BUDGET: { text: "Orçamento Inicial", cls: "bg-indigo-500/10 text-indigo-400 border border-indigo-500/15" },
      BUDGET_APPROVED: { text: "Orçamento Aprovado", cls: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/15" },
      CANCELLED: { text: "Cancelado", cls: "bg-red-500/10 text-red-400 border border-red-500/15" },
    };
    return map[status] || { text: status, cls: "bg-zinc-500/10 text-zinc-400 border border-zinc-500/15" };
  };

  if (loading) return <div className="text-zinc-500 text-xs py-4 text-center">Carregando histórico do veículo...</div>;
  if (!historyData || historyData.history.length === 0) {
    return (
      <div className="p-6 text-center text-zinc-500 text-xs">
        Nenhum serviço registrado anteriormente para este veículo.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 text-xs">
      <div>
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">Histórico de Manutenções</h3>
        <p className="text-zinc-500 mt-1">Linha do tempo completa dos reparos efetuados neste carro.</p>
      </div>

      <div className="relative border-l border-zinc-800 ml-4 flex flex-col gap-6">
        {historyData.history.map((order) => {
          const status = getStatusLabel(order.status);
          return (
            <div key={order.id} className="relative pl-6">
              {/* Dot */}
              <div className="absolute -left-[5px] top-1.5 h-2 w-2 rounded-full bg-indigo-500 shadow-md shadow-indigo-500/50"></div>
              
              <div className="bg-zinc-900/40 border border-zinc-800 rounded-lg p-4 flex flex-col gap-3">
                <div className="flex justify-between items-center flex-wrap gap-2">
                  <div>
                    <span className="font-mono text-zinc-400">#OS-{order.id.slice(0, 8)}</span>
                    <span className="text-zinc-500 mx-2">•</span>
                    <span className="text-zinc-400 font-semibold">{new Date(order.createdAt).toLocaleDateString("pt-BR")}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${status.cls}`}>{status.text}</span>
                    <span className="text-white font-bold">R$ {order.totalPrice.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>

                {order.notes && (
                  <div className="text-zinc-300 italic">
                    &ldquo;{order.notes}&rdquo;
                  </div>
                )}

                {order.items && order.items.length > 0 && (
                  <div className="border-t border-zinc-800/80 pt-2 flex flex-col gap-1.5">
                    <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Peças & Serviços:</span>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-zinc-400">
                      {order.items.map((item) => (
                        <div key={item.id} className="flex justify-between border-b border-zinc-900 pb-1">
                          <span>{item.description} (x{item.quantity})</span>
                          <span className="font-medium text-zinc-300">R$ {item.totalPrice.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {order.aiDiagnostic && (
                  <details className="cursor-pointer border-t border-zinc-800/80 pt-2 text-zinc-400">
                    <summary className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider hover:text-indigo-300">Ver Diagnóstico IA da OS</summary>
                    <div className="mt-2 text-zinc-300 bg-zinc-950/60 p-3 rounded border border-zinc-900 whitespace-pre-wrap leading-5 leading-normal">
                      {order.aiDiagnostic}
                    </div>
                  </details>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
