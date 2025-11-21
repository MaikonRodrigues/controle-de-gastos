import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth/[...nextauth]/route";

const prisma = new PrismaClient();

// POST /api/recorrentes/[id]/quitar-todas
export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  // Next.js 16 → params agora é Promise
  const { id } = await context.params;
  const recurringId = Number(id);

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

    if (recorrente.recurrenceMode !== "installments" || !recorrente.installments) {
      return NextResponse.json(
        { error: "Só faz sentido quitar todas em recorrência parcelada." },
        { status: 400 }
      );
    }

    // total = valor da parcela * quantidade de parcelas restantes
    const total = recorrente.amount * recorrente.installments;

    const expense = await prisma.expense.create({
      data: {
        title: `${recorrente.title} (quitação total)`,
        amount: total,
        type: recorrente.type,
        userId: recorrente.userId,
        accountId: recorrente.accountId,
        cardId: recorrente.cardId,
      },
    });

    // Desativa o recorrente zerando as parcelas futuras
    await prisma.recurringExpense.update({
      where: { id: recurringId },
      data: {
        installments: 0,
      },
    });

    return NextResponse.json({ success: true, expense });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Erro ao quitar todas as parcelas" },
      { status: 500 }
    );
  }
}
