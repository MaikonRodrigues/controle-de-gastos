import { PrismaClient } from "@prisma/client";
import { addMonths, isSameMonth } from "date-fns";

const prisma = new PrismaClient();

export async function processarRecorrencias(userId: number) {
  const hoje = new Date();

  const recorrentes = await prisma.recurringExpense.findMany({
    where: { userId },
  });

  for (const rec of recorrentes) {
    const inicio = rec.startDate;
    const total = rec.installments ?? 0; // garante que não seja null

    for (let i = 0; i < total; i++) {
      const dataParcela = addMonths(inicio, i);

      // Só gera se for do mês atual
      if (!isSameMonth(dataParcela, hoje)) continue;

      // Verifica se já foi criada a parcela do mês
      const existente = await prisma.expense.findFirst({
        where: {
          title: rec.title,
          amount: rec.amount,
          type: rec.type,
          createdAt: {
            gte: new Date(dataParcela.getFullYear(), dataParcela.getMonth(), 1),
            lt: new Date(dataParcela.getFullYear(), dataParcela.getMonth() + 1, 1),
          },
        },
      });

      if (existente) continue;

      // Cria a parcela do mês atual
      await prisma.expense.create({
        data: {
          title: `${rec.title} (Parcela ${i + 1}/${total})`,
          amount: rec.amount,
          type: rec.type,
          userId: rec.userId,
          accountId: rec.accountId,
          cardId: rec.cardId,
          createdAt: dataParcela,
        },
      });
    }
  }
}
