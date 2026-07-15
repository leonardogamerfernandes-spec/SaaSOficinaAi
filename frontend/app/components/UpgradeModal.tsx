"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import Modal from "./Modal";

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  requiredPlan: "PRO" | "ENTERPRISE";
  onUpgradeSuccess: () => void;
}

export default function UpgradeModal({ isOpen, onClose, requiredPlan, onUpgradeSuccess }: UpgradeModalProps) {
  const [loading, setLoading] = useState(false);

  async function handleUpgrade() {
    setLoading(true);
    try {
      const res = await api.payments.checkout(requiredPlan);
      if (res.init_point) {
        window.location.href = res.init_point;
      } else {
        throw new Error("Ponto de entrada do pagamento não encontrado.");
      }
    } catch (err: any) {
      alert("Erro ao iniciar pagamento: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal title="✨ Recurso Premium" isOpen={isOpen} onClose={onClose}>
      <div className="flex flex-col gap-4 text-center py-2">
        <div className="h-14 w-14 rounded-full bg-indigo-500/10 text-indigo-400 flex items-center justify-center text-2xl mx-auto mb-2 animate-bounce">
          👑
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">Disponível no Plano {requiredPlan}</h3>
          <p className="text-xs text-zinc-400 mt-1 px-4">
            Este recurso não está disponível no seu plano atual. Melhore o gerenciamento da sua oficina atualizando seu plano em um clique.
          </p>
        </div>

        <div className="bg-zinc-950 p-4 rounded-lg border border-zinc-800 text-left text-xs text-zinc-300 flex flex-col gap-2.5 my-2">
          <span className="font-bold text-zinc-400 uppercase tracking-wider text-[10px]">O que você vai liberar:</span>
          {requiredPlan === "PRO" ? (
            <>
              <div className="flex items-start gap-2">
                <span className="text-indigo-400 font-bold">✓</span>
                <span>Buscador de Peças Inteligente por IA (catálogo instantâneo)</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-indigo-400 font-bold">✓</span>
                <span>Relatórios Financeiros Avançados & Ticket Médio</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-indigo-400 font-bold">✓</span>
                <span>Controle de Estoque e alertas de estoque baixo</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-indigo-400 font-bold">✓</span>
                <span>Lembretes de Revisão Automáticos (retenção de clientes)</span>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-start gap-2">
                <span className="text-indigo-400 font-bold">✓</span>
                <span>Gestão multi-usuário ilimitada (mecânicos, recepção, gerentes)</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-indigo-400 font-bold">✓</span>
                <span>PDF de Orçamentos com layout profissional</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-indigo-400 font-bold">✓</span>
                <span>Link público de acompanhamento em tempo real para o cliente</span>
              </div>
            </>
          )}
        </div>

        <button
          onClick={handleUpgrade}
          disabled={loading}
          className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold py-2.5 rounded-lg text-sm transition shadow-lg shadow-indigo-500/20 disabled:opacity-50"
        >
          {loading ? "Processando..." : `Assinar Plano ${requiredPlan}`}
        </button>
        <button onClick={onClose} className="text-xs text-zinc-500 hover:text-zinc-400 font-medium">
          Talvez mais tarde
        </button>
      </div>
    </Modal>
  );
}
