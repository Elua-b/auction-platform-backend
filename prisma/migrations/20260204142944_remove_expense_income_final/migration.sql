/*
  Warnings:

  - You are about to drop the `Expense` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Income` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Expense" DROP CONSTRAINT "Expense_category_id_fkey";

-- DropForeignKey
ALTER TABLE "Expense" DROP CONSTRAINT "Expense_user_id_fkey";

-- DropForeignKey
ALTER TABLE "Income" DROP CONSTRAINT "Income_category_id_fkey";

-- DropForeignKey
ALTER TABLE "Income" DROP CONSTRAINT "Income_user_id_fkey";

-- DropTable
DROP TABLE "Expense";

-- DropTable
DROP TABLE "Income";
