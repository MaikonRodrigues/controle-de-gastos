import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ------------------------------------------------------
// GET /api/cards/[id]/invoices
// ------------------------------------------------------
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const id = Number(params.id);
  const cardId = Number(id);

  if (isNaN(cardId)) {
    return NextResponse.json(
      { error: "CardId inválido" },
      { status: 400 }
    );
  }

  // ------------------------------------------------------
  // 1) Buscar TODAS as faturas do cartão
  // ------------------------------------------------------
  const invoices = await prisma.invoice.findMany({
    where: { cardId },
    include: {
      expenses: true, // despesas normais da fatura
    },
    orderBy: [{ year: "desc" }, { month: "desc" }],
  });

  // ------------------------------------------------------
  // 2) Buscar todos os gastos recorrentes desse cartão
  // ------------------------------------------------------
  const recurring = await prisma.recurringExpense.findMany({
    where: { cardId },
  });

  // ------------------------------------------------------
  // 3) Função para validar se recorrente pertence ao mês
  // ------------------------------------------------------
  function pertenceAoMes(
    r: {
      startDate: string | Date;
      recurrenceMode: string;
      installments: number | null;
    },
    mesBase: Date
  ) {
    const start = new Date(r.startDate);

    if (r.recurrenceMode === "infinite") {
      return mesBase >= start;
    }

    if (r.recurrenceMode === "installments") {
      const index =
        (mesBase.getFullYear() - start.getFullYear()) * 12 +
        (mesBase.getMonth() - start.getMonth());

      return index >= 0 && index < (r.installments ?? 0);
    }

    return false;
  }

  // ------------------------------------------------------
  // 4) Montar faturas unificando recorrentes + normais
  // ------------------------------------------------------
  const enriched = invoices.map((inv: any) => {
    const mesBase = new Date(inv.year, inv.month - 1, 1);

    const despesasNormais = inv.expenses;

    const recorrentesDoMes = recurring.filter((r: any) =>
      pertenceAoMes(r, mesBase)
    );

    const totalNormais = despesasNormais.reduce((s:any, e: any) => s + e.amount, 0);
    const totalRecorrentes = recorrentesDoMes.reduce(
      (s: any, r: any) => s + r.amount,
      0
    );

    return {
      ...inv,
      despesasNormais,
      recorrentes: recorrentesDoMes,
      total: totalNormais + totalRecorrentes,
    };
  });

  return NextResponse.json(enriched);
}
