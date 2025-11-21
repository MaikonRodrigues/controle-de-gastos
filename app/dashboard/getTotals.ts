import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function getTotals(userId: number) {
  // Somatório de entradas
  const income = await prisma.expense.aggregate({
    where: { userId, type: "income" },
    _sum: { amount: true }
  });

  // Somatório de saídas
  const expense = await prisma.expense.aggregate({
    where: { userId, type: "expense" },
    _sum: { amount: true }
  });

  return {
    income: income._sum.amount || 0,
    expense: expense._sum.amount || 0,
    balance: (income._sum.amount || 0) - (expense._sum.amount || 0)
  };
}
