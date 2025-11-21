/*
  Warnings:

  - You are about to drop the column `current` on the `RecurringExpense` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_RecurringExpense" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "type" TEXT NOT NULL,
    "installments" INTEGER,
    "startDate" DATETIME NOT NULL,
    "userId" INTEGER NOT NULL,
    "accountId" INTEGER,
    "cardId" INTEGER,
    "recurrenceMode" TEXT NOT NULL DEFAULT 'installments',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "RecurringExpense_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "RecurringExpense_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "RecurringExpense_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "Card" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_RecurringExpense" ("accountId", "amount", "cardId", "createdAt", "id", "installments", "startDate", "title", "type", "userId") SELECT "accountId", "amount", "cardId", "createdAt", "id", "installments", "startDate", "title", "type", "userId" FROM "RecurringExpense";
DROP TABLE "RecurringExpense";
ALTER TABLE "new_RecurringExpense" RENAME TO "RecurringExpense";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
