"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

function MenuDots({ contaId, onDelete }: { contaId: number; onDelete: (id: number) => void }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      {/* Botão de 3 pontinhos */}
      <button
        onClick={() => setOpen(!open)}
        className="p-2 rounded-lg hover:bg-gray-700 transition"
      >
        ⋮
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className="absolute right-0 mt-2 w-32 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-20"
        >
          <button
            onClick={() => {
              setOpen(false);
              onDelete(contaId);
            }}
            className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-700 rounded-lg transition"
          >
            Excluir conta
          </button>
        </div>
      )}
    </div>
  );
}


export default function ContasPage() {
  const router = useRouter();

  const [contas, setContas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadContas() {
    const res = await fetch("/api/contas", { cache: "no-store" });
    const data = await res.json();
    setContas(Array.isArray(data) ? data : []);
    setLoading(false);
  }

  useEffect(() => {
    loadContas();
  }, []);

  async function deleteConta(id: number) {
    if (!confirm("Tem certeza que deseja excluir esta conta?")) return;

    await fetch(`/api/contas/${id}`, {
      method: "DELETE",
    });

    loadContas();
  }

  if (loading)
    return (
      <div className="text-white p-10">
        Carregando contas...
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-900 text-white p-10">

      {/* BOTÃO VOLTAR AO DASHBOARD */}
      <button
        onClick={() => router.push("/dashboard")}
        className="mb-8 px-5 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition text-white shadow"
      >
        ⬅️ Voltar ao Dashboard
      </button>

      {/* Título e Botão Nova Conta */}
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-3xl font-bold">Contas</h1>

        <a
          href="/contas/nova"
          className="px-6 py-3 rounded-lg bg-green-600 hover:bg-green-700 transition text-white shadow flex items-center gap-2"
        >
          ➕ Nova Conta
        </a>
      </div>

    {/* GRID DE CONTAS */}
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
  {contas.map((conta) => (
    <div
      key={conta.id}
      className="relative bg-gray-800 p-6 rounded-xl border border-gray-700 shadow flex flex-col justify-between"
    >
      {/* MENU DE 3 PONTINHOS */}
      <div className="absolute top-3 right-3">
        <MenuDots contaId={conta.id} onDelete={deleteConta} />
      </div>

      {/* Título */}
      <div>
        <h2 className="text-xl font-bold">{conta.name}</h2>

        <p className="text-green-400 font-bold text-2xl mt-4">
          {conta.balance.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          })}
        </p>

        <p className="text-sm text-gray-400 mt-2">
          {conta.expenses.length} gastos vinculados
        </p>

        <p className="text-sm text-gray-400">
          {conta.cards.length} cartões vinculados
        </p>
      </div>

      {/* BOTÕES DE AÇÃO */}
      <div className="mt-6 grid grid-cols-2 gap-3">

        {/* Movimentação */}
        <button
          onClick={() => router.push(`/contas/${conta.id}/movimentacoes`)}
          className="group flex flex-col items-center justify-center p-3 rounded-lg 
            bg-gray-700/60 border border-gray-600 hover:bg-purple-600/30 hover:border-purple-500 
            transition-all duration-200"
        >
          <span className="text-purple-400 group-hover:text-purple-300 text-xl">📊</span>
          <span className="text-xs mt-1 text-gray-300 group-hover:text-purple-200">
            Extrato
          </span>
        </button>

        {/* Editar */}
        <a
          href={`/contas/editar/${conta.id}`}
          className="group flex flex-col items-center justify-center p-3 rounded-lg 
            bg-gray-700/60 border border-gray-600 hover:bg-blue-600/30 hover:border-blue-500 
            transition-all duration-200"
        >
          <span className="text-blue-400 group-hover:text-blue-300 text-xl">✏️</span>
          <span className="text-xs mt-1 text-gray-300 group-hover:text-blue-200">
            Editar
          </span>
        </a>

      </div>
    </div>
  ))}
</div>

    </div>
  );
}
