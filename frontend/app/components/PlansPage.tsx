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
      if (plan === "FREE") {
        await api.plans.update(plan);
        alert(`Sua oficina retornou ao plano básico/gratuito.`);
        await fetchPlanStatus();
        if (onPlanUpdated) onPlanUpdated();
      } else {
        const res = await api.payments.checkout(plan);
        if (res.init_point) {
          window.location.href = res.init_point;
        } else {
          throw new Error("Ponto de entrada do pagamento não encontrado.");
        }
      }
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
    <div className="flex flex-col gap-8 text-[11px] text-zinc-300 relative z-10">
      {/* Current plan status & usage */}
      <div className="p-6 rounded-2xl border border-zinc-900 bg-zinc-900/30 backdrop-blur-sm flex flex-col gap-6">
        <div>
          <h4 className="text-xs font-black text-white uppercase tracking-wider">
            Seu Plano Atual: <span className="text-indigo-400 font-black">{currentPlan}</span>
          </h4>
          <p className="text-zinc-500 mt-1 font-semibold">Acompanhe abaixo o consumo dos limites do seu plano.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {renderLimitBar("Clientes Cadastrados", status?.usage.customers || 0, status?.limits.customers || 50)}
          {renderLimitBar("Ordens de Serviço (Mês)", status?.usage.monthlyOrders || 0, status?.limits.monthlyOrders || 30)}
          {renderLimitBar("Usuários Ativos", status?.usage.users || 0, status?.limits.users || 1)}
        </div>
      </div>

      {/* Plan Comparisons */}
      <div>
        <h4 className="text-xs font-black text-white uppercase tracking-wider mb-6 text-center">Nossos Planos de Assinatura</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          
          {/* FREE */}
          <div className={`p-6 rounded-2xl border flex flex-col justify-between bg-zinc-900/10 backdrop-blur-sm transition-all duration-300 hover:border-zinc-800 ${currentPlan === "FREE" ? "border-indigo-500/50 shadow-lg shadow-indigo-500/5" : "border-zinc-900"}`}>
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-start">
                <div>
                  <h5 className="text-xs font-extrabold text-white uppercase tracking-wider">Plano Básico</h5>
                  <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider">Organização Essencial</span>
                </div>
                {currentPlan === "FREE" && (
                  <span className="px-2 py-0.5 rounded-md text-[8px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/15 font-black uppercase tracking-wider">Plano Ativo</span>
                )}
              </div>
              <div className="py-2">
                <span className="text-2xl font-black text-white">Grátis</span>
                <span className="text-zinc-500 font-medium"> / sempre</span>
              </div>
              <ul className="flex flex-col gap-2.5 text-zinc-400 border-t border-zinc-900/80 pt-4 font-medium">
                <li><span className="text-indigo-400 mr-1.5">✓</span> Até 50 Clientes e Veículos</li>
                <li><span className="text-indigo-400 mr-1.5">✓</span> Até 30 Ordens de Serviço / mês</li>
                <li><span className="text-indigo-400 mr-1.5">✓</span> Agenda de Serviços & Calendário</li>
                <li><span className="text-indigo-400 mr-1.5">✓</span> Checklist de Inspeção de entrada</li>
                <li><span className="text-indigo-400 mr-1.5">✓</span> Histórico de Manutenções</li>
                <li><span className="text-indigo-400 mr-1.5">✓</span> 1 Usuário Operador</li>
              </ul>
            </div>
            <button
              onClick={() => handlePlanUpgrade("FREE")}
              disabled={currentPlan === "FREE" || actionLoading !== null}
              className={`w-full mt-8 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-wider transition ${
                currentPlan === "FREE"
                  ? "bg-zinc-900/60 text-zinc-600 border border-zinc-900 cursor-default"
                  : "bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700"
              }`}
            >
              {currentPlan === "FREE" ? "Plano Atual" : "Downgrade para Básico"}
            </button>
          </div>

          {/* PRO */}
          <div className={`p-6 rounded-2xl border flex flex-col justify-between bg-zinc-900/30 backdrop-blur-sm transition-all duration-300 hover:border-zinc-800 ${currentPlan === "PRO" ? "border-indigo-500/50 shadow-lg shadow-indigo-500/5" : "border-zinc-800/60"}`}>
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-start">
                <div>
                  <h5 className="text-xs font-extrabold text-white uppercase tracking-wider">Plano Profissional</h5>
                  <span className="text-[9px] text-indigo-400 font-extrabold tracking-wider uppercase">Recomendado</span>
                </div>
                {currentPlan === "PRO" && (
                  <span className="px-2 py-0.5 rounded-md text-[8px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/15 font-black uppercase tracking-wider">Plano Ativo</span>
                )}
              </div>
              <div className="py-2">
                <span className="text-2xl font-black text-white">R$ 79</span>
                <span className="text-zinc-500 font-medium"> / mês</span>
              </div>
              <ul className="flex flex-col gap-2.5 text-zinc-300 border-t border-zinc-900/80 pt-4 font-semibold">
                <li><span className="text-indigo-400 mr-1.5">✓</span> Clientes & OS <strong>Ilimitadas</strong></li>
                <li><span className="text-indigo-400 mr-1.5">✓</span> <strong>Buscador de Peças por IA</strong></li>
                <li><span className="text-indigo-400 mr-1.5">✓</span> <strong>Diagnósticos Técnicos por IA</strong></li>
                <li><span className="text-indigo-400 mr-1.5">✓</span> Relatórios Financeiros & Ticket Médio</li>
                <li><span className="text-indigo-400 mr-1.5">✓</span> Lembretes de Revisão no WhatsApp</li>
                <li><span className="text-indigo-400 mr-1.5">✓</span> Controle de Estoque de Peças</li>
                <li><span className="text-indigo-400 mr-1.5">✓</span> Certificado de Garantia de Serviços</li>
                <li><span className="text-indigo-400 mr-1.5">✓</span> Até 3 Usuários Operadores</li>
              </ul>
            </div>
            <button
              onClick={() => handlePlanUpgrade("PRO")}
              disabled={currentPlan === "PRO" || actionLoading !== null}
              className={`w-full mt-8 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-wider transition ${
                currentPlan === "PRO"
                  ? "bg-zinc-900/60 text-zinc-600 border border-zinc-900 cursor-default"
                  : "bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-md shadow-indigo-600/15"
              }`}
            >
              {actionLoading === "PRO" ? "Processando..." : currentPlan === "PRO" ? "Plano Atual" : "Upgrade para Profissional"}
            </button>
          </div>

          {/* ENTERPRISE */}
          <div className={`p-6 rounded-2xl border flex flex-col justify-between bg-zinc-900/10 backdrop-blur-sm transition-all duration-300 hover:border-zinc-800 ${currentPlan === "ENTERPRISE" ? "border-indigo-500/50 shadow-lg shadow-indigo-500/5" : "border-zinc-900"}`}>
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-start">
                <div>
                  <h5 className="text-xs font-extrabold text-white uppercase tracking-wider">Plano Empresarial</h5>
                  <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider">Gestão Corporativa</span>
                </div>
                {currentPlan === "ENTERPRISE" && (
                  <span className="px-2 py-0.5 rounded-md text-[8px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/15 font-black uppercase tracking-wider">Plano Ativo</span>
                )}
              </div>
              <div className="py-2">
                <span className="text-2xl font-black text-white">R$ 149</span>
                <span className="text-zinc-500 font-medium"> / mês</span>
              </div>
              <ul className="flex flex-col gap-2.5 text-zinc-400 border-t border-zinc-900/80 pt-4 font-medium">
                <li><span className="text-indigo-400 mr-1.5">✓</span> Tudo do Plano Profissional</li>
                <li><span className="text-indigo-400 mr-1.5">✓</span> <strong>Usuários Ilimitados</strong></li>
                <li><span className="text-indigo-400 mr-1.5">✓</span> Metas de faturamento mensais</li>
                <li><span className="text-indigo-400 mr-1.5">✓</span> Link público da OS para o cliente</li>
                <li><span className="text-indigo-400 mr-1.5">✓</span> Geração de PDF do Orçamento / OS</li>
                <li><span className="text-indigo-400 mr-1.5">✓</span> Templates de OS Recorrentes</li>
                <li><span className="text-indigo-400 mr-1.5">✓</span> Produtividade por mecânico</li>
              </ul>
            </div>
            <button
              onClick={() => handlePlanUpgrade("ENTERPRISE")}
              disabled={currentPlan === "ENTERPRISE" || actionLoading !== null}
              className={`w-full mt-8 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-wider transition ${
                currentPlan === "ENTERPRISE"
                  ? "bg-zinc-900/60 text-zinc-600 border border-zinc-900 cursor-default"
                  : "bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700"
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
