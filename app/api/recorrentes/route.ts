import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const userId = Number(session.user.id);
  if (isNaN(userId)) {
    return NextResponse.json({ error: "ID de usuário inválido" }, { status: 400 });
  }

  const body = await req.json();

  const {
    title,
    amount,
    type,
    installments,
    accountId,
    cardId,
    startDate,
    recurrenceMode,
  } = body;

  // 🔥 VALIDAÇÕES BÁSICAS
  if (!title || typeof title !== "string") {
    return NextResponse.json({ error: "Título inválido" }, { status: 400 });
  }

  if (typeof amount !== "number" || isNaN(amount) || amount <= 0) {
    return NextResponse.json({ error: "Valor inválido" }, { status: 400 });
  }

  if (!type || (type !== "expense" && type !== "income")) {
    return NextResponse.json({ error: "Tipo inválido" }, { status: 400 });
  }

  // Pelo menos um método de pagamento
  if (accountId == null && cardId == null) {
    return NextResponse.json(
      { error: "Selecione uma conta ou cartão" },
      { status: 400 }
    );
  }

  // 🔥 NORMALIZAÇÃO DO recurrenceMode
  const mode: "infinite" | "installments" =
    recurrenceMode === "infinite" ? "infinite" : "installments";

  // 🔥 VALIDAÇÃO SE FOR PARCELADO
  if (mode === "installments") {
    const parsedInstallments = Number(installments);

    if (
      installments == null ||
      isNaN(parsedInstallments) ||
      parsedInstallments <= 0
    ) {
      return NextResponse.json(
        { error: "Número de parcelas inválido para recorrência parcelada." },
        { status: 400 }
      );
    }
  }

  // 🔥 NORMALIZAÇÃO FINAL DE installments
  const normalizedInstallments: number | null =
    mode === "installments" ? Number(installments) : null;

  try {
    const recorrente = await prisma.recurringExpense.create({
      data: {
        title,
        amount,
        type,
        installments: normalizedInstallments as number | null,
        startDate: startDate ? new Date(startDate) : new Date(),
        recurrenceMode: mode,
        userId,
        accountId: accountId ?? null,
        cardId: cardId ?? null,
      },
    });

    return NextResponse.json(recorrente, { status: 201 });
  } catch (e) {
    console.error("Erro ao cadastrar recorrente:", e);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const userId = Number(session.user.id);
  if (isNaN(userId)) {
    return NextResponse.json({ error: "ID de usuário inválido" }, { status: 400 });
  }

  try {
    const recorrentes = await prisma.recurringExpense.findMany({
      where: { userId },
      include: {
        account: true,
        card: {
          include: {
            account: true,
          },
        },
      },
      orderBy: { id: "desc" },
    });

    return NextResponse.json(recorrentes, { status: 200 });
  } catch (e) {
    console.error("Erro ao listar recorrentes:", e);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
