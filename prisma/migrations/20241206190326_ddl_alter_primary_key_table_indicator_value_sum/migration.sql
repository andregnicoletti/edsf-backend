/*
  Warnings:

  - The primary key for the `SUM_VALOR_INDICADOR` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `ID_VALOR_INDICADOR` on the `SUM_VALOR_INDICADOR` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "SUM_VALOR_INDICADOR" DROP CONSTRAINT "SUM_VALOR_INDICADOR_pkey",
DROP COLUMN "ID_VALOR_INDICADOR",
ADD CONSTRAINT "SUM_VALOR_INDICADOR_pkey" PRIMARY KEY ("ID_PRODUTOR", "ID_INDICADOR", "AGRUPADOR_SUMARIZACAO");
