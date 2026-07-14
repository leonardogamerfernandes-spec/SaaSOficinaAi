"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import type { FinancialReportResponse, TopServiceResponse, TopCustomerResponse } from "@/lib/api";

export default function ReportsPage() {
  const [financial, setFinancial] = useState<FinancialReportResponse | null>(null);
  const [services, setServices] = useState<TopServiceResponse[]>([]);
  const [customers, setCustomers] = useState<TopCustomerResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  async function fetchReports() {
    setLoading(true);
    try {
      const [f, s, c] = await Promise.all([
        api.reports.financial(),
        api.reports.topServices(),
        api.reports.topCustomers(),
      ]);
      setFinancial(f);
      setServices(s);
      setCustomers(c);
    } catch (err) {
      console.error("Erro ao carregar relatórios:", err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <div className="text-zinc-500 text-xs py-4 text-center">Carregando relatórios de desempenho...</div>;

  const maxRevenue = financial ? Math.max(...financial.monthlyData.map(d => d.revenue), 1) : 1;

  return (
    <div className="flex flex-col gap-8 text-xs text-zinc-300">
      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-xl border border-emerald-500/20 bg-emerald-500/5 flex flex-col gap-2">
          <span className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Faturamento Anual (Concluído)</span>
          <span className="text-3xl font-extrabold tracking-tight text-emerald-400">
            R$ {financial?.totalRevenue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </span>
        </div>
        <div className="p-6 rounded-xl border border-indigo-500/20 bg-indigo-500/5 flex flex-col gap-2">
          <span className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Ticket Médio por OS</span>
          <span className="text-3xl font-extrabold tracking-tight text-indigo-400">
            R$ {financial?.ticketMedio.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </span>
        </div>
        <div className="p-6 rounded-xl border border-zinc-800 bg-zinc-900/40 flex flex-col gap-2">
          <span className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Serviços Concluídos no Ano</span>
          <span className="text-3xl font-extrabold tracking-tight text-white">
            {financial?.completedOrdersCount} OS
          </span>
        </div>
      </div>

      {/* Chart & Top Customers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Revenue Bar Chart */}
        <div className="lg:col-span-2 p-6 rounded-xl border border-zinc-800 bg-zinc-900/30 flex flex-col gap-4">
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Faturamento Mensal</h4>
            <p className="text-zinc-500 mt-0.5">Distribuição do faturamento bruto no ano corrente.</p>
          </div>
          <div className="h-64 flex items-end gap-3 pt-6 border-b border-zinc-800 pb-2 px-2">
            {financial?.monthlyData.map((data, idx) => {
              const pct = (data.revenue / maxRevenue) * 100;
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                  <div className="text-[10px] text-zinc-400 opacity-0 group-hover:opacity-100 transition duration-150 select-none">
                    {data.revenue > 0 ? `R$${Math.round(data.revenue)}` : ""}
                  </div>
                  <div
                    style={{ height: `${Math.max(pct, 2)}%` }}
                    className="w-full bg-gradient-to-t from-indigo-600 to-violet-500 rounded-t group-hover:from-indigo-500 group-hover:to-violet-400 transition-all duration-300 shadow-md shadow-indigo-600/10"
                  ></div>
                  <span className="text-[10px] text-zinc-500 font-semibold mt-1">{data.month}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Spending Customers */}
        <div className="lg:col-span-1 p-6 rounded-xl border border-zinc-800 bg-zinc-900/30 flex flex-col gap-4">
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Melhores Clientes</h4>
            <p className="text-zinc-500 mt-0.5">Clientes com maior faturamento acumulado.</p>
          </div>
          <div className="flex flex-col gap-3">
            {customers.map((c, idx) => (
              <div key={c.id} className="flex items-center gap-3 p-3 rounded-lg bg-zinc-950/40 border border-zinc-800/60">
                <span className="h-6 w-6 rounded-full bg-indigo-500/10 text-indigo-400 font-bold flex items-center justify-center text-xs">
                  {idx + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <span className="block font-semibold text-white truncate">{c.name}</span>
                  <span className="block text-[10px] text-zinc-500">{c.ordersCount} serviços realizados</span>
                </div>
                <span className="font-bold text-white">R$ {c.spent.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
              </div>
            ))}
            {customers.length === 0 && (
              <div className="text-center py-6 text-zinc-500 italic">Sem dados de clientes ainda.</div>
            )}
          </div>
        </div>
      </div>

      {/* Top Services Performed */}
      <div className="p-6 rounded-xl border border-zinc-800 bg-zinc-900/30 flex flex-col gap-4">
        <div>
          <h4 className="text-sm font-bold text-white uppercase tracking-wider">Serviços e Peças Mais Vendidos</h4>
          <p className="text-zinc-500 mt-0.5">Ranking de itens adicionados a ordens de serviço concluídas.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-zinc-300">
            <thead className="bg-zinc-900/60 text-zinc-500 text-xs font-semibold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3">Ranking</th>
                <th className="px-6 py-3">Descrição Item</th>
                <th className="px-6 py-3">Tipo</th>
                <th className="px-6 py-3 text-center">Frequência</th>
                <th className="px-6 py-3 text-right">Valor Total Acumulado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {services.map((s, idx) => (
                <tr key={idx} className="hover:bg-zinc-800/10 transition-colors">
                  <td className="px-6 py-4 font-bold text-zinc-500">#{idx + 1}</td>
                  <td className="px-6 py-4 font-semibold text-white">{s.description}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${s.type === "PART" ? "bg-blue-500/10 text-blue-400 border border-blue-500/15" : "bg-purple-500/10 text-purple-400 border border-purple-500/15"}`}>
                      {s.type === "PART" ? "Peça" : "Mão de Obra"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center font-bold text-white">{s.count}x</td>
                  <td className="px-6 py-4 text-right font-bold text-white">R$ {s.totalValue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</td>
                </tr>
              ))}
              {services.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-zinc-500 italic">Sem registros de itens faturados ainda.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
