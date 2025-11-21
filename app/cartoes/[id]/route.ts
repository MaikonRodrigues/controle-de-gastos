import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

// GET – retorna os dados do cartão
export async function GET(req: Request, { params }: any) {
  const id = Number(params.id);

  const card = await prisma.card.findUnique({
    where: { id },
  });

  return NextResponse.json(card);
}

// PUT – edita o cartão
export async function PUT(req: Request, { params }: any) {
  const id = Number(params.id);
  const data = await req.json();

  const updated = await prisma.card.update({
    where: { id },
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
