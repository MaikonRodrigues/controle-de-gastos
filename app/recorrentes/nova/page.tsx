"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function NovaRecorrente() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [paymentType, setPaymentType] = useState("account"); // account | card

  const [accounts, setAccounts] = useState([]);
  const [cards, setCards] = useState([]);

  const [accountId, setAccountId] = useState("");
  const [cardId, setCardId] = useState("");

  useEffect(() => {
    fetch("/api/accounts")
      .then((res) => res.json())
      .then((data) => setAccounts(data));

    fetch("/api/cards")
      .then((res) => res.json())
      .then((data) => setCards(data));
  }, []);

  async function handleSubmit(e: any) {
    e.preventDefault();

    await fetch("/api/recorrentes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        amount: Number(amount),
        type: paymentType,
        accountId: paymentType === "account" ? Number(accountId) : null,
        cardId: paymentType === "card" ? Number(cardId) : null,
      }),
    });

    router.push("/recorrentes");
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-10 flex justify-center">
      <div className="bg-gray-800 p-8 rounded-2xl shadow-xl border border-gray-700 max-w-md w-full">

        <h1 className="text-3xl font-bold mb-6">Novo Recorrente</h1>

        <form onSubmit={handleSubmit} className="space-y-6">

          <input
            placeholder="Nome do recorrente (ex: Netflix, Internet...)"
            className="w-full border border-gray-600 p-3 rounded-xl bg-gray-700 text-white placeholder-gray-400"
            onChange={(e) => setTitle(e.target.value)}
          />

          <input
            type="number"
            placeholder="Valor mensal"
            className="w-full border border-gray-600 p-3 rounded-xl bg-gray-700 text-white placeholder-gray-400"
            onChange={(e) => setAmount(e.target.value)}
          />

          {/* Tipo */}
          <div className="bg-gray-700 border border-gray-600 p-4 rounded-xl">
            <p className="text-gray-300 font-semibold mb-2">Tipo:</p>

            <div className="flex gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="payment"
                  checked={paymentType === "account"}
                  onChange={() => setPaymentType("account")}
                />
                Conta
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="payment"
                  checked={paymentType === "card"}
                  onChange={() => setPaymentType("card")}
                />
                Cartão
              </label>
            </div>
          </div>

          {/* Conta */}
          {paymentType === "account" && (
            <select
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-xl text-white"
              onChange={(e) => setAccountId(e.target.value)}
            >
              <option value="">Selecione a conta</option>
              {accounts.map((acc: any) => (
                <option key={acc.id} value={acc.id}>
                  {acc.name}
                </option>
              ))}
            </select>
          )}

          {/* Cartão */}
          {paymentType === "card" && (
            <select
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-xl text-white"
              onChange={(e) => setCardId(e.target.value)}
            >
              <option value="">Selecione o cartão</option>
              {cards.map((card: any) => (
                <option key={card.id} value={card.id}>
                  {card.name} — ({card.account.name})
                </option>
              ))}
            </select>
          )}

          <button className="w-full bg-blue-600 text-white p-3 rounded-xl shadow hover:bg-blue-700 transition">
            Salvar Recorrente
          </button>
        </form>

        <button
          onClick={() => router.push("/recorrentes")}
          className="mt-6 block w-full text-center text-gray-400 hover:text-white transition"
        >
          Voltar
        </button>
      </div>
    </div>
  );
}
