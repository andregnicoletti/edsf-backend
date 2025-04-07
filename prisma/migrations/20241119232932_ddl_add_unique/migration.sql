/*
  Warnings:

  - A unique constraint covering the columns `[CPF,ID_CURSO,DATA_INSCRICAO]` on the table `ASSOC_TRABALHADOR_CURSO` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "ASSOC_TRABALHADOR_CURSO_CPF_ID_CURSO_DATA_INSCRICAO_key" ON "ASSOC_TRABALHADOR_CURSO"("CPF", "ID_CURSO", "DATA_INSCRICAO");
