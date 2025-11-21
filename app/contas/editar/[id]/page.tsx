"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";

export default function EditarConta() {
  const router = useRouter();
  const { id } = useParams();
  const contaId = Number(id);

  const [name, setName] = useState("");
  const [balance, setBalance] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadData() {
      const res = await fetch(`/api/contas/${contaId}`, { cache: "no-store" });

      if (!res.ok) {
        alert("Erro ao carregar conta");
        router.push("/contas");
        return;
      }

      const data = await res.json();

      setName(data.name);
      setBalance(String(data.balance).replace(".", ","));

      setLoading(false);
    }

    if (!isNaN(contaId)) loadData();
  }, [contaId, router]);

  async function handleSubmit(e: any) {
    e.preventDefault();
    setSaving(true);

    const saldoConvertido = Number(balance.replace(",", "."));

    const res = await fetch(`/api/contas/${contaId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        balance: saldoConvertido,
      }),
    });

    setSaving(false);

    if (res.ok) router.push("/contas");
    else alert("Erro ao salvar alterações");
  }

  if (loading)
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">
        Carregando dados...
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-900 p-8 flex justify-center items-center">

      <div className="bg-gray-800 p-8 rounded-2xl shadow-xl border border-gray-700 max-w-md w-auto">
        {/* Voltar */}
        <button
          onClick={() => router.push("/contas")}
          className="mb-6 px-4 py-2 bg-gray-700 text-white rounded-xl hover:bg-gray-600 transition"
        >
          ⬅️ Voltar
        </button>
        <h1 className="text-2xl font-bold text-white mb-6">
          Editar Conta
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">

          <input
            placeholder="Nome da conta"
            className="w-full p-3 rounded-xl bg-gray-700 text-white border border-gray-600"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <input
            type="text"
            inputMode="decimal"
            placeholder="Saldo (ex: 2500,00)"
            className="w-full p-3 rounded-xl bg-gray-700 text-white border border-gray-600"
            value={balance}
            onChange={(e) => setBalance(e.target.value)}
            required
          />

          <button
            className="w-full bg-blue-600 text-white p-3 rounded-xl shadow hover:bg-blue-700 transition disabled:bg-gray-600"
            disabled={saving}
          >
            {saving ? "Salvando..." : "Salvar Alterações"}
          </button>
        </form>
      </div>
    </div>
  );
}
