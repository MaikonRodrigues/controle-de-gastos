import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth/[...nextauth]/route";

const prisma = new PrismaClient();

// POST /api/recorrentes/[id]/quitar-todas
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

    if (recorrente.recurrenceMode !== "installments" || !recorrente.installments) {
      return NextResponse.json(
        { error: "Só faz sentido quitar todas em recorrência parcelada." },
        { status: 400 }
      );
    }

    // Aqui assumo que o valor é por parcela,
    // e que todas restantes serão quitadas de uma vez.
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

    // "Desativa" o recorrente definindo installments = 0 (não cairá mais nos meses futuros)
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
