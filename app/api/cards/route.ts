import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

/* =========================================
   GET → Lista todos os cartões do usuário
========================================= */

export async function GET(req: Request) {
  try {
    const cards = await prisma.card.findMany({
      include: {
        account: true,
        expenses: true,
      },
    });

    return NextResponse.json(cards, { status: 200 });
  } catch (e: any) {
    console.error("🔥 ERRO NO GET /api/cards:", e);
    return NextResponse.json(
      { error: "Erro ao carregar cartões" },
      { status: 500 }
    );
  }
}

/* =========================================
   POST → Cria um novo cartão
========================================= */
export async function POST(req: Request) {
  try {
    const body = await req.json();

    console.log("🟦 Recebido no POST /api/cards:", body);

    // VALIDAÇÕES SIMPLES
    if (!body.name) throw new Error("Nome do cartão é obrigatório");
    if (!body.accountId) throw new Error("accountId é obrigatório");
    if (!body.userId) throw new Error("userId é obrigatório");

    const limit = Number(body.limit);
    const closingDay = Number(body.closingDay);
    const dueDay = Number(body.dueDay);

    if (isNaN(limit)) throw new Error("Limite inválido");
    if (isNaN(closingDay)) throw new Error("Dia de fechamento inválido");
    if (isNaN(dueDay)) throw new Error("Dia de vencimento inválido");

    const newCard = await prisma.card.create({
      data: {
        name: body.name,
        limit,
        closingDay,
        dueDay,
        accountId: Number(body.accountId),
        userId: Number(body.userId),
      },
    });

    return NextResponse.json(newCard, { status: 201 });
  } catch (e: any) {
    console.error("🔥 ERRO NO POST /api/cards:", e);

    return NextResponse.json(
      { error: e.message ?? "Erro ao criar cartão" },
      { status: 500 }
    );
  }
}

/* =========================================
   DELETE → Excluir cartão (opcional)
========================================= */
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) throw new Error("ID do cartão não informado");

    await prisma.card.delete({
      where: { id: Number(id) },
    });

    return NextResponse.json({ success: true });
  } catch (e: any) {
    console.error("🔥 ERRO NO DELETE /api/cards:", e);
    return NextResponse.json(
      { error: "Erro ao excluir cartão" },
      { status: 500 }
    );
  }
}
