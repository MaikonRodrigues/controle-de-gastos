import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// =======================================================
// GET → Lista todas as contas
// =======================================================
export async function GET() {
  try {
    const contas = await prisma.account.findMany({
      include: {
        cards: true,
        expenses: true,
      },
    });

    return NextResponse.json(contas);
  } catch (error) {
    console.error("Erro ao carregar contas:", error);
    return NextResponse.json(
      { error: "Erro ao carregar contas" },
      { status: 500 }
    );
  }
}

// =======================================================
// POST → Criar uma nova conta
// =======================================================
export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { name, balance, userId } = body;

    if (!name || !userId)
      return NextResponse.json(
        { error: "Nome e userId são obrigatórios" },
        { status: 400 }
      );

    // Aceita valores quebrados (ex: 100,50 ou 100.50)
    const saldoConvertido = Number(
      balance.toString().replace(",", ".")
    );

    const novaConta = await prisma.account.create({
      data: {
        name,
        balance: saldoConvertido,
        userId,
      },
    });

    return NextResponse.json(novaConta);
  } catch (error) {
    console.error("Erro ao criar conta:", error);
    return NextResponse.json(
      { error: "Erro ao criar conta" },
      { status: 500 }
    );
  }
}
