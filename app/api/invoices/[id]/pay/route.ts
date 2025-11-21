// app/api/invoices/[id]/pay/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth/[...nextauth]/route";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const userId = Number(session.user.id);

  const url = new URL(req.url);
  const parts = url.pathname.split("/");
  // /api/invoices/[id]/pay → ["", "api", "invoices", "5", "pay"]
  const idString = parts[3];
  const invoiceId = Number(idString);

  if (isNaN(invoiceId)) {
    return NextResponse.json({ error: "ID de fatura inválido" }, { status: 400 });
  }

  const { accountId } = await req.json();

  if (!accountId) {
    return NextResponse.json(
      { error: "Conta para pagamento é obrigatória" },
      { status: 400 }
    );
  }

  try {
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        card: true,
      },
    });

    if (!invoice) {
      return NextResponse.json(
        { error: "Fatura não encontrada" },
        { status: 404 }
      );
    }

    if (invoice.paid) {
      return NextResponse.json(
        { error: "Fatura já está paga" },
        { status: 400 }
      );
    }

    // Confere se a conta é do mesmo usuário
    const account = await prisma.account.findFirst({
      where: {
        id: Number(accountId),
        userId,
      },
    });

    if (!account) {
      return NextResponse.json(
        { error: "Conta não encontrada ou não pertence ao usuário" },
        { status: 404 }
      );
    }

    // Debita o valor da fatura da conta
    await prisma.account.update({
      where: { id: account.id },
      data: {
        balance: {
          decrement: invoice.total,
        },
      },
    });

    // Marca a fatura como paga
    const updated = await prisma.invoice.update({
      where: { id: invoice.id },
      data: {
        paid: true,
        paidAt: new Date(),
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Erro ao pagar fatura:", error);
    return NextResponse.json(
      { error: "Erro ao pagar fatura" },
      { status: 500 }
    );
  }
}
