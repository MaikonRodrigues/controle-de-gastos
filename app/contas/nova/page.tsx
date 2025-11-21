"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NovaConta() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [balance, setBalance] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: any) {
    e.preventDefault();
    setLoading(true);

    const saldoConvertido = Number(balance.replace(",", "."));

    const res = await fetch("/api/contas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        balance: saldoConvertido,
        userId: 1, // ajuste depois para pegar da sessão
      }),
    });

    setLoading(false);

    if (res.ok) router.push("/contas");
    else alert("Erro ao salvar conta");
  }

  return (
    <div className="min-h-screen bg-gray-900 p-8 flex justify-center">
      <div className="bg-gray-800 p-8 rounded-2xl shadow-xl border border-gray-700 max-w-md w-full">

        <h1 className="text-2xl font-bold text-white mb-6">
          Nova Conta
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <input
            placeholder="Nome da conta (ex: Nubank, Caixa, Inter...)"
            className="w-full p-3 rounded-xl bg-gray-700 text-white border border-gray-600 placeholder-gray-400"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <input
            type="text"
            inputMode="decimal"
            placeholder="Saldo atual (ex: 2500,50)"
            className="w-full p-3 rounded-xl bg-gray-700 text-white border border-gray-600 placeholder-gray-400"
            value={balance}
            onChange={(e) => setBalance(e.target.value)}
            required
          />

          <button
            className="w-full bg-blue-600 text-white p-3 rounded-xl shadow hover:bg-blue-700 transition disabled:bg-gray-500"
            disabled={loading}
          >
            {loading ? "Salvando..." : "Salvar Conta"}
          </button>
        </form>

        {/* VOLTAR PARA LISTA DE CONTAS */}
        <button
          onClick={() => router.push("/contas")}
          className="mt-6 block w-full text-center text-gray-400 hover:text-white hover:underline"
        >
          Voltar
        </button>

      

      </div>
    </div>
  );
}
