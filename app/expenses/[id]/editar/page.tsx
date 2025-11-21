"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function EditarDespesa() {
  const { id } = useParams();
  const router = useRouter();

  const expenseId = Number(id);

  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");

  useEffect(() => {
    async function loadData() {
      const res = await fetch(`/api/expenses/${expenseId}`);
      const data = await res.json();

      setTitle(data.title ?? "");
      setAmount(String(data.amount ?? ""));
      setLoading(false);
    }

    loadData();
  }, [expenseId]);

  async function handleSubmit(e: any) {
    e.preventDefault();

    await fetch(`/api/expenses/${expenseId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        amount: Number(amount),
      }),
    });

    router.back();
  }

  if (loading) {
    return <div className="min-h-screen bg-gray-900 text-white p-10">Carregando...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-10 flex justify-center">
      <div className="bg-gray-800 p-8 rounded-xl border border-gray-700 max-w-md w-full">
        <h1 className="text-xl font-bold mb-6">Editar Despesa</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-gray-700 p-3 rounded-lg border border-gray-600"
            placeholder="Título"
          />

          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full bg-gray-700 p-3 rounded-lg border border-gray-600"
            placeholder="Valor"
          />

          <button className="w-full bg-blue-600 p-3 rounded-lg hover:bg-blue-500 transition">
            Salvar
          </button>
        </form>

        <button
          onClick={() => router.back()}
          className="block text-gray-400 mt-4 hover:text-white"
        >
          Voltar
        </button>
      </div>
    </div>
  );
}
