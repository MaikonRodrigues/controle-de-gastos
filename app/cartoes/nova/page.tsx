"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function NovoCartao() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [limit, setLimit] = useState("");
  const [closingDay, setClosingDay] = useState("");
  const [dueDay, setDueDay] = useState("");
  const [accountId, setAccountId] = useState("");
  const [accounts, setAccounts] = useState([]);

  useEffect(() => {
    fetch("/api/accounts")
      .then((res) => res.json())
      .then((data) => setAccounts(data));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    await fetch("/api/cards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        limit: Number(limit),
        closingDay: Number(closingDay),
        dueDay: Number(dueDay),
        accountId: Number(accountId),
        userId: 1,
      }),
    });

    router.push("/cartoes");
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

        <h1 className="text-2xl font-bold text-white mb-6">
          Novo Cartão
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">

          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nome do cartão (ex: Nubank Gold)"
            className="w-full p-3 rounded-xl bg-gray-700 text-white border border-gray-600 placeholder-gray-400"
          />

          <input
            type="number"
            value={limit}
            onChange={(e) => setLimit(e.target.value)}
            placeholder="Limite do cartão"
            className="w-full p-3 rounded-xl bg-gray-700 text-white border border-gray-600 placeholder-gray-400"
          />

          <input
            type="number"
            value={closingDay}
            onChange={(e) => setClosingDay(e.target.value)}
            placeholder="Dia de fechamento"
            className="w-full p-3 rounded-xl bg-gray-700 text-white border border-gray-600 placeholder-gray-400"
          />

          <input
            type="number"
            value={dueDay}
            onChange={(e) => setDueDay(e.target.value)}
            placeholder="Dia de vencimento"
            className="w-full p-3 rounded-xl bg-gray-700 text-white border border-gray-600 placeholder-gray-400"
          />

          <select
            value={accountId}
            onChange={(e) => setAccountId(e.target.value)}
            className="w-full p-3 rounded-xl bg-gray-700 text-white border border-gray-600"
          >
            <option value="" className="text-gray-600">
              Selecione a conta vinculada
            </option>

            {accounts.map((acc: any) => (
              <option key={acc.id} value={acc.id} className="text-black">
                {acc.name}
              </option>
            ))}
          </select>

          <button
            className="w-full bg-blue-600 text-white p-3 rounded-xl shadow hover:bg-blue-700 transition"
          >
            Salvar Cartão
          </button>
        </form>
      </div>
    </div>
  );
}
