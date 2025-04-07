/*
  Warnings:

  - The primary key for the `ASSOC_TRABALHADOR_CURSO` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `ID_USUARIO` on the `ASSOC_TRABALHADOR_CURSO` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "ASSOC_TRABALHADOR_CURSO_CPF_ID_CURSO_DATA_INSCRICAO_key";

-- AlterTable
ALTER TABLE "ASSOC_TRABALHADOR_CURSO" DROP CONSTRAINT "ASSOC_TRABALHADOR_CURSO_pkey",
DROP COLUMN "ID_USUARIO",
ADD CONSTRAINT "ASSOC_TRABALHADOR_CURSO_pkey" PRIMARY KEY ("CPF", "ID_CURSO", "DATA_INSCRICAO");
