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

  const { cardId, month, year, accountId, amount, cycleClosed } =
    await req.json();

  if (!cardId || !month || !year || !accountId || !amount) {
    return NextResponse.json(
      { error: "Dados insuficientes para pagar fatura." },
      { status: 400 }
    );
  }

  try {
    // 1) Verifica conta do usuário
    const conta = await prisma.account.findFirst({
      where: { id: Number(accountId), userId },
    });

    if (!conta) {
      return NextResponse.json(
        { error: "Conta não encontrada ou não pertence ao usuário." },
        { status: 404 }
      );
    }

    if (conta.balance < amount) {
      return NextResponse.json(
        { error: "Saldo insuficiente para pagar a fatura." },
        { status: 400 }
      );
    }

    // 2) Debita o valor da conta
    await prisma.account.update({
      where: { id: conta.id },
      data: { balance: { decrement: amount } },
    });

    // 3) Busca despesas do mês desse cartão
    const despesasDoMes = await prisma.expense.findMany({
      where: {
        cardId,
        createdAt: {
          gte: new Date(year, month - 1, 1),
          lt: new Date(year, month, 1),
        },
      },
    });

    // 4) Apaga despesas do mês (limpa fatura visual)
    if (despesasDoMes.length > 0) {
      await prisma.expense.deleteMany({
        where: { id: { in: despesasDoMes.map((e: any) => e.id) } },
      });
    }

    let invoiceUpdated = null;

    if (cycleClosed) {
      // BUSCA CARTÃO PARA OBTER closingDay e dueDay
      const card = await prisma.card.findUnique({
        where: { id: cardId },
      });

      if (!card) {
        return NextResponse.json(
          { error: "Cartão não encontrado." },
          { status: 404 }
        );
      }

      // 5) Se ciclo FECHADO → registra fatura como paga
      invoiceUpdated = await prisma.invoice.upsert({
        where: {
          cardId_month_year: {
            cardId,
            month,
            year,
          },
        },
        update: {
          paid: true,
          paidAt: new Date(),
          total: amount,
        },
        create: {
          cardId,
          month,
          year,
          total: amount,
          paid: true,
          paidAt: new Date(),
          closingDay: card.closingDay, // OBRIGATÓRIO
          dueDay: card.dueDay,         // OBRIGATÓRIO
        },
      });
    }

    // 6) Registra saída REAL da conta (não volta para fatura)
    await prisma.expense.create({
      data: {
        title: cycleClosed
          ? `Pagamento da fatura do cartão`
          : `Abatimento da fatura (pagamento antecipado)`,
        amount,
        type: "expense",
        userId,
        accountId: conta.id,
        cardId: null,
        categoryId: null,
        createdAt: new Date(),
        invoiceId: invoiceUpdated?.id ?? null,
      },
    });

    return NextResponse.json({
      ok: true,
      cycleClosed,
      faturaPaga: !!invoiceUpdated,
      despesasApagadas: despesasDoMes.length,
    });
  } catch (error) {
    console.error("Erro ao pagar fatura manualmente:", error);
    return NextResponse.json(
      { error: "Erro interno ao pagar fatura." },
      { status: 500 }
    );
  }
}
