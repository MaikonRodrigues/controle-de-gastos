import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export type DashboardAccount = {
    id: number;
    name: string;
    saldo: number;
};

export type DashboardCard = {
    id: number;
    name: string;
    limit: number;
    fatura: number;
};

export type DashboardData = {
    accounts: DashboardAccount[];
    cards: DashboardCard[];
    recurring: any[];
    totalRecorrentes: number;
    totalEmContas: number;
    totalFaturas: number;
    saldoGeral: number;
};

export async function getDashboardData(userId: number): Promise<DashboardData> {
    const accounts = await prisma.account.findMany({
        where: { userId },
    });

    const cards = await prisma.card.findMany({
        where: { userId },
        include: { invoices: true },
    });

    const recurring = await prisma.recurringExpense.findMany({
        where: { userId },
    });

    /* ===========================================
        SALDO DAS CONTAS (SEM REFAZER CÁLCULO)
    =========================================== */
    const accountsFormatted: DashboardAccount[] = accounts.map((acc: any) => ({
        id: acc.id,
        name: acc.name,
        saldo: acc.balance, // saldo real, já ajustado no banco
    }));

    /* ===========================================
        FATURA DO MÊS (somente se não estiver paga)
    =========================================== */
    const hoje = new Date();
    const mesAtual = hoje.getMonth() + 1;
    const anoAtual = hoje.getFullYear();

    const cardsFormatted: DashboardCard[] = await Promise.all(
        cards.map(async (card: any) => {
            /* ================================
               BUSCAR DESPESAS NORMAIS
            ================================= */
            const despesasDoMes = await prisma.expense.findMany({
                where: {
                    cardId: card.id,
                    createdAt: {
                        gte: new Date(anoAtual, mesAtual - 1, 1),
                        lt: new Date(anoAtual, mesAtual, 1),
                    },
                },
            });

            /* ================================
               BUSCAR RECORRENTES DO CARTÃO
            ================================= */
            const recorrentesDoCartao = await prisma.recurringExpense.findMany({
                where: { cardId: card.id },
            });

            // Filtrar recorrentes somente se eles devem ser cobrados neste mês
            const recorrentesAtivos = recorrentesDoCartao.filter((r: any) => {
                const start = new Date(r.startDate);

                if (r.recurrenceMode === "infinite") {
                    return (
                        anoAtual > start.getFullYear() ||
                        (anoAtual === start.getFullYear() &&
                            mesAtual >= start.getMonth() + 1)
                    );
                }

                if (r.recurrenceMode === "installments") {
                    const diff =
                        (anoAtual - start.getFullYear()) * 12 +
                        (mesAtual - (start.getMonth() + 1));

                    return diff >= 0 && diff < r.installments;
                }

                return false;
            });

            const totalRecorrentes = recorrentesAtivos.reduce(
                (s: number, r: any) => s + r.amount,
                0
            );

            /* ================================
               SOMAR TUDO
            ================================= */
            const totalDespesas = despesasDoMes.reduce(
                (s: number, e: any) => s + e.amount,
                0
            );

            const faturaReal = totalDespesas + totalRecorrentes;

            return {
                id: card.id,
                name: card.name,
                limit: card.limit,
                fatura: faturaReal, // 🎯 AGORA SIM, TOTAL REAL DO MÊS
            };
        })
    );


    /* ===========================================
       TOTAIS
    =========================================== */

    const totalEmContas = accountsFormatted.reduce((s, acc) => s + acc.saldo, 0);

    const totalFaturas = cardsFormatted.reduce((s, c) => s + c.fatura, 0);

    const totalRecorrentes = recurring.reduce((s: any, r: any) => s + r.amount, 0);

    // Saldo geral NÃO desconta recorrentes automaticamente
    const saldoGeral = totalEmContas - totalFaturas;

    return {
        accounts: accountsFormatted,
        cards: cardsFormatted,
        recurring,
        totalRecorrentes,
        totalEmContas,
        totalFaturas,
        saldoGeral,
    };
}
