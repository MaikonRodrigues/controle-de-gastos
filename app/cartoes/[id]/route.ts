import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

// GET – retorna os dados do cartão
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const cardId = Number(id);

  const card = await prisma.card.findUnique({
    where: { id: cardId },
  });

  return NextResponse.json(card);
}

// PUT – edita o cartão
export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const cardId = Number(id);

  const data = await req.json();

  const updated = await prisma.card.update({
    where: { id: cardId },
    data: {
      name: data.name,
      limit: data.limit,
      closingDay: data.closingDay,
      dueDay: data.dueDay,
      accountId: data.accountId,
    },
  });

  return NextResponse.json(updated);
}
