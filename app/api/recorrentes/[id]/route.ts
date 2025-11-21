import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

const prisma = new PrismaClient();

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { id } = await params;                   // <<< ESSENCIAL
  const recurringId = Number(id);
  const userId = Number(session.user.id);

  if (isNaN(recurringId)) {
    return NextResponse.json(
      { error: "ID inválido" },
      { status: 400 }
    );
  }

  const existente = await prisma.recurringExpense.findUnique({
    where: {
      id: recurringId,              // <<< AGORA FUNCIONA
    },
  });

  if (!existente || existente.userId !== userId) {
    return NextResponse.json(
      { error: "Recorrente não encontrado" },
      { status: 404 }
    );
  }

  await prisma.recurringExpense.delete({
    where: { id: recurringId },
  });

  return NextResponse.json({ success: true });
}
