import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

/**
 * GET /api/cards/[id]/invoices
 * Retorna todas as faturas do cartão
 */
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

    const invoices = await prisma.invoice.findMany({
      where: { cardId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(invoices);
  } catch (error) {
    console.error("Erro ao buscar invoices:", error);
    return NextResponse.json(
      { error: "Erro interno ao buscar invoices" },
      { status: 500 }
    );
  }
}

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

    const invoice = await prisma.invoice.create({
      data: {
        cardId,
        month: body.month,
        year: body.year,
        total: body.total ?? 0,
        paid: false,
        closingDay: body.closingDay,
        dueDay: body.dueDay,
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
