import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET → Lista todas as despesas (ou receitas)
export async function GET() {
  const data = await prisma.expense.findMany({
    orderBy: { createdAt: "desc" }
  });

  return NextResponse.json(data);
}

// POST → Cria nova transação
export async function POST(req: Request) {
  const body = await req.json();

  const nova = await prisma.expense.create({
    data: {
      title: body.title,
      amount: Number(body.amount),
      type: body.type,    // "expense" ou "income"
      userId: Number(body.userId),
      accountId: body.accountId ?? null,
      cardId: body.cardId ?? null,
      categoryId: body.categoryId ?? null,
    },
  });

  return NextResponse.json(nova);
}
