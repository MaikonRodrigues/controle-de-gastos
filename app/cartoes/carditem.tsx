"use client";

import { useRouter } from "next/navigation";

export default function CardItem({ card }: any) {
  const router = useRouter();

  async function deleteCard() {
    if (!confirm("Tem certeza que deseja excluir este cartão?")) return;

    await fetch(`/api/cartoes/${card.id}`, { method: "DELETE" });
    window.location.reload();
  }

  function detalharCard() {
    router.push(`/cartoes/detalhar/${card.id}`);
  }

  return (
    <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow flex flex-col justify-between">
      
      <div>
        <h2 className="text-xl font-bold text-white">{card.name}</h2>

        <p className="text-gray-400 text-sm mt-1">
          Conta: {card.account?.name ?? "—"}
        </p>

        <p className="text-green-400 font-bold text-lg mt-4">
          Limite:{" "}
          {card.limit.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          })}
        </p>

        <p className="text-red-400 font-bold text-lg mt-1">
          Fatura atual:{" "}
          {card.expenses
            ?.reduce((s: number, e: any) => s + e.amount, 0)
            .toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })}
        </p>
      </div>

      {/* BOTÕES */}
      <div className="flex gap-3 mt-6">
        <a
          href={`/cartoes/editar/${card.id}`}
          className="flex-1 text-center p-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition"
        >
          ✏️ Editar
        </a>

        <button
          onClick={deleteCard}
          className="flex-1 p-2 rounded-lg bg-red-600 hover:bg-red-700 text-white transition"
        >
          🗑️ Excluir
        </button>

        <button
          onClick={detalharCard}
          className="flex-1 p-2 rounded-lg bg-gray-600 hover:bg-gray-500 text-white transition"
        >
          📋 Detalhar
        </button>
       
      </div>
    </div>
  );
}
