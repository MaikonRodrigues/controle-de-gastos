"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function EditarCartao() {
  const router = useRouter();
  const { id } = useParams();
  const cardId = Number(id);

  const [loading, setLoading] = useState(true);

  const [name, setName] = useState("");
  const [limit, setLimit] = useState("");
  const [closingDay, setClosingDay] = useState("");
  const [dueDay, setDueDay] = useState("");
  const [accountId, setAccountId] = useState("");

  const [accounts, setAccounts] = useState<any[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        const [resCard, resAccounts] = await Promise.all([
          fetch(`/api/cards/${cardId}`, { cache: "no-store" }),
          fetch("/api/accounts", { cache: "no-store" }),
        ]);

        if (!resCard.ok) throw new Error("Cartão não encontrado");

        const [card, accountsData] = await Promise.all([
          resCard.json(),
          resAccounts.json(),
        ]);

        setAccounts(accountsData);

        setName(card.name ?? "");
        setLimit(String(card.limit ?? ""));
        setClosingDay(String(card.closingDay ?? ""));
        setDueDay(String(card.dueDay ?? ""));
        setAccountId(String(card.accountId ?? ""));
      } catch (err) {
        console.error("Erro ao carregar dados:", err);
      }

      setLoading(false);
    }

    if (!isNaN(cardId)) {
      loadData();
    }
  }, [cardId]);

  function diasDoMesAtual() {
    const hoje = new Date();
    return new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0).getDate();
  }


  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    await fetch(`/api/cards/${cardId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        limit: Number(limit),
        closingDay: Number(closingDay),
        dueDay: Number(dueDay),
        accountId: Number(accountId),
      }),
    });

    router.push("/cartoes");
  }

  if (!id || isNaN(cardId)) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center text-red-400 font-semibold">
        ID do cartão inválido.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-gray-300 p-10 flex items-center justify-center">
        Carregando informações do cartão...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-8 flex justify-center">
      <div className="bg-gray-800 p-8 rounded-2xl shadow-xl border border-gray-700 max-w-md w-full">

        {/* Voltar */}
        <button
          onClick={() => router.push("/cartoes")}
          className="mb-6 px-4 py-2 bg-gray-700 text-white rounded-xl hover:bg-gray-600 transition"
        >
          ⬅️ Voltar
        </button>

        {/* Título */}
        <h1 className="text-2xl font-bold text-white mb-6">
          Editar Cartão
        </h1>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="space-y-6">

          <div>
            <label className="block mb-1 font-medium text-gray-300">
              Nome do cartão
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Nubank"
              className="w-full p-3 rounded-xl bg-gray-700 text-white border border-gray-600 placeholder-gray-400"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium text-gray-300">
              Limite
            </label>
            <input
              type="number"
              value={limit}
              onChange={(e) => setLimit(e.target.value)}
              placeholder="Ex: 3000"
              className="w-full p-3 rounded-xl bg-gray-700 text-white border border-gray-600 placeholder-gray-400"
            />
          </div>

          {/* DIA DE FECHAMENTO */}
          <div>
            <label className="block mb-1 font-medium text-gray-300">
              Dia de fechamento
            </label>

            <input
              type="number"
              value={closingDay}
              min={1}
              max={diasDoMesAtual()}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, ""); // remove letras
                const num = Number(value);

                if (num < 1 || num > diasDoMesAtual()) return; // trava fora do limite

                setClosingDay(value);
              }}
              placeholder="Ex: 10"
              className="w-full p-3 rounded-xl bg-gray-700 text-white border border-gray-600 placeholder-gray-400"
            />

          </div>

          {/* DIA DE VENCIMENTO */}
          <div>
            <label className="block mb-1 font-medium text-gray-300">
              Dia de vencimento
            </label>

            <input
              type="number"
              value={dueDay}
              min={1}
              max={diasDoMesAtual()}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, "");
                const num = Number(value);

                if (num < 1 || num > diasDoMesAtual()) return;

                setDueDay(value);
              }}
              placeholder="Ex: 20"
              className="w-full p-3 rounded-xl bg-gray-700 text-white border border-gray-600 placeholder-gray-400"
            />


          </div>

          <div>
            <label className="block mb-1 font-medium text-gray-300">
              Conta vinculada
            </label>
            <select
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
              className="w-full p-3 rounded-xl bg-gray-700 text-white border border-gray-600"
            >
              <option value="" className="text-gray-600">
                Selecione
              </option>
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id} className="text-black">
                  {acc.name}
                </option>
              ))}
            </select>
          </div>

          <button
            disabled={loading}
            className="w-full bg-blue-600 text-white p-3 rounded-xl shadow hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Salvar Alterações
          </button>
        </form>
      </div>
    </div>
  );
}
