"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import type { PlanStatusResponse } from "@/lib/api";

interface PlansPageProps {
  onPlanUpdated?: () => void;
}

export default function PlansPage({ onPlanUpdated }: PlansPageProps) {
  const [status, setStatus] = useState<PlanStatusResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchPlanStatus();
  }, []);

  async function fetchPlanStatus() {
    setLoading(true);
    try {
      const data = await api.plans.getStatus();
      setStatus(data);
    } catch (err) {
      console.error("Erro ao carregar status do plano:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handlePlanUpgrade(plan: "FREE" | "PRO" | "ENTERPRISE") {
    setActionLoading(plan);
    try {
      await api.plans.update(plan);
      alert(`Parabéns! Sua oficina foi atualizada para o plano ${plan}!`);
      await fetchPlanStatus();
      if (onPlanUpdated) onPlanUpdated();
    } catch (err: any) {
      alert("Erro ao alterar plano: " + err.message);
    } finally {
      setActionLoading(null);
    }
  }

  if (loading) return <div className="text-zinc-500 text-xs py-4 text-center">Carregando dados de assinatura...</div>;

  const currentPlan = status?.plan || "FREE";

  const renderLimitBar = (label: string, used: number, limit: number) => {
    const isInfinite = limit === Infinity || limit === 999 || !limit;
    const pct = isInfinite ? 0 : Math.min((used / limit) * 100, 100);
    return (
      <div className="flex flex-col gap-1.5 p-4 rounded-lg bg-zinc-950 border border-zinc-800/80">
        <div className="flex justify-between font-semibold text-zinc-400">
          <span>{label}</span>
          <span>{used} / {isInfinite ? "Ilimitado" : limit}</span>
        </div>
        {!isInfinite && (
          <div className="w-full bg-zinc-900 h-2 rounded overflow-hidden">
            <div
              style={{ width: `${pct}%` }}
              className={`h-full rounded ${pct >= 90 ? "bg-red-500" : pct >= 70 ? "bg-amber-500" : "bg-indigo-500"}`}
            ></div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-8 text-xs text-zinc-300">
      {/* Current plan status & usage */}
      <div className="p-6 rounded-xl border border-zinc-800 bg-zinc-900/30 flex flex-col gap-6">
        <div>
          <h4 className="text-sm font-bold text-white uppercase tracking-wider">Seu Plano Atual: <span className="text-indigo-400 font-extrabold">{currentPlan}</span></h4>
          <p className="text-zinc-500 mt-0.5 font-medium">Acompanhe abaixo o consumo dos limites do seu plano.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {renderLimitBar("Clientes Cadastrados", status?.usage.customers || 0, status?.limits.customers || 50)}
          {renderLimitBar("Ordens de Serviço (Mês)", status?.usage.monthlyOrders || 0, status?.limits.monthlyOrders || 30)}
          {renderLimitBar("Usuários Ativos", status?.usage.users || 0, status?.limits.users || 1)}
        </div>
      </div>

      {/* Plan Comparisons */}
      <div>
        <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-6 text-center">Nossos Planos de Assinatura</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          
          {/* FREE */}
          <div className={`p-6 rounded-xl border flex flex-col justify-between bg-zinc-900/10 ${currentPlan === "FREE" ? "border-indigo-500" : "border-zinc-800"}`}>
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-start">
                <div>
                  <h5 className="text-sm font-bold text-white uppercase tracking-wider">Plano Básico</h5>
                  <span className="text-[10px] text-zinc-500 font-medium">Organização Essencial</span>
                </div>
                {currentPlan === "FREE" && (
                  <span className="px-2 py-0.5 rounded text-[8px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/15 font-bold">Plano Ativo</span>
                )}
              </div>
              <div className="py-2">
                <span className="text-3xl font-extrabold text-white">Grátis</span>
                <span className="text-zinc-500"> / sempre</span>
              </div>
              <ul className="flex flex-col gap-2.5 text-zinc-400 border-t border-zinc-800 pt-4">
                <li>✓ Até 50 Clientes e Veículos</li>
                <li>✓ Até 30 Ordens de Serviço / mês</li>
                <li>✓ Agenda de Serviços & Calendário</li>
                <li>✓ Checklist de Inspeção de entrada</li>
                <li>✓ Histórico de Manutenções</li>
                <li>✓ 1 Usuário Operador</li>
              </ul>
            </div>
            <button
              onClick={() => handlePlanUpgrade("FREE")}
              disabled={currentPlan === "FREE" || actionLoading !== null}
              className={`w-full mt-8 py-2 rounded font-bold text-xs transition ${
                currentPlan === "FREE"
                  ? "bg-zinc-800 text-zinc-500 cursor-default"
                  : "bg-zinc-800 hover:bg-zinc-700 text-white"
              }`}
            >
              {currentPlan === "FREE" ? "Plano Atual" : "Downgrade para Básico"}
            </button>
          </div>

          {/* PRO */}
          <div className={`p-6 rounded-xl border flex flex-col justify-between bg-zinc-900/30 ${currentPlan === "PRO" ? "border-indigo-500" : "border-zinc-800/80"}`}>
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-start">
                <div>
                  <h5 className="text-sm font-bold text-white uppercase tracking-wider">Plano Profissional</h5>
                  <span className="text-[10px] text-indigo-400 font-semibold tracking-wider uppercase">Recomendado</span>
                </div>
                {currentPlan === "PRO" && (
                  <span className="px-2 py-0.5 rounded text-[8px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/15 font-bold">Plano Ativo</span>
                )}
              </div>
              <div className="py-2">
                <span className="text-3xl font-extrabold text-white">R$ 79</span>
                <span className="text-zinc-500"> / mês</span>
              </div>
              <ul className="flex flex-col gap-2.5 text-zinc-400 border-t border-zinc-800 pt-4">
                <li>✓ Clientes & OS **Ilimitadas**</li>
                <li>✓ **Buscador de Peças Inteligente por IA**</li>
                <li>✓ **Diagnósticos Técnicos por IA**</li>
                <li>✓ Relatórios Financeiros & Ticket Médio</li>
                <li>✓ Lembretes de Revisão no WhatsApp</li>
                <li>✓ Controle de Estoque de Peças</li>
                <li>✓ Certificado de Garantia de Serviços</li>
                <li>✓ Até 3 Usuários Operadores</li>
              </ul>
            </div>
            <button
              onClick={() => handlePlanUpgrade("PRO")}
              disabled={currentPlan === "PRO" || actionLoading !== null}
              className={`w-full mt-8 py-2 rounded font-bold text-xs transition ${
                currentPlan === "PRO"
                  ? "bg-zinc-800 text-zinc-500 cursor-default"
                  : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/10"
              }`}
            >
              {actionLoading === "PRO" ? "Processando..." : currentPlan === "PRO" ? "Plano Atual" : "Upgrade para Profissional"}
            </button>
          </div>

          {/* ENTERPRISE */}
          <div className={`p-6 rounded-xl border flex flex-col justify-between bg-zinc-900/10 ${currentPlan === "ENTERPRISE" ? "border-indigo-500" : "border-zinc-800"}`}>
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-start">
                <div>
                  <h5 className="text-sm font-bold text-white uppercase tracking-wider">Plano Empresarial</h5>
                  <span className="text-[10px] text-zinc-500 font-medium">Gestão Corporativa</span>
                </div>
                {currentPlan === "ENTERPRISE" && (
                  <span className="px-2 py-0.5 rounded text-[8px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/15 font-bold">Plano Ativo</span>
                )}
              </div>
              <div className="py-2">
                <span className="text-3xl font-extrabold text-white">R$ 149</span>
                <span className="text-zinc-500"> / mês</span>
              </div>
              <ul className="flex flex-col gap-2.5 text-zinc-400 border-t border-zinc-800 pt-4">
                <li>✓ Tudo do Plano Profissional</li>
                <li>✓ **Usuários Ilimitados** com níveis de permissão</li>
                <li>✓ Metas de faturamento mensais</li>
                <li>✓ Link público da OS para o proprietário</li>
                <li>✓ Geração de PDF do Orçamento / OS</li>
                <li>✓ Templates de OS Recorrentes</li>
                <li>✓ Produtividade analítica por mecânico</li>
              </ul>
            </div>
            <button
              onClick={() => handlePlanUpgrade("ENTERPRISE")}
              disabled={currentPlan === "ENTERPRISE" || actionLoading !== null}
              className={`w-full mt-8 py-2 rounded font-bold text-xs transition ${
                currentPlan === "ENTERPRISE"
                  ? "bg-zinc-800 text-zinc-500 cursor-default"
                  : "bg-zinc-800 hover:bg-zinc-700 text-white"
              }`}
            >
              {actionLoading === "ENTERPRISE" ? "Processando..." : currentPlan === "ENTERPRISE" ? "Plano Atual" : "Upgrade para Empresarial"}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
