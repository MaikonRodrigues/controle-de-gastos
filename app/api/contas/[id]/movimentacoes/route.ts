import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(
   req: Request,
  { params }: { params: { id: string } }
) {
    const id = Number(params.id);
    const contaId = id;

    if (isNaN(contaId)) {
        return NextResponse.json(
            { conta: null, movimentacoes: [] },
            { status: 400 }
        );
    }

    // Buscar conta
    const conta = await prisma.account.findUnique({
        where: { id: contaId },
    });

    if (!conta) {
        return NextResponse.json({ conta: null, movimentacoes: [] });
    }

    // Buscar despesas normais associadas à conta
    const despesas = await prisma.expense.findMany({
        where: { accountId: contaId },
        orderBy: { createdAt: "desc" },
    });

    // Buscar recorrentes debitados desta conta
    const recorrentes = await prisma.recurringExpense.findMany({
        where: { accountId: contaId },
        orderBy: { createdAt: "desc" },
    });

    // Pagamentos de fatura (expenses.type = "invoice_payment")
    const pagamentosFatura = await prisma.expense.findMany({
        where: {
            accountId: contaId,
            type: "invoice_payment",
        },
        orderBy: { createdAt: "desc" },
    });

    // Consolidar em um único array
    const movimentacoes = [
        ...despesas.map((d: any) => ({
            id: d.id,
            descricao: d.title,
            tipo: d.type,
            valor: -Math.abs(d.amount),
            data: d.createdAt,
        })),

        ...recorrentes.map((r: any) => ({
            id: r.id,
            descricao: r.title + " (recorrente)",
            tipo: "recorrente",
            valor: -Math.abs(r.amount),
            data: r.createdAt,
        })),

        ...pagamentosFatura.map((p: any) => ({
            id: p.id,
            descricao: "Pagamento de fatura",
            tipo: "fatura",
            valor: -Math.abs(p.amount),
            data: p.createdAt,
        })),
    ];

    return NextResponse.json({
        conta,
        movimentacoes,
    });
}
