import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

/* =========================================
   GET → Buscar cartão por ID
========================================= */
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const cardId = Number(id);

    if (isNaN(cardId)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    const card = await prisma.card.findUnique({
      where: { id: cardId },
      include: {
        account: true,
        recurring: true,
        invoices: true,
        expenses: true,
      },
    });

    if (!card) {
      return NextResponse.json(
        { error: "Cartão não encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(card);
  } catch (error) {
    console.error("Erro ao buscar cartão:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

/* =========================================
   PUT → Atualizar cartão
========================================= */
export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const cardId = Number(id);

    if (isNaN(cardId)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    const body = await req.json();

    const updatedCard = await prisma.card.update({
      where: { id: cardId },
      data: {
        name: body.name,
        limit: Number(body.limit),
        closingDay: Number(body.closingDay),
        dueDay: Number(body.dueDay),
        accountId: Number(body.accountId),
      },
    });

    return NextResponse.json(updatedCard, { status: 200 });
  } catch (error: any) {
    console.error("Erro ao atualizar cartão:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
