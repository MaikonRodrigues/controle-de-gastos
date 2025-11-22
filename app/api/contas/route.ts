import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

const prisma = new PrismaClient();

// =======================================================
// GET → Lista contas do usuário logado
// =======================================================
export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const userId = Number(session.user.id);

  const contas = await prisma.account.findMany({
    where: { userId },
    include: {
      expenses: true,
      cards: true,
    },
  });

  return NextResponse.json(contas);
}

// =======================================================
// POST → Criar uma nova conta para o usuário logado
// =======================================================
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const userId = Number(session.user.id);
    const { name, balance } = await req.json();

    if (!name) {
      return NextResponse.json(
        { error: "Nome da conta é obrigatório" },
        { status: 400 }
      );
    }

    const saldoConvertido = Number(balance.toString().replace(",", "."));

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
