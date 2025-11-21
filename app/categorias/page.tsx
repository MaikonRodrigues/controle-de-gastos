"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

export default function CategoriasPage() {
  const [categorias, setCategorias] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // CATEGORIAS FILTRADAS
  const categoriasEntrada = categorias.filter((c) => c.type === "income");
  const categoriasGasto = categorias.filter((c) => c.type === "expense");

  // BUSCAR CATEGORIAS
  const fetchCategorias = useCallback(async () => {
    try {
      const res = await fetch("/api/categorias", { cache: "no-store" });
      const data = await res.json();
      setCategorias(data);
    } catch (err) {
      console.error("Erro ao buscar categorias:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategorias();
  }, [fetchCategorias]);

  // EXCLUIR
  async function deleteCategoria(id: number) {
    if (!confirm(`Excluir categoria ID ${id}?`)) return;

    const res = await fetch(`/api/categorias/${id}`, {
      method: "DELETE",
    });

    if (res.ok) {
      fetchCategorias();
    } else {
      alert("Erro ao excluir categoria.");
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-10">
      
      {/* VOLTAR */}
      <button
        onClick={() => router.push("/dashboard")}
        className="mb-6 px-4 py-2 bg-gray-700 text-white rounded-xl hover:bg-gray-600 transition"
      >
        ⬅️ Voltar
      </button>

      {/* CABEÇALHO */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Categorias</h1>
        <button
          onClick={() => router.push("/categorias/nova")}
          className="bg-green-600 hover:bg-green-700 px-5 py-2 rounded-xl shadow transition"
        >
          ➕ Nova Categoria
        </button>
      </div>

      {/* CARREGANDO */}
      {loading ? (
        <p className="text-gray-400">Carregando categorias...</p>
      ) : categorias.length === 0 ? (
        <p className="text-gray-400">Nenhuma categoria cadastrada.</p>
      ) : (
        <>
          {/* ========================== */}
          {/* CATEGORIAS DE ENTRADA */}
          {/* ========================== */}
          <h2 className="text-xl font-bold mt-5 mb-3 text-green-400">
            Categorias de Entrada
          </h2>

          {categoriasEntrada.length === 0 ? (
            <p className="text-gray-500 mb-6">
              Nenhuma categoria de entrada.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
              {categoriasEntrada.map((cat) => (
                <div
                  key={cat.id}
                  className="bg-gray-800 border border-gray-700 p-5 rounded-xl shadow flex justify-between items-center"
                >
                  <div>
                    <p className="font-bold text-lg">{cat.name}</p>
                    <p className="text-gray-400 text-sm mt-1">
                      Criado em{" "}
                      {new Date(cat.createdAt).toLocaleDateString("pt-BR")}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => deleteCategoria(cat.id)}
                      className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded-lg transition text-sm"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ========================== */}
          {/* CATEGORIAS DE GASTO */}
          {/* ========================== */}
          <h2 className="text-xl font-bold mt-5 mb-3 text-red-400">
            Categorias de Gasto
          </h2>

          {categoriasGasto.length === 0 ? (
            <p className="text-gray-500 mb-6">Nenhuma categoria de gasto.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categoriasGasto.map((cat) => (
                <div
                  key={cat.id}
                  className="bg-gray-800 border border-gray-700 p-5 rounded-xl shadow flex justify-between items-center"
                >
                  <div>
                    <p className="font-bold text-lg">{cat.name}</p>
                    <p className="text-gray-400 text-sm mt-1">
                      Criado em{" "}
                      {new Date(cat.createdAt).toLocaleDateString("pt-BR")}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => deleteCategoria(cat.id)}
                      className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded-lg transition text-sm"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
