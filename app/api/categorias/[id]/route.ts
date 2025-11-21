import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name, type } = await req.json();

  if (!name || !type) {
    return NextResponse.json(
      { error: "Nome e tipo da categoria são obrigatórios" },
      { status: 400 }
    );
  }

  const categoria = await prisma.category.create({
    data: {
      name: name.trim(),
      type, // income | expense
      userId: Number(session.user.id)
    }
  });

  return NextResponse.json(categoria, { status: 201 });
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Extrai o ID diretamente da URL
  const url = new URL(req.url);
  const parts = url.pathname.split("/");
  const idString = parts[parts.length - 1]; // último segmento
  const categoriaId = Number(idString);

  if (isNaN(categoriaId)) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  }

  try {
    await prisma.category.delete({
      where: {
        id: categoriaId,
        userId: Number(session.user.id),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Erro ao deletar categoria:", error);

    return NextResponse.json(
      { error: "Erro ao deletar categoria" },
      { status: 500 }
    );
  }
}
