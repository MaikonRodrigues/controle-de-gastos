import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET → Lista todas as transações
export async function GET() {
  const data = await prisma.transaction.findMany({
    orderBy: { createdAt: "desc" }
  });
  return NextResponse.json(data);
}

// POST → Cria nova transação
export async function POST(req: Request) {
  const body = await req.json();

  const transaction = await prisma.transaction.create({
    data: {
      title: body.title,
      amount: body.amount,
      type: body.type,
    }
  });

  return NextResponse.json(transaction);
}
