"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import CardItem from "./carditem";

export default function CartoesPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [cards, setCards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadCards() {
    try {
      const res = await fetch("/api/cards", { cache: "no-store" });

      if (!res.ok) {
        setCards([]);
      } else {
        const data = await res.json();
        setCards(Array.isArray(data) ? data : []);
      }
    } catch {
      setCards([]);
    }

    setLoading(false);
  }

  useEffect(() => {
    if (status === "authenticated") {
      loadCards();
    }
  }, [status]);

  if (status === "loading" || loading) {
    return <div className="text-white p-10">Carregando cartões...</div>;
  }

  if (!session) {
    router.push("/login");
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-10">
      {/* Voltar */}
      <button
        onClick={() => router.push("/dashboard")}
        className="mb-8 px-5 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition text-white shadow"
      >
        ⬅️ Voltar ao Dashboard
      </button>

      {/* Título */}
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-3xl font-bold">Cartões</h1>

        <a
          href="/cartoes/nova"
          className="px-6 py-3 rounded-lg bg-green-600 hover:bg-green-700 transition text-white shadow flex items-center gap-2"
        >
          ➕ Novo Cartão
        </a>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.length === 0 && (
          <p className="text-gray-400">Nenhum cartão cadastrado.</p>
        )}

        {cards.map((card: any) => (
          <CardItem key={card.id} card={card} />
        ))}
      </div>
    </div>
  );
}
