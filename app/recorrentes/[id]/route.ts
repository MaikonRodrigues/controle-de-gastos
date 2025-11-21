import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../app/api/auth/[...nextauth]/route";

const prisma = new PrismaClient();

// GET /api/recorrentes/[id]
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const recurringId = Number(params.id);

  try {
    const recorrente = await prisma.recurringExpense.findUnique({
      where: { id: recurringId },
    });

    if (!recorrente) {
      return NextResponse.json(
        { error: "Gasto recorrente não encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(recorrente);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Erro ao buscar recorrente" },
      { status: 500 }
    );
  }
}

// PUT /api/recorrentes/[id]
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const recurringId = Number(params.id);
  const body = await req.json();

  const { title, amount, installments, recurrenceMode } = body;

  try {
    const updated = await prisma.recurringExpense.update({
      where: { id: recurringId },
      data: {
        title,
        amount: Number(amount),
        installments: installments === null ? null : Number(installments),
        recurrenceMode: recurrenceMode === "infinite" ? "infinite" : "installments",
      },
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Erro ao atualizar recorrente" },
      { status: 500 }
    );
  }
}

// DELETE /api/recorrentes/[id]
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const recurringId = Number(params.id);

  try {
    await prisma.recurringExpense.delete({
      where: { id: recurringId },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Erro ao excluir recorrente" },
      { status: 500 }
    );
  }
}
