/*
  Warnings:

  - Added the required column `NOME_PAINEL` to the `PAINEL` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PAINEL" ADD COLUMN     "NOME_PAINEL" TEXT NOT NULL;
