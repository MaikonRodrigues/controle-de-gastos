// app/api/expenses/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

const prisma = new PrismaClient();

// ------------------------------
// Regra do fechamento
// ------------------------------
function calcularMesAnoFatura(dataCompra: Date, closingDay: number) {
  let month = dataCompra.getMonth() + 1;
  let year = dataCompra.getFullYear();

  const diaCompra = dataCompra.getDate();

  if (diaCompra > closingDay) {
    month += 1;
    if (month > 12) {
      month = 1;
      year += 1;
    }
  }

  return { month, year };
}

// =======================================================
// GET → Lista todas as despesas do usuário
// =======================================================
export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const userId = Number(session.user.id);

  const expenses = await prisma.expense.findMany({
    where: { userId },
    include: {
      account: true,
      card: true,
      category: true,
      invoice: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(expenses);
}

// =======================================================
// POST → Cria despesa / entrada / compra no cartão
// =======================================================
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const userId = Number(session.user.id);
  const body = await req.json();

  const {
    title,
    amount,
    type,        // "income" | "expense"
    accountId,
    cardId,
    categoryId,
  } = body;

  if (!title || !amount || !type) {
    return NextResponse.json(
      { error: "Título, valor e tipo são obrigatórios." },
      { status: 400 }
    );
  }

  const valor = Number(amount);
  if (isNaN(valor) || valor <= 0) {
    return NextResponse.json({ error: "Valor inválido" }, { status: 400 });
  }

  const createdAt = new Date();
  let invoiceId: number | null = null;

  // ============================================
  // SE TIVER CARTÃO → Vai para fatura
  // ============================================
  if (cardId) {
    const card = await prisma.card.findUnique({
      where: { id: Number(cardId) },
    });

    if (!card) {
      return NextResponse.json(
        { error: "Cartão não encontrado" },
        { status: 400 }
      );
    }

    const { month, year } = calcularMesAnoFatura(createdAt, card.closingDay);

    let invoice = await prisma.invoice.findFirst({
      where: { cardId: card.id, month, year },
    });

    if (!invoice) {
      invoice = await prisma.invoice.create({
        data: {
          cardId: card.id,
          month,
          year,
          closingDay: card.closingDay,
          dueDay: card.dueDay,
          total: 0,
        },
      });
    }

    invoiceId = invoice.id;
  }

  // ============================================
  // CRIA A DESPESA
  // ============================================
  const expense = await prisma.expense.create({
    data: {
      title,
      amount: valor,
      type,
      createdAt,
      userId,
      accountId: accountId ? Number(accountId) : null,
      cardId: cardId ? Number(cardId) : null,
      categoryId: categoryId ? Number(categoryId) : null,
      invoiceId,
    },
  });

  // ============================================================
  // AJUSTA SALDO DA CONTA (somente se NÃO for cartão)
  // ============================================================
  if (accountId && !cardId) {
    if (type === "income") {
      // Entrada deposita
      await prisma.account.update({
        where: { id: Number(accountId) },
        data: {
          balance: { increment: valor },
        },
      });
    } else if (type === "expense") {
      // Saída debita
      await prisma.account.update({
        where: { id: Number(accountId) },
        data: {
          balance: { decrement: valor },
        },
      });
    }
  }

  // ============================================================
  // ATUALIZA FATURA SE EXISTIR
  // ============================================================
  if (invoiceId) {
    await prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        total: { increment: valor },
      },
    });
  }

  return NextResponse.json(expense, { status: 201 });
}
