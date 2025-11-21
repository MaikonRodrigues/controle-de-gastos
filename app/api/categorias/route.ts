import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const categorias = await prisma.category.findMany({
    where: { userId: Number(session.user.id) },
    orderBy: { name: "asc" }
  });

  return NextResponse.json(categorias);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name, type } = await req.json();

  if (!name || name.trim() === "") {
    return NextResponse.json({ error: "Nome da categoria obrigatório" }, { status: 400 });
  }

  if (type !== "income" && type !== "expense") {
    return NextResponse.json({ error: "Tipo inválido" }, { status: 400 });
  }

  const categoria = await prisma.category.create({
    data: {
      name: name.trim(),
      type,                   // 👈 AGORA SALVA O TIPO CORRETAMENTE!
      userId: Number(session.user.id)
    }
  });

  return NextResponse.json(categoria, { status: 201 });
}
