"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
} from "chart.js";

ChartJS.register(LineElement, PointElement, CategoryScale, LinearScale, Tooltip);

export default function DetalharCartao() {
  const router = useRouter();
  const { id } = useParams();
  const cardId = Number(id);

  const [card, setCard] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Aba ativa
  const [activeTab, setActiveTab] = useState(0);

  // Simulação
  const [simulacaoAtiva, setSimulacaoAtiva] = useState(false);
  const [percentualReducao, setPercentualReducao] = useState(0);

  async function fetchCardDetails() {
    try {
      const res = await fetch(`/api/cards/${cardId}`, { cache: "no-store" });
      if (!res.ok) throw new Error("Erro ao buscar o cartão");

      const data = await res.json();
      setCard(data);
    } catch (err) {
      console.error("Erro ao carregar dados do cartão:", err);
    }

    setLoading(false);
    router.refresh();
  }


  useEffect(() => {
    if (!isNaN(cardId)) fetchCardDetails();
  }, [cardId]);

  if (loading) return pageError("Carregando detalhes do cartão...");
  if (!card) return pageError("Cartão não encontrado.");

  // ----------------------------------------------------
  // FUNÇÕES DE DATA
  // ----------------------------------------------------
  function addMonths(date: Date, months: number) {
    const clone = new Date(date);
    clone.setMonth(clone.getMonth() + months);
    return clone;
  }

  function isSameMonth(dateA: Date, dateB: Date) {
    return (
      dateA.getFullYear() === dateB.getFullYear() &&
      dateA.getMonth() === dateB.getMonth()
    );
  }

  // ----------------------------------------------------
  // MESES FUTUROS (0 = atual + 5 meses)
  // ----------------------------------------------------
  const today = new Date();
  const meses = Array.from({ length: 6 }, (_, i) => addMonths(today, i));

  // ----------------------------------------------------
  // FUNÇÃO PARA CALCULAR FATURA DE QUALQUER MÊS
  // ----------------------------------------------------
  function getFaturaDoMes(mesBase: Date) {
    const despesasNormais =
      card.expenses?.filter((exp: any) =>
        isSameMonth(new Date(exp.createdAt), mesBase)
      ) ?? [];

    const recorrentes =
      card.recurring?.filter((r: any) => {
        const start = new Date(r.startDate);

        if (r.recurrenceMode === "infinite") {
          return mesBase >= start;
        }

        if (r.recurrenceMode === "installments") {
          const index =
            (mesBase.getFullYear() - start.getFullYear()) * 12 +
            (mesBase.getMonth() - start.getMonth());

          return index >= 0 && index < r.installments;
        }

        return false;
      }) ?? [];

    // CALCULA VALOR TOTAL
    let total =
      despesasNormais.reduce((s: number, e: any) => s + e.amount, 0) +
      recorrentes.reduce((s: number, r: any) => s + r.amount, 0);

    // Ajuste de simulação
    if (simulacaoAtiva && percentualReducao > 0) {
      total = total * (1 - percentualReducao / 100);
    }

    return {
      despesasNormais,
      recorrentes,
      total,
    };
  }

  // Fatura da aba ativa
  const fatura = getFaturaDoMes(meses[activeTab]);

  // ----------------------------------------------------
  // GRÁFICO — EVOLUÇÃO DA FATURA
  // ----------------------------------------------------
  const labels = meses.map((mes) =>
    mes.toLocaleDateString("pt-BR", { month: "short" })
  );

  const dataGrafico = {
    labels,
    datasets: [
      {
        label: "Fatura",
        data: meses.map((mes) => getFaturaDoMes(mes).total),
        borderColor: "rgb(255, 99, 132)",
        backgroundColor: "rgba(255, 99, 132, 0.3)",
        borderWidth: 2,
        tension: 0.4,
      },
    ],
  };
  // EDITAR DESPESA NORMAL
  function editarDespesa(id: number) {
    router.push(`/expenses/${id}/editar`);
  }

  // EXCLUIR DESPESA NORMAL
  async function excluirDespesa(id: number) {
    if (!confirm("Deseja realmente excluir esta despesa?")) return;

    await fetch(`/api/expenses/${id}`, { method: "DELETE" });

    await fetchCardDetails(); // 🔥 ATUALIZA IMEDIATO
  }


  // EDITAR RECORRENTE
  function editarRecorrente(id: number) {
    router.push(`/recorrentes/${id}/editar`);
  }

  // EXCLUIR RECORRENTE
  async function excluirRecorrente(id: number) {
    if (!confirm("Deseja realmente excluir este gasto recorrente?")) return;

    await fetch(`/api/recorrentes/${id}`, { method: "DELETE" });

    await fetchCardDetails(); // 🔥 ATUALIZA IMEDIATO
  }

  // ----------------------------------------------------
  // UI PRINCIPAL
  // ----------------------------------------------------
  return (
    <div className="min-h-screen bg-gray-900 text-white p-10">

      <div className="flex gap-3 mt-6 mb-6 ">

        {/* Faturas */}
        <button
          onClick={() => router.push(`/cartoes/${card.id}/faturas`)}
          className="flex-1 p-2 rounded-lg bg-purple-600 hover:bg-purple-700 transition text-center"
        >
          📄 Ver Faturas
        </button>

        {/* Voltar */}
        <button
          onClick={() => router.push("/cartoes")}
          className="flex-1 p-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition text-center"
        >
          ⬅️ Voltar
        </button>

      </div>


      {/* CABEÇALHO */}
      <h1 className="text-3xl font-bold mb-6 flex items-center justify-between flex-wrap gap-4">
        <span>{card.name}</span>

        {/* Card da Fatura */}
        <div className="bg-red-700/40 border border-red-500/50 px-6 py-4 rounded-xl shadow-lg text-right">
          <p className="text-sm text-red-300 uppercase tracking-wide font-semibold">
            Fatura — {meses[activeTab].toLocaleDateString("pt-BR", { month: "short", year: "numeric" })}
          </p>
          <p className="text-red-400 font-bold text-3xl md:text-4xl mt-1">
            {fatura.total.toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })}
          </p>
        </div>
      </h1>

      {/* ABAS */}
      <div className="flex gap-2 mt-8 mb-6 overflow-x-auto pb-2">
        {meses.map((mes, i) => (
          <button
            key={i}
            onClick={() => setActiveTab(i)}
            className={`px-4 py-2 rounded-lg border transition text-sm ${activeTab === i
              ? "bg-red-600 border-red-500 text-white"
              : "bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700"
              }`}
          >
            {mes.toLocaleDateString("pt-BR", { month: "short" })}
          </button>
        ))}
      </div>

      {/* GRÁFICO */}
      <div className="bg-gray-800 p-6 rounded-xl shadow-xl border border-gray-700 mb-10">
        <h3 className="text-xl mb-4 font-semibold">Evolução das Faturas</h3>
        <Line data={dataGrafico} />
      </div>


      {/* MODAL DE SIMULAÇÃO */}
      {simulacaoAtiva && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-gray-800 p-6 rounded-xl w-full max-w-md border border-gray-600 shadow-xl">

            <h3 className="text-xl font-bold mb-4">Simular Redução</h3>

            <input
              type="number"
              className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 text-white mb-4"
              placeholder="Ex: 20 (para reduzir 20%)"
              value={percentualReducao}
              onChange={(e) => setPercentualReducao(Number(e.target.value))}
            />

            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setPercentualReducao(0);
                  setSimulacaoAtiva(false);
                }}
                className="px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600"
              >
                Cancelar
              </button>

              <button
                onClick={() => setSimulacaoAtiva(false)}
                className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-500"
              >
                Aplicar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Listas */}
      <h2 className="text-2xl font-bold mb-4">
        Despesas normais — {meses[activeTab].toLocaleDateString("pt-BR", { month: "long" })}
      </h2>

      {fatura.despesasNormais.length === 0 ? (
        <p className="text-gray-400 mb-8">Nenhuma despesa neste mês.</p>
      ) : (
        <ul className="space-y-4 mb-10">
          {fatura.despesasNormais.map((exp: any) => (
            <li key={exp.id} className="bg-gray-800 p-4 rounded-xl border border-gray-700">

              <div className="flex justify-between items-center">
                <p className="font-bold text-white">{exp.title}</p>

                <div className="flex gap-3 text-sm">
                  <button
                    onClick={() => editarDespesa(exp.id)}
                    className="text-blue-400 hover:text-blue-300 transition"
                  >
                    ✏️ Editar
                  </button>

                  <button
                    onClick={() => excluirDespesa(exp.id)}
                    className="text-red-400 hover:text-red-300 transition"
                  >
                    🗑 Excluir
                  </button>
                </div>
              </div>

              <p className="text-red-400 mt-1">
                {exp.amount.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
              </p>
            </li>

          ))}
        </ul>
      )}

      {/* Recorrentes */}
      <h2 className="text-2xl font-bold mb-4">Gastos Recorrentes</h2>

      {fatura.recorrentes.length === 0 ? (
        <p className="text-gray-400">Nenhum recorrente neste mês.</p>
      ) : (
        <ul className="space-y-4">
          {fatura.recorrentes.map((r: any) => {
            const start = new Date(r.startDate);
            const parcelaAtual =
              (meses[activeTab].getFullYear() - start.getFullYear()) * 12 +
              (meses[activeTab].getMonth() - start.getMonth()) + 1;

            return (
              <li key={r.id} className="bg-gray-800 p-4 rounded-xl border border-gray-700">
                <div className="flex justify-between items-center">
                  <p className="font-bold text-white">{r.title}</p>

                  <div className="flex gap-3 text-sm">
                    <button
                      onClick={() => router.push(`/recorrentes/${r.id}/editar`)}
                      className="text-blue-400 hover:text-blue-300 transition"
                    >
                      ✏️ Editar
                    </button>

                    <button
                      onClick={async () => {
                        if (!confirm("Excluir este recorrente?")) return;
                        await fetch(`/api/recorrentes/${r.id}`, { method: "DELETE" });
                        router.refresh();
                      }}
                      className="text-red-400 hover:text-red-300 transition"
                    >
                      🗑 Excluir
                    </button>

                    <button
                      onClick={async () => {
                        if (!confirm("Quitar apenas esta parcela?")) return;
                        await fetch(`/api/recorrentes/${r.id}/quitar-parcela`, {
                          method: "POST",
                        });
                        router.refresh();
                      }}
                      className="text-yellow-400 hover:text-yellow-300 transition"
                    >
                      💸 Quitar parcela
                    </button>

                    {r.recurrenceMode === "installments" && r.installments > 0 && (
                      <button
                        onClick={async () => {
                          if (!confirm("Quitar TODAS as parcelas restantes?")) return;
                          await fetch(`/api/recorrentes/${r.id}/quitar-todas`, {
                            method: "POST",
                          });
                          router.refresh();
                        }}
                        className="text-orange-400 hover:text-orange-300 transition"
                      >
                        ✅ Quitar todas
                      </button>
                    )}
                  </div>
                </div>

                <p className="text-red-400 mt-1">
                  {r.amount.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                </p>

                {r.recurrenceMode === "installments" && (
                  <p className="text-gray-300 text-sm mt-1">
                    Parcela {parcelaAtual} de {r.installments}
                  </p>
                )}

                {r.recurrenceMode === "infinite" && (
                  <p className="text-gray-300 text-sm mt-1">Todo mês</p>
                )}
              </li>


            );
          })}
        </ul>
      )}
    </div>
  );
}

function pageError(msg: string) {
  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
      {msg}
    </div>
  );
}
