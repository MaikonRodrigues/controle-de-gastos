"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NovaCategoria() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [type, setType] = useState<"income" | "expense">("expense"); // padrão: gasto
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    if (!name.trim()) {
      alert("Digite um nome válido para a categoria.");
      setLoading(false);
      return;
    }

    const res = await fetch("/api/categorias", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim(), type }),
    });

    setLoading(false);

    if (res.ok) router.push("/categorias");
    else alert("Erro ao criar categoria");
  }

  return (
    <div className="min-h-screen bg-gray-900 p-8 flex justify-center items-start">
      <div className="bg-gray-800 p-8 rounded-2xl shadow-xl border border-gray-700 w-full max-w-md">

        <h1 className="text-2xl font-bold text-white mb-6">Nova Categoria</h1>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Nome da categoria */}
          <input
            placeholder="Nome da categoria"
            className="w-full p-3 rounded-xl bg-gray-700 text-white border border-gray-600 placeholder-gray-400"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          {/* Tipo */}
          <label className="text-gray-300 font-medium block">Tipo da Categoria</label>
          <select
            className="w-full p-3 rounded-xl bg-gray-700 text-white border border-gray-600"
            value={type}
            onChange={(e) => setType(e.target.value as "income" | "expense")}
          >
            <option value="income">Categoria de Entrada</option>
            <option value="expense">Categoria de Gasto</option>
          </select>

          {/* Botão salvar */}
          <button
            disabled={loading}
            className="w-full bg-blue-600 text-white p-3 rounded-xl shadow hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? "Salvando..." : "Salvar Categoria"}
          </button>

        </form>

        <button
          onClick={() => router.push("/categorias")}
          className="mt-6 block w-full text-center text-gray-400 hover:text-white hover:underline"
        >
          Voltar
        </button>
      </div>
    </div>
  );
}
