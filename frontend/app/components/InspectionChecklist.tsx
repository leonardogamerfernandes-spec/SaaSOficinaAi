"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import type { InspectionChecklist as InspectionType } from "@/lib/api";

interface InspectionChecklistProps {
  serviceOrderId: string;
  onSaved?: () => void;
}

export default function InspectionChecklist({ serviceOrderId, onSaved }: InspectionChecklistProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [checklist, setChecklist] = useState<Partial<InspectionType>>({
    headlightsOk: false,
    taillightsOk: false,
    tiresOk: false,
    brakesOk: false,
    fluidsOk: false,
    batteryOk: false,
    suspensionOk: false,
    exhaustOk: false,
    acOk: false,
    wiperOk: false,
    mirrorsOk: false,
    bodyDamageNotes: "",
    mileage: undefined,
    fuelLevel: "HALF",
    notes: "",
  });

  useEffect(() => {
    fetchChecklist();
  }, [serviceOrderId]);

  async function fetchChecklist() {
    setLoading(true);
    try {
      const data = await api.inspections.get(serviceOrderId);
      if (data) {
        setChecklist(data);
      }
    } catch (err) {
      console.error("Erro ao buscar checklist:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await api.inspections.upsert(serviceOrderId, checklist);
      alert("Checklist de inspeção salvo com sucesso!");
      if (onSaved) onSaved();
    } catch (err: any) {
      alert("Erro ao salvar checklist: " + err.message);
    } finally {
      setSaving(false);
    }
  }

  const items = [
    { id: "headlightsOk", label: "Faróis / Lanternas dianteiras" },
    { id: "taillightsOk", label: "Luzes traseiras / Seta / Ré / Freio" },
    { id: "tiresOk", label: "Pneus / Alinhamento / Estepe" },
    { id: "brakesOk", label: "Pastilhas / Discos / Fluido de Freio" },
    { id: "fluidsOk", label: "Níveis de Óleo / Arrefecimento / Aditivo" },
    { id: "batteryOk", label: "Bateria / Alternador / Parte Elétrica" },
    { id: "suspensionOk", label: "Amortecedores / Pivôs / Buchas" },
    { id: "exhaustOk", label: "Escapamento / Catalisador / Vazamentos" },
    { id: "acOk", label: "Ar Condicionado / Filtro de Cabine" },
    { id: "wiperOk", label: "Palhetas do Limpador de Parabrisa" },
    { id: "mirrorsOk", label: "Retrovisores / Vidros / Fechaduras" },
  ];

  if (loading) return <div className="text-zinc-500 text-xs py-4 text-center">Carregando checklist...</div>;

  return (
    <form onSubmit={handleSave} className="p-6 rounded-xl border border-zinc-800 bg-zinc-900/30 flex flex-col gap-6 text-xs">
      <div>
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">Checklist de Inspeção de Entrada</h3>
        <p className="text-zinc-500 mt-1">Marque os itens inspecionados que estão em perfeito estado de funcionamento.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-3">
          {items.slice(0, 6).map(item => (
            <label key={item.id} className="flex items-center gap-2.5 cursor-pointer text-zinc-300 hover:text-white">
              <input
                type="checkbox"
                checked={!!(checklist as any)[item.id]}
                onChange={(e) => setChecklist({ ...checklist, [item.id]: e.target.checked })}
                className="rounded border-zinc-800 bg-zinc-950 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
              />
              <span>{item.label}</span>
            </label>
          ))}
        </div>
        <div className="flex flex-col gap-3">
          {items.slice(6).map(item => (
            <label key={item.id} className="flex items-center gap-2.5 cursor-pointer text-zinc-300 hover:text-white">
              <input
                type="checkbox"
                checked={!!(checklist as any)[item.id]}
                onChange={(e) => setChecklist({ ...checklist, [item.id]: e.target.checked })}
                className="rounded border-zinc-800 bg-zinc-950 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
              />
              <span>{item.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-zinc-800 pt-4">
        <div>
          <label className="block text-[10px] text-zinc-400 font-bold uppercase mb-1">Km de Entrada</label>
          <input
            type="number"
            placeholder="Km atual"
            value={checklist.mileage || ""}
            onChange={(e) => setChecklist({ ...checklist, mileage: e.target.value ? Number(e.target.value) : undefined })}
            className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-white focus:outline-none focus:border-indigo-500"
          />
        </div>
        <div>
          <label className="block text-[10px] text-zinc-400 font-bold uppercase mb-1">Nível de Combustível</label>
          <select
            value={checklist.fuelLevel || "HALF"}
            onChange={(e) => setChecklist({ ...checklist, fuelLevel: e.target.value as any })}
            className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-white focus:outline-none"
          >
            <option value="EMPTY">Reserva (Vazio)</option>
            <option value="QUARTER">1/4 Tanque</option>
            <option value="HALF">Meio Tanque</option>
            <option value="THREE_QUARTER">3/4 Tanque</option>
            <option value="FULL">Tanque Cheio</option>
          </select>
        </div>
        <div>
          <label className="block text-[10px] text-zinc-400 font-bold uppercase mb-1">Danos Externos na Lataria</label>
          <input
            type="text"
            placeholder="Ex: Riscado parachoques dianteiro"
            value={checklist.bodyDamageNotes || ""}
            onChange={(e) => setChecklist({ ...checklist, bodyDamageNotes: e.target.value })}
            className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-white focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-[10px] text-zinc-400 font-bold uppercase mb-1">Observações Adicionais</label>
        <textarea
          placeholder="Itens soltos deixados no porta-luvas, chave reserva, etc."
          value={checklist.notes || ""}
          onChange={(e) => setChecklist({ ...checklist, notes: e.target.value })}
          className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-white focus:outline-none min-h-[60px]"
        />
      </div>

      <button
        type="submit"
        disabled={saving}
        className="self-end bg-indigo-600 hover:bg-indigo-500 disabled:bg-zinc-800 text-white font-bold px-5 py-2 rounded text-xs transition"
      >
        {saving ? "Salvando..." : "Salvar Checklist"}
      </button>
    </form>
  );
}
