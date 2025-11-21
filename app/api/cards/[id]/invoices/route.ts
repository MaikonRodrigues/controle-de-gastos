import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
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
    const prisma = new PrismaClient();
    
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
        cardId,
        month: Number(body.month),
        year: Number(body.year),
        total: Number(body.total) ?? 0,
        paid: false,
        paidAt: null,

        // Obrigatórios no Prisma
        closingDay: card.closingDay,
        dueDay: card.dueDay,

        // Relação obrigatória (com base no erro do Prisma)
        card: {
          connect: { id: cardId },
        },
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
