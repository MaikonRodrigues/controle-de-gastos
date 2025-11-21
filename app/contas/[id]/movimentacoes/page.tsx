"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";

export default function MovimentacoesContaPage() {
  const router = useRouter();
  const { id } = useParams();
  const contaId = Number(id);

  const [movs, setMovs] = useState<any[]>([]);
  const [conta, setConta] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!contaId) return;

    async function load() {
      try {
        const res = await fetch(`/api/contas/${contaId}/movimentacoes`, {
          cache: "no-store",
        });

        const data = await res.json();

        setConta(data.conta || null);
        setMovs(data.movimentacoes || []);
      } catch (err) {
        console.error("Erro ao carregar movimentações:", err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [contaId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        Carregando movimentações...
      </div>
    );
  }

  if (!conta) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        Conta não encontrada.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <button
        onClick={() => router.push("/contas")}
        className="mb-6 px-5 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition text-white shadow"
      >
        ⬅️ Voltar
      </button>

      <h1 className="text-3xl font-bold mb-2">{conta.name}</h1>

      <p className="text-green-400 font-bold text-2xl mb-8">
        {Number(conta.balance || 0).toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL",
        })}
      </p>

      <h2 className="text-xl font-bold mb-4">Movimentações</h2>

      {movs.length === 0 ? (
        <p className="text-gray-400">Nenhuma movimentação registrada.</p>
      ) : (
        <div className="space-y-4">
          {movs.map((m) => (
            <div
              key={m.id}
              className="bg-gray-800 p-4 rounded-lg border border-gray-700 flex justify-between items-center"
            >
              <div>
                <p className="font-semibold text-white">{m.descricao}</p>

                <p className="text-sm text-gray-400">
                  {new Date(m.data).toLocaleDateString("pt-BR", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })}
                </p>

                <p className="text-xs text-gray-500 mt-1 capitalize">
                  {m.tipo}
                </p>
              </div>

              <p
                className={`text-lg font-bold ${
                  m.tipo === "income" ? "text-green-400" : "text-red-400"
                }`}
              >
                {m.tipo === "income" ? "+ " : "- "}
                {Number(Math.abs(m.valor)).toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
