"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function FaturasCartaoPage() {
  const router = useRouter();
  const { id } = useParams();
  const cardId = Number(id);

  const [card, setCard] = useState<any>(null);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(0);
  const [paying, setPaying] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<string>("");

  async function loadData() {
    try {
      const [resCard, resAccounts] = await Promise.all([
        fetch(`/api/cards/${cardId}?full=1`, { cache: "no-store" }),
        fetch("/api/accounts", { cache: "no-store" }),
      ]);

      setCard(await resCard.json());
      setAccounts(await resAccounts.json());
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  }

  useEffect(() => {
    if (!isNaN(cardId)) loadData();
  }, [cardId]);

  if (loading) return pageError("Carregando...");
  if (!card) return pageError("Cartão não encontrado.");

  // ---------------------------------------------
  // Helpers de data
  // ---------------------------------------------
  function addMonths(date: Date, months: number) {
    const clone = new Date(date);
    clone.setMonth(clone.getMonth() + months);
    return clone;
  }

  function isSameMonth(d1: Date, d2: Date) {
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth()
    );
  }

  const today = new Date();
  const meses = Array.from({ length: 6 }, (_, i) => addMonths(today, i));
  const mesRef = meses[selectedMonth];
  const refMonth = mesRef.getMonth() + 1;
  const refYear = mesRef.getFullYear();

  // ---------------------------------------------
  // Cálculo da fatura (mesma lógica que você já usava)
  // ---------------------------------------------
  function calcularFatura(mesBase: Date) {
    const despesasNormais =
      card.expenses?.filter((exp: any) =>
        isSameMonth(new Date(exp.createdAt), mesBase)
      ) ?? [];

    const recorrentes =
      card.recurring?.filter((r: any) => {
        const start = new Date(r.startDate);

        if (r.recurrenceMode === "infinite") return mesBase >= start;

        if (r.recurrenceMode === "installments") {
          const index =
            (mesBase.getFullYear() - start.getFullYear()) * 12 +
            (mesBase.getMonth() - start.getMonth());

          return index >= 0 && index < r.installments;
        }

        return false;
      }) ?? [];

    const total =
      despesasNormais.reduce((s: number, e: any) => s + e.amount, 0) +
      recorrentes.reduce((s: number, r: any) => s + r.amount, 0);

    return { despesasNormais, recorrentes, total };
  }

  const faturaAtual = calcularFatura(mesRef);

  // ---------------------------------------------
  // Regra: ciclo fechado?
  // ---------------------------------------------
  function cicloFechado(baseMonth: Date, closeDay: number) {
    const hoje = new Date();
    const dataFechamento = new Date(
      baseMonth.getFullYear(),
      baseMonth.getMonth(),
      closeDay
    );
    return hoje >= dataFechamento;
  }

  const cicloEstaFechado = cicloFechado(mesRef, card.closeDay);

  // ---------------------------------------------
  // STATUS baseado em invoice (card.invoices ou card.paidInvoices)
  // Aqui assumo que o card vem com invoices ou paidInvoices (ajuste o nome se preciso)
  // ---------------------------------------------
  const isPaid =
    card.invoices?.some(
      (inv: any) =>
        inv.month === refMonth &&
        inv.year === refYear &&
        inv.paid === true
    ) ??
    card.paidInvoices?.some(
      (p: any) => p.month === refMonth && p.year === refYear
    ) ??
    false;

  const totalVisivel = isPaid ? 0 : faturaAtual.total;

  // ---------------------------------------------
  // PAGAR FATURA — segue a regra que você definiu
  // ---------------------------------------------
  async function pagarFatura() {
    if (!selectedAccount) return alert("Selecione uma conta.");

    setPaying(true);

    try {
      const res = await fetch(`/api/invoices/pay-manual`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cardId,
          accountId: Number(selectedAccount),
          amount: faturaAtual.total,
          month: refMonth,
          year: refYear,
          cycleClosed: cicloEstaFechado,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data?.error || "Erro ao pagar fatura.");
      } else {
        if (cicloEstaFechado) {
          alert("Fatura paga e registrada como quitada!");
        } else {
          alert(
            "Despesas abatidas! A fatura continua aberta até o fechamento do ciclo."
          );
        }
        await loadData();
      }
    } catch (e) {
      console.error(e);
      alert("Erro ao pagar fatura.");
    } finally {
      setPaying(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-10 flex justify-center">
      <div className="w-full max-w-4xl bg-gray-850">

        {/* Voltar */}
        <button
          onClick={() => router.push("/cartoes")}
          className="mb-6 px-4 py-2 bg-gray-700 rounded-xl hover:bg-gray-600 transition"
        >
          ⬅️ Voltar
        </button>

        {/* Título */}
        <h1 className="text-3xl font-bold mb-1">
          Faturas do Cartão {card.name}
        </h1>

        {/* Subtítulo ciclo */}
        <p className="text-sm text-gray-400 mb-4">
          Fechamento dia {card.closeDay} • Vencimento dia {card.dueDay}
        </p>

        {/* STATUS */}
        <div className="mb-6 flex items-center gap-3">
          {isPaid ? (
            <span className="px-3 py-1 rounded-lg bg-green-700/50 text-green-300 font-semibold">
              pago
            </span>
          ) : (
            <span className="px-3 py-1 rounded-lg bg-red-700/50 text-red-300 font-semibold">
              em aberto
            </span>
          )}

          <span className="text-xs text-gray-400">
            {cicloEstaFechado
              ? "ciclo fechado"
              : "ciclo ainda em andamento"}
          </span>
        </div>

        {/* Filtro de mês */}
        <div className="mb-6">
          <select
            className="w-full bg-gray-800 border border-gray-700 p-3 rounded-lg text-white"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
          >
            {meses.map((m, i) => (
              <option key={i} value={i}>
                {m.toLocaleDateString("pt-BR", {
                  month: "long",
                  year: "numeric",
                })}
              </option>
            ))}
          </select>
        </div>

        {/* TOTAL */}
        <div className="bg-gray-800 border border-gray-700 p-6 rounded-xl shadow">
          <p className="text-xl font-bold">
            Total da fatura:{" "}
            <span className={isPaid ? "text-green-400" : "text-red-400"}>
              {totalVisivel.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })}
            </span>
          </p>

          {isPaid ? (
            <p className="mt-2 text-green-400 text-sm">
              ✔ Esta fatura já foi quitada.
            </p>
          ) : (
            <>
              {/* Seleção da conta */}
              <select
                className="mt-4 w-full bg-gray-700 border border-gray-600 p-3 rounded-lg text-white"
                value={selectedAccount}
                onChange={(e) => setSelectedAccount(e.target.value)}
              >
                <option value="">Selecione a conta</option>
                {accounts.map((acc: any) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name} —{" "}
                    {acc.balance.toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </option>
                ))}
              </select>

              {/* Botão pagar */}
              <button
                onClick={pagarFatura}
                disabled={paying}
                className="mt-4 w-full bg-blue-600 hover:bg-blue-700 p-3 rounded-xl text-white font-semibold"
              >
                {paying
                  ? "Processando..."
                  : cicloEstaFechado
                  ? "Pagar fatura"
                  : "Abater despesas (pagamento adiantado)"}
              </button>
            </>
          )}

          {/* Recorrentes */}
          {faturaAtual.recorrentes.length > 0 && (
            <div className="mt-6 bg-gray-700/40 p-3 rounded-lg border border-gray-600">
              <p className="text-sm font-semibold text-yellow-300 mb-2">
                Gastos Recorrentes
              </p>
              {faturaAtual.recorrentes.map((r: any) => (
                <div key={r.id} className="flex justify-between text-sm mb-1">
                  <span>{r.title}</span>
                  <span className="text-yellow-300">
                    {r.amount.toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Despesas normais */}
          {faturaAtual.despesasNormais.length > 0 && (
            <div className="mt-6 bg-gray-700/40 p-3 rounded-lg border border-gray-600">
              <p className="text-sm font-semibold text-blue-300 mb-2">
                Despesas Normais
              </p>
              {faturaAtual.despesasNormais.map((e: any) => (
                <div key={e.id} className="flex justify-between text-sm mb-1">
                  <span>{e.title}</span>
                  <span className="text-blue-300">
                    {e.amount.toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
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
