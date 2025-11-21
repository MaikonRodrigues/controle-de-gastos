import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

/**
 * POST /api/cards/[id]/invoices
 * Cria uma nova invoice para o cartão
 */
export async function POST(
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

    // Buscar dados obrigatórios do cartão
    const card = await prisma.card.findUnique({
      where: { id: cardId },
    });

    if (!card) {
      return NextResponse.json(
        { error: "Cartão não encontrado" },
        { status: 404 }
      );
    }

    // Criar a fatura com os campos obrigatórios do Prisma
    const invoice = await prisma.invoice.create({
      data: {
        cardId, // relação obrigatória é via id
        month: Number(body.month),
        year: Number(body.year),
        total: Number(body.total) ?? 0,
        paid: false,
        paidAt: null,

        closingDay: card.closingDay,
        dueDay: card.dueDay,
      },
    });

    return NextResponse.json(invoice, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar invoice:", error);
    return NextResponse.json(
      { error: "Erro interno ao criar invoice" },
      { status: 500 }
    );
  }
}
