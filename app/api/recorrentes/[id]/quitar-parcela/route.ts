import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth/[...nextauth]/route";

const prisma = new PrismaClient();

// POST /api/recorrentes/[id]/quitar-parcela
export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const recurringId = Number(params.id);

  try {
    const recorrente = await prisma.recurringExpense.findUnique({
      where: { id: recurringId },
    });

    if (!recorrente) {
      return NextResponse.json(
        { error: "Recorrente não encontrado" },
        { status: 404 }
      );
    }

    // Lança a parcela como despesa normal no dia de hoje
    const expense = await prisma.expense.create({
      data: {
        title: recorrente.title,
        amount: recorrente.amount,
        type: recorrente.type,
        userId: recorrente.userId,
        accountId: recorrente.accountId,
        cardId: recorrente.cardId,
      },
    });

    return NextResponse.json({ success: true, expense });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Erro ao quitar parcela" },
      { status: 500 }
    );
  }
}
