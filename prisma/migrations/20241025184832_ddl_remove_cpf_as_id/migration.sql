/*
  Warnings:

  - The required column `ID_USUARIO` was added to the `ASSOC_TRABALHADOR_CURSO` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- DropIndex
DROP INDEX "ASSOC_TRABALHADOR_CURSO_CPF_key";

-- AlterTable
ALTER TABLE "ASSOC_TRABALHADOR_CURSO" ADD COLUMN     "ID_USUARIO" TEXT NOT NULL,
ADD CONSTRAINT "ASSOC_TRABALHADOR_CURSO_pkey" PRIMARY KEY ("ID_USUARIO");
