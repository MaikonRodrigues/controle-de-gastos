"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Recorrente {
  id: number;
  title: string;
  amount: number;
  type: string;
  installments: number | null;
  startDate: string;
  recurrenceMode: "infinite" | "installments";
  account?: { id: number; name: string | null };
  card?: {
    id: number;
    name: string | null;
    account?: { id: number; name: string | null };
  };
}

export default function RecorrentesPage() {
  const router = useRouter();
  const [recorrentes, setRecorrentes] = useState<Recorrente[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch("/api/recorrentes");
        if (!res.ok) throw new Error("Erro ao carregar recorrentes");

        const data = await res.json();
        setRecorrentes(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        Carregando gastos recorrentes...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-8 flex justify-center">
      <div className="bg-gray-800 p-8 rounded-2xl shadow-xl border border-gray-700 w-full max-w-4xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-white">Gastos Recorrentes</h1>
          <button
            onClick={() => router.push("/nova-saida")}
            className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition"
          >
            + Nova Saída
          </button>
        </div>

        {recorrentes.length === 0 ? (
          <p className="text-gray-300">
            Você ainda não cadastrou nenhum gasto recorrente.
          </p>
        ) : (
          <div className="space-y-4">
            {recorrentes.map((r) => {
              const origem =
                r.card?.name
                  ? `Cartão: ${r.card.name} (${r.card.account?.name ?? "Conta não informada"})`
                  : r.account?.name
                  ? `Conta: ${r.account.name}`
                  : "Origem não informada";

              const modeLabel =
                r.recurrenceMode === "infinite"
                  ? "Todo mês (sem fim)"
                  : r.installments
                  ? `${r.installments} parcelas`
                  : "Parcelado";

              const start = new Date(r.startDate).toLocaleDateString("pt-BR");

              return (
                <div
                  key={r.id}
                  className="bg-gray-900 border border-gray-700 rounded-xl p-4 flex justify-between items-center"
                >
                  <div>
                    <p className="text-white font-semibold">{r.title}</p>
                    <p className="text-gray-300 text-sm">
                      {origem}
                    </p>
                    <p className="text-gray-400 text-xs mt-1">
                      Início: {start} • {modeLabel}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-red-400 font-bold">
                      - R$ {r.amount.toFixed(2)}
                    </p>
                    {/* espaço pra futuro botão de editar/cancelar */}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <button
          onClick={() => router.push("/dashboard")}
          className="mt-6 block w-full text-center text-gray-400 hover:text-white hover:underline"
        >
          Voltar para o dashboard
        </button>
      </div>
    </div>
  );
}
