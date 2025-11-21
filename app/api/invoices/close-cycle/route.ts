import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const userId = Number(session.user.id);
  const { cardId, month, year } = await req.json();

  if (!cardId || !month || !year) {
    return NextResponse.json(
      { error: "Dados insuficientes para fechar ciclo." },
      { status: 400 }
    );
  }

  try {
    // Confirma que o cartão pertence ao usuário
    const card = await prisma.card.findFirst({
      where: { id: cardId, userId },
    });

    if (!card) {
      return NextResponse.json(
        { error: "Cartão não encontrado ou não pertence ao usuário." },
        { status: 404 }
      );
    }

    // Soma despesas do mês para montar o total da fatura
    const despesasDoMes = await prisma.expense.findMany({
      where: {
        cardId,
        createdAt: {
          gte: new Date(year, month - 1, 1),
          lt: new Date(year, month, 1),
        },
      },
    });

    const total = despesasDoMes.reduce((s: any, e: any) => s + e.amount, 0);

    // Cria ou atualiza a invoice daquela referência
    const invoice = await prisma.invoice.upsert({
      where: {
        cardId_month_year: { cardId, month, year },
      },
      update: {
        total,
      },
      create: {
        cardId,
        month,
        year,
        total,
        paid: false,
        paidAt: null,
      },
    });

    return NextResponse.json(invoice);
  } catch (error) {
    console.error("Erro ao fechar ciclo:", error);
    return NextResponse.json(
      { error: "Erro interno ao fechar ciclo." },
      { status: 500 }
    );
  }
}
