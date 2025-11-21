"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function NovaEntrada() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [accountId, setAccountId] = useState("");
  const [categoriaId, setCategoriaId] = useState("");

  const [accounts, setAccounts] = useState([]);
  const [categorias, setCategorias] = useState([]);

  // 🔥 Buscar dados
  useEffect(() => {
    fetch("/api/accounts")
      .then((res) => res.json())
      .then((data) => setAccounts(data));

    fetch("/api/categorias")
      .then((res) => res.json())
      .then((data) => {
        // Filtra categorias de entrada
        const categoriasEntrada = data.filter(
          (cat: any) => cat.type === "income"
        );
        setCategorias(categoriasEntrada);
      });
  }, []);

  async function handleSubmit(e: any) {
    e.preventDefault();

    await fetch("/api/expenses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        amount: Number(amount),
        type: "income",
        accountId: Number(accountId),
        categoryId: categoriaId ? Number(categoriaId) : null,
      }),
    });

    router.push("/dashboard");
  }

  return (
    <div className="min-h-screen bg-gray-900 p-8 flex justify-center items-center">
      <div className="bg-gray-800 p-8 rounded-2xl shadow-xl border border-gray-700 max-w-md w-auto">

        {/* Voltar */}
        <button
          onClick={() => router.push("/dashboard")}
          className="mb-6 px-4 py-2 bg-gray-700 text-white rounded-xl hover:bg-gray-600 transition"
        >
          ⬅️ Voltar
        </button>

        <h1 className="text-2xl font-bold text-white mb-6">Novo Depósito</h1>

        <form onSubmit={handleSubmit} className="space-y-6">

          <input
            placeholder="Descrição da entrada"
            className="w-full p-3 rounded-xl bg-gray-700 text-white border border-gray-600"
            onChange={(e) => setTitle(e.target.value)}
          />

          <input
            type="text"
            inputMode="decimal"
            placeholder="Valor"
            className="w-full p-3 rounded-xl bg-gray-700 text-white border border-gray-600"
            value={amount}
            onChange={(e) => {
              const value = e.target.value;
              const regex = /^[0-9]*[.,]?[0-9]*$/;

              if (value === "" || regex.test(value)) {
                setAmount(value.replace(",", "."));
              }
            }}
            onKeyDown={(e) => {
              if (
                ["e", "E", "+", "-"].includes(e.key) ||
                ((e.key < "0" || e.key > "9") &&
                  e.key !== "." &&
                  e.key !== "," &&
                  e.key !== "Backspace")
              ) {
                e.preventDefault();
              }
            }}
          />

          {/* Seleção de conta */}
          <select
            className="w-full p-3 rounded-xl bg-gray-700 text-white border border-gray-600"
            onChange={(e) => setAccountId(e.target.value)}
          >
            <option value="">Selecione a conta</option>
            {accounts.map((acc: any) => (
              <option key={acc.id} value={acc.id}>
                {acc.name}
              </option>
            ))}
          </select>

          {/* Seleção de categoria de entrada */}
          <select
            className="w-full p-3 rounded-xl bg-gray-700 text-white border border-gray-600"
            value={categoriaId}
            onChange={(e) => setCategoriaId(e.target.value)}
          >
            <option value="">Selecione a categoria</option>

            {categorias.length === 0 ? (
              <option disabled>Nenhuma categoria de entrada cadastrada</option>
            ) : (
              categorias.map((cat: any) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))
            )}
          </select>

          <button className="w-full bg-green-600 text-white p-3 rounded-xl shadow hover:bg-green-700 transition">
            Salvar Entrada
          </button>
        </form>
      </div>
    </div>
  );
}
