import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

const prisma = new PrismaClient();

// =====================
// GET
// =====================
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { id } = await context.params;
  const expenseId = Number(id);

  const expense = await prisma.expense.findUnique({
    where: {
      id: expenseId,
      userId: Number(session.user.id),
    },
  });

  if (!expense) {
    return NextResponse.json(
      { error: "Despesa não encontrada" },
      { status: 404 }
    );
  }

  return NextResponse.json(expense);
}

// =====================
// PUT
// =====================
export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { id } = await context.params;
  const expenseId = Number(id);

  const body = await req.json();

  const updated = await prisma.expense.update({
    where: {
      id: expenseId,
      userId: Number(session.user.id),
    },
    data: {
      title: body.title,
      amount: Number(body.amount),
    },
  });

  return NextResponse.json(updated);
}

// =====================
// DELETE
// =====================
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { id } = await context.params;
  const expenseId = Number(id);

  const expense = await prisma.expense.findUnique({
    where: {
      id: expenseId,
      userId: Number(session.user.id),
    },
  });

  if (!expense) {
    return NextResponse.json(
      { error: "Despesa não encontrada" },
      { status: 404 }
    );
  }

  // Se vinculada a fatura, desvincular antes
  if (expense.invoiceId) {
    await prisma.expense.update({
      where: { id: expenseId },
      data: { invoiceId: null },
    });
  }

  await prisma.expense.delete({
    where: { id: expenseId },
  });

  return NextResponse.json({ success: true });
}
