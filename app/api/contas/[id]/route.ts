import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ===============================
// GET – buscar uma conta específica
// ===============================
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const contaId = Number(id);

    if (isNaN(contaId)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    const conta = await prisma.account.findUnique({
      where: { id: contaId },
    });

    if (!conta) {
      return NextResponse.json(
        { error: "Conta não encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json(conta);
  } catch (error) {
    console.error("Erro no GET /api/contas/[id]:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

// ===============================
// PUT – editar conta
// ===============================
export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const contaId = Number(id);

    const body = await req.json();
    const { name, balance } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Nome é obrigatório" },
        { status: 400 }
      );
    }

    const saldoConvertido = Number(balance);

    const updated = await prisma.account.update({
      where: { id: contaId },
      data: {
        name,
        balance: saldoConvertido,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Erro no PUT /api/contas/[id]:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

// ===============================
// DELETE – excluir conta
// ===============================
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const contaId = Number(id);

    await prisma.account.delete({
      where: { id: contaId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro no DELETE /api/contas/[id]:", error);
    return NextResponse.json(
      { error: "Erro ao excluir conta" },
      { status: 500 }
    );
  }
}
