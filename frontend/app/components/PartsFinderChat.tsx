"use client";

import { useState } from "react";
import { api } from "@/lib/api";

export default function PartsFinderChat() {
  const [searchData, setSearchData] = useState({
    vehicleBrand: "",
    vehicleModel: "",
    vehicleYear: new Date().getFullYear(),
    engineInfo: "",
    serviceDescription: "",
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!searchData.vehicleBrand || !searchData.vehicleModel || !searchData.serviceDescription) return;

    setLoading(true);
    setResult(null);
    try {
      const res = await api.ai.partsFinder(searchData);
      setResult(res.result);
    } catch (err: any) {
      alert("Erro ao buscar peças: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1">
        <div className="p-6 rounded-xl border border-zinc-800 bg-zinc-900/30 flex flex-col gap-4">
          <div>
            <h3 className="text-base font-bold text-white">Buscador Inteligente de Peças</h3>
            <p className="text-xs text-zinc-500 mt-1">Sugerido por IA com especificações de marcas e preços no mercado nacional.</p>
          </div>
          <form onSubmit={handleSearch} className="flex flex-col gap-4 text-xs">
            <div>
              <label className="block text-[10px] text-zinc-400 font-bold uppercase mb-1">Marca</label>
              <input type="text" placeholder="Ex: Chevrolet" value={searchData.vehicleBrand} onChange={(e) => setSearchData({ ...searchData, vehicleBrand: e.target.value })} className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-white focus:outline-none focus:border-indigo-500" required />
            </div>
            <div>
              <label className="block text-[10px] text-zinc-400 font-bold uppercase mb-1">Modelo</label>
              <input type="text" placeholder="Ex: Onix 1.0T" value={searchData.vehicleModel} onChange={(e) => setSearchData({ ...searchData, vehicleModel: e.target.value })} className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-white focus:outline-none focus:border-indigo-500" required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] text-zinc-400 font-bold uppercase mb-1">Ano</label>
                <input type="number" value={searchData.vehicleYear} onChange={(e) => setSearchData({ ...searchData, vehicleYear: Number(e.target.value) })} className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-white focus:outline-none" required />
              </div>
              <div>
                <label className="block text-[10px] text-zinc-400 font-bold uppercase mb-1">Motorização</label>
                <input type="text" placeholder="Ex: 1.0 12V Ecotec" value={searchData.engineInfo} onChange={(e) => setSearchData({ ...searchData, engineInfo: e.target.value })} className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-white focus:outline-none" />
              </div>
            </div>
            <div>
              <label className="block text-[10px] text-zinc-400 font-bold uppercase mb-1">Serviço Desejado</label>
              <input type="text" placeholder="Ex: Troca de correia dentada, embreagem" value={searchData.serviceDescription} onChange={(e) => setSearchData({ ...searchData, serviceDescription: e.target.value })} className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-white focus:outline-none focus:border-indigo-500" required />
            </div>
            <button type="submit" disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-zinc-800 text-white font-bold py-2.5 rounded text-xs transition mt-2 shadow-md shadow-indigo-600/10 flex items-center justify-center gap-1.5">
              {loading ? "Buscando Peças..." : "Consultar Catálogo IA"}
            </button>
          </form>
        </div>
      </div>

      <div className="lg:col-span-2">
        <div className="border border-zinc-800 bg-zinc-900/10 rounded-xl min-h-[400px] flex flex-col p-6 overflow-hidden">
          {loading ? (
            <div className="flex flex-col items-center justify-center flex-1 text-zinc-500 py-10 gap-3">
              <div className="h-6 w-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-xs">A IA está gerando a lista de peças e guias técnicos de montagem...</p>
            </div>
          ) : result ? (
            <div className="prose prose-invert max-w-none text-sm text-zinc-300 whitespace-pre-wrap leading-6">
              {result}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center flex-1 text-zinc-600 text-center max-w-sm mx-auto py-10">
              <div className="h-10 w-10 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-500 mb-3 text-lg">⚙</div>
              <h4 className="text-sm font-bold text-white mb-1">Pronto para buscar</h4>
              <p className="text-xs">Preencha os dados do veículo e do serviço ao lado para receber um diagnóstico completo de peças recomendadas, preços e tempos de serviço.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
