/*
  Warnings:

  - A unique constraint covering the columns `[CODIGO]` on the table `CAD_CURSO` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "CAD_CURSO_CODIGO_key" ON "CAD_CURSO"("CODIGO");
