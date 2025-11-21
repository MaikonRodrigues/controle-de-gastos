import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * GET → Lista todas as contas do usuário logado
 */
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const accounts = await prisma.account.findMany({
    where: { userId: Number(session.user.id) },
    include: { cards: true }
  });

  return NextResponse.json(accounts);
}

/**
 * POST → Cadastrar uma nova conta
 */
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { name, balance } = await req.json();

    if (!name) {
      return NextResponse.json(
        { error: "Nome da conta é obrigatório." },
        { status: 400 }
      );
    }

    const newAccount = await prisma.account.create({
      data: {
        name,
        balance: balance ?? 0,
        userId: Number(session.user.id),
      },
    });

    return NextResponse.json(newAccount, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Erro ao criar conta." },
      { status: 500 }
    );
  }
}

/**
 * PATCH → Atualizar conta (nome ou saldo)
 */
export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id, name, balance } = await req.json();

    if (!id)
      return NextResponse.json({ error: "ID da conta é obrigatório." }, { status: 400 });

    const updated = await prisma.account.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(balance !== undefined && { balance }),
      },
    });

    return NextResponse.json(updated);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Erro ao atualizar conta." },
      { status: 500 }
    );
  }
}

/**
 * DELETE → Excluir conta
 */
export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await req.json();

    if (!id)
      return NextResponse.json({ error: "ID da conta é obrigatório." }, { status: 400 });

    await prisma.account.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Erro ao excluir conta." },
      { status: 500 }
    );
  }
}
