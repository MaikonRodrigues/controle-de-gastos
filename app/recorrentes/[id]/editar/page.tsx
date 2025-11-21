"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function EditarRecorrente() {
  const { id } = useParams();
  const router = useRouter();

  const recurringId = Number(id);

  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [installments, setInstallments] = useState("");
  const [recurrenceMode, setRecurrenceMode] = useState<"installments" | "infinite">(
    "installments"
  );

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/recorrentes/${recurringId}`);
      const data = await res.json();

      setTitle(data.title ?? "");
      setAmount(String(data.amount ?? ""));
      setInstallments(data.installments ? String(data.installments) : "");
      setRecurrenceMode(data.recurrenceMode === "infinite" ? "infinite" : "installments");
      setLoading(false);
    }

    load();
  }, [recurringId]);

  async function salvar(e: any) {
    e.preventDefault();

    await fetch(`/api/recorrentes/${recurringId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        amount: Number(amount),
        installments: recurrenceMode === "installments"
          ? (installments ? Number(installments) : null)
          : null,
        recurrenceMode,
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
        <h1 className="text-xl font-bold mb-6">Editar Recorrente</h1>

        <form onSubmit={salvar} className="space-y-4">
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

          <select
            value={recurrenceMode}
            onChange={(e) =>
              setRecurrenceMode(e.target.value === "infinite" ? "infinite" : "installments")
            }
            className="w-full bg-gray-700 p-3 rounded-lg border border-gray-600"
          >
            <option value="installments">Parcelado</option>
            <option value="infinite">Recorrente infinito</option>
          </select>

          {recurrenceMode === "installments" && (
            <input
              type="number"
              value={installments}
              onChange={(e) => setInstallments(e.target.value)}
              className="w-full bg-gray-700 p-3 rounded-lg border border-gray-600"
              placeholder="Número de parcelas"
            />
          )}

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
