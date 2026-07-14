"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import type { InventoryItem } from "@/lib/api";
import Modal from "./Modal";

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState<InventoryItem | null>(null);
  
  const [formData, setFormData] = useState({
    name: "",
    partNumber: "",
    brand: "",
    quantity: 0,
    minQuantity: 5,
    unitCost: 0,
    unitPrice: 0,
    category: "OTHER" as any,
    location: "",
  });

  useEffect(() => {
    fetchInventory();
  }, []);

  async function fetchInventory() {
    setLoading(true);
    try {
      const data = await api.inventory.list();
      setItems(data);
    } catch (err) {
      console.error("Erro ao carregar estoque:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.name) return;

    try {
      const created = await api.inventory.create(formData);
      setItems(prev => [...prev, created]);
      setIsAdding(false);
      resetForm();
    } catch (err: any) {
      alert("Erro ao criar item: " + err.message);
    }
  }

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!isEditing || !formData.name) return;

    try {
      const updated = await api.inventory.update(isEditing.id, formData);
      setItems(prev => prev.map(item => item.id === isEditing.id ? updated : item));
      setIsEditing(null);
      resetForm();
    } catch (err: any) {
      alert("Erro ao atualizar item: " + err.message);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Deseja realmente excluir este item do estoque?")) return;
    try {
      await api.inventory.delete(id);
      setItems(prev => prev.filter(item => item.id !== id));
    } catch (err: any) {
      alert("Erro ao deletar item: " + err.message);
    }
  }

  function startEdit(item: InventoryItem) {
    setIsEditing(item);
    setFormData({
      name: item.name,
      partNumber: item.partNumber || "",
      brand: item.brand || "",
      quantity: item.quantity,
      minQuantity: item.minQuantity,
      unitCost: item.unitCost,
      unitPrice: item.unitPrice,
      category: item.category,
      location: item.location || "",
    });
  }

  function resetForm() {
    setFormData({
      name: "",
      partNumber: "",
      brand: "",
      quantity: 0,
      minQuantity: 5,
      unitCost: 0,
      unitPrice: 0,
      category: "OTHER",
      location: "",
    });
  }

  const categoryLabel: Record<string, string> = {
    BRAKE: "Freio",
    ENGINE: "Motor",
    SUSPENSION: "Suspensão",
    ELECTRICAL: "Elétrica",
    FILTERS: "Filtros",
    LUBRICATION: "Lubrificação",
    OTHER: "Outros",
  };

  return (
    <div className="flex flex-col gap-6 text-xs text-zinc-300">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Controle de Estoque de Peças</h3>
          <p className="text-zinc-500 mt-0.5">Gerenciamento quantitativo e financeiro de insumos e sobressalentes.</p>
        </div>
        <button onClick={() => { resetForm(); setIsAdding(true); }} className="bg-indigo-600 hover:bg-indigo-500 text-white px-3.5 py-2 rounded-lg text-xs font-bold transition shadow">Cadastrar Peça</button>
      </div>

      <div className="border border-zinc-800 rounded-xl bg-zinc-900/10 overflow-hidden">
        {loading ? (
          <div className="px-6 py-10 text-center text-zinc-500">Carregando estoque...</div>
        ) : items.length === 0 ? (
          <div className="px-6 py-10 text-center text-zinc-500">
            <p className="text-sm font-semibold">Nenhuma peça cadastrada no estoque.</p>
            <p className="text-xs text-zinc-600 mt-2">Clique em "Cadastrar Peça" para gerenciar seu estoque.</p>
          </div>
        ) : (
          <table className="w-full text-left text-sm text-zinc-300">
            <thead className="bg-zinc-900/60 text-zinc-500 text-xs font-semibold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3">Peça</th>
                <th className="px-6 py-3">Marca / Código</th>
                <th className="px-6 py-3">Categoria</th>
                <th className="px-6 py-3">Localização</th>
                <th className="px-6 py-3 text-center">Qtd Atual</th>
                <th className="px-6 py-3 text-right">Custo Unit.</th>
                <th className="px-6 py-3 text-right">Preço Venda</th>
                <th className="px-6 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {items.map(item => {
                const isLow = item.quantity <= item.minQuantity;
                return (
                  <tr key={item.id} className={`hover:bg-zinc-800/10 transition-colors ${isLow ? "bg-amber-500/[0.02]" : ""}`}>
                    <td className="px-6 py-4 font-semibold text-white">
                      <div className="flex items-center gap-2">
                        {item.name}
                        {isLow && (
                          <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/15 animate-pulse">Estoque Baixo</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="block text-zinc-400 font-medium">{item.brand || "---"}</span>
                      <span className="block text-xs text-zinc-500 font-mono">{item.partNumber || "---"}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-0.5 rounded text-xs bg-zinc-800 border border-zinc-700">
                        {categoryLabel[item.category] || item.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-zinc-400">{item.location || "---"}</td>
                    <td className="px-6 py-4 text-center font-bold">
                      <span className={isLow ? "text-amber-400" : "text-white"}>{item.quantity}</span>
                      <span className="text-zinc-600 text-xs"> / {item.minQuantity} min</span>
                    </td>
                    <td className="px-6 py-4 text-right font-medium">R$ {item.unitCost.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</td>
                    <td className="px-6 py-4 text-right font-semibold text-white">R$ {item.unitPrice.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</td>
                    <td className="px-6 py-4 text-right font-semibold">
                      <div className="flex justify-end gap-3 text-xs">
                        <button onClick={() => startEdit(item)} className="text-indigo-400 hover:text-indigo-300">Editar</button>
                        <button onClick={() => handleDelete(item.id)} className="text-red-400 hover:text-red-300">Excluir</button>
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
      <Modal title="Cadastrar Nova Peça" isOpen={isAdding} onClose={() => setIsAdding(false)}>
        <form onSubmit={handleCreate} className="flex flex-col gap-3 text-xs">
          {renderFormFields()}
          <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 rounded text-sm transition mt-2">Cadastrar Peça</button>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal title="Editar Peça no Estoque" isOpen={!!isEditing} onClose={() => setIsEditing(null)}>
        <form onSubmit={handleUpdate} className="flex flex-col gap-3 text-xs">
          {renderFormFields()}
          <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 rounded text-sm transition mt-2">Salvar Alterações</button>
        </form>
      </Modal>
    </div>
  );

  function renderFormFields() {
    return (
      <>
        <div>
          <label className="block text-[10px] text-zinc-400 font-bold uppercase mb-1">Nome da Peça / Descrição</label>
          <input type="text" placeholder="Ex: Pastilha de Freio Dianteira" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-white focus:outline-none focus:border-indigo-500" required />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[10px] text-zinc-400 font-bold uppercase mb-1">Marca</label>
            <input type="text" placeholder="Ex: Cobreq" value={formData.brand} onChange={(e) => setFormData({ ...formData, brand: e.target.value })} className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-white focus:outline-none" />
          </div>
          <div>
            <label className="block text-[10px] text-zinc-400 font-bold uppercase mb-1">Código Fabricante</label>
            <input type="text" placeholder="Ex: N-245" value={formData.partNumber} onChange={(e) => setFormData({ ...formData, partNumber: e.target.value })} className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-white focus:outline-none" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[10px] text-zinc-400 font-bold uppercase mb-1">Quantidade Atual</label>
            <input type="number" value={formData.quantity} onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })} className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-white focus:outline-none" required />
          </div>
          <div>
            <label className="block text-[10px] text-zinc-400 font-bold uppercase mb-1">Estoque Mínimo</label>
            <input type="number" value={formData.minQuantity} onChange={(e) => setFormData({ ...formData, minQuantity: Number(e.target.value) })} className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-white focus:outline-none" required />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[10px] text-zinc-400 font-bold uppercase mb-1">Custo Unitário (R$)</label>
            <input type="number" step="0.01" placeholder="0,00" value={formData.unitCost || ""} onChange={(e) => setFormData({ ...formData, unitCost: Number(e.target.value) })} className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-white focus:outline-none" />
          </div>
          <div>
            <label className="block text-[10px] text-zinc-400 font-bold uppercase mb-1">Preço Venda (R$)</label>
            <input type="number" step="0.01" placeholder="0,00" value={formData.unitPrice || ""} onChange={(e) => setFormData({ ...formData, unitPrice: Number(e.target.value) })} className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-white focus:outline-none" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[10px] text-zinc-400 font-bold uppercase mb-1">Categoria</label>
            <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value as any })} className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-white focus:outline-none">
              <option value="BRAKE">Freio</option>
              <option value="ENGINE">Motor</option>
              <option value="SUSPENSION">Suspensão</option>
              <option value="ELECTRICAL">Elétrica</option>
              <option value="FILTERS">Filtros</option>
              <option value="LUBRICATION">Lubrificação</option>
              <option value="OTHER">Outros</option>
            </select>
          </div>
          <div>
            <label className="block text-[10px] text-zinc-400 font-bold uppercase mb-1">Localização (Estante)</label>
            <input type="text" placeholder="Ex: Estante A-3" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-white focus:outline-none" />
          </div>
        </div>
      </>
    );
  }
}
