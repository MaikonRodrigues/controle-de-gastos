"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function NovaSaida() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [typePayment, setTypePayment] = useState<"account" | "card">("account");

  const [accountId, setAccountId] = useState("");
  const [cardId, setCardId] = useState("");
  const [categoriaId, setCategoriaId] = useState("");

  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrenceMode, setRecurrenceMode] =
    useState<"infinite" | "installments">("installments");
  const [installments, setInstallments] = useState<number | "">("");

  const [accounts, setAccounts] = useState<any[]>([]);
  const [cards, setCards] = useState<any[]>([]);
  const [categorias, setCategorias] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/accounts")
      .then((res) => res.json())
      .then((data) => setAccounts(data));

    fetch("/api/cards")
      .then((res) => res.json())
      .then((data) => setCards(data));

    fetch("/api/categorias")
      .then((res) => res.json())
      .then((data) => {
        const categoriasGasto = data.filter(
          (cat: any) => cat.type === "expense"
        );
        setCategorias(categoriasGasto);
      });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const basePayload: any = {
      title,
      amount: Number(amount),
      type: "expense",
      accountId: typePayment === "account" ? Number(accountId) : null,
      cardId: typePayment === "card" ? Number(cardId) : null,
      categoryId: categoriaId ? Number(categoriaId) : null,
    };

    const url = isRecurring ? "/api/recorrentes" : "/api/expenses";
    const payload = { ...basePayload };

    if (isRecurring) {
      payload.recurrenceMode = recurrenceMode;
      payload.startDate = new Date().toISOString();

      if (recurrenceMode === "installments") {
        payload.installments =
          typeof installments === "number"
            ? installments
            : Number(installments);
      } else {
        payload.installments = null;
      }
    }

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) router.push("/dashboard");
    else alert("Erro ao salvar saída.");
  }

  return (
    <div className="min-h-screen bg-gray-900 p-8 flex justify-center items-center">
      <div className="bg-gray-800 p-8 rounded-2xl shadow-xl border border-gray-700 max-w-md w-full">

        <button
          onClick={() => router.push("/dashboard")}
          className="mb-6 px-4 py-2 bg-gray-700 text-white rounded-xl hover:bg-gray-600 transition"
        >
          ⬅️ Voltar
        </button>

        <h1 className="text-2xl font-bold text-white mb-6">Nova Saída</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <input
            placeholder="Descrição do gasto"
            className="w-full p-3 rounded-xl bg-gray-700 text-white border border-gray-600"
            value={title}
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
                ["e", "E", "+", "-", " "].includes(e.key) ||
                ((e.key < "0" || e.key > "9") &&
                  e.key !== "." &&
                  e.key !== "," &&
                  e.key !== "Backspace")
              ) {
                e.preventDefault();
              }
            }}
          />

          {/* Tipo de Pagamento */}
          <div className="bg-gray-700 p-4 rounded-xl border border-gray-600 text-white">
            <p className="font-semibold mb-2">Tipo de Pagamento:</p>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="tipo"
                  value="account"
                  checked={typePayment === "account"}
                  onChange={() => setTypePayment("account")}
                  className="accent-blue-600"
                />
                <span
                  className={typePayment === "account" ? "font-bold" : ""}
                >
                  Conta
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="tipo"
                  value="card"
                  checked={typePayment === "card"}
                  onChange={() => setTypePayment("card")}
                  className="accent-blue-600"
                />
                <span className={typePayment === "card" ? "font-bold" : ""}>
                  Cartão
                </span>
              </label>
            </div>
          </div>

          {typePayment === "account" && (
            <select
              className="w-full p-3 rounded-xl bg-gray-700 text-white border border-gray-600"
              value={accountId}
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

          {typePayment === "card" && (
            <select
              className="w-full p-3 rounded-xl bg-gray-700 text-white border border-gray-600"
              value={cardId}
              onChange={(e) => setCardId(e.target.value)}
            >
              <option value="">Selecione o cartão</option>
              {cards.map((card: any) => (
                <option key={card.id} value={card.id}>
                  {card.name} ({card.account?.name})
                </option>
              ))}
            </select>
          )}

          {/* Categorias de gasto */}
          <select
            className="w-full p-3 rounded-xl bg-gray-700 text-white border border-gray-600"
            value={categoriaId}
            onChange={(e) => setCategoriaId(e.target.value)}
          >
            <option value="">Selecione a categoria</option>

            {categorias.length === 0 ? (
              <option disabled>Nenhuma categoria de gasto cadastrada</option>
            ) : (
              categorias.map((cat: any) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))
            )}
          </select>

          {/* Recorrência */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={isRecurring}
              onChange={() => setIsRecurring(!isRecurring)}
              className="accent-blue-600"
            />
            <label className="text-white">Gasto Recorrente</label>
          </div>

          {isRecurring && (
            <div className="bg-gray-700 p-4 rounded-xl border border-gray-600 text-white space-y-4">
              <p className="font-semibold mb-1">Tipo de recorrência:</p>

              <div className="flex flex-col gap-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="recurrenceMode"
                    value="infinite"
                    checked={recurrenceMode === "infinite"}
                    onChange={() => setRecurrenceMode("infinite")}
                    className="accent-blue-600"
                  />
                  <span>Repetir todo mês (sem fim)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="recurrenceMode"
                    value="installments"
                    checked={recurrenceMode === "installments"}
                    onChange={() => setRecurrenceMode("installments")}
                    className="accent-blue-600"
                  />
                  <span>Parcelado em X meses</span>
                </label>
              </div>

              {recurrenceMode === "installments" && (
                <input
                  type="number"
                  min={1}
                  placeholder="Número de parcelas"
                  className="w-full p-2 rounded bg-gray-800 text-white border border-gray-600"
                  value={installments}
                  onChange={(e) =>
                    setInstallments(
                      e.target.value === "" ? "" : Number(e.target.value)
                    )
                  }
                />
              )}
            </div>
          )}

          <button className="w-full bg-red-600 text-white p-3 rounded-xl shadow hover:bg-red-700 transition">
            Salvar Gasto
          </button>
        </form>
      </div>
    </div>
  );
}
