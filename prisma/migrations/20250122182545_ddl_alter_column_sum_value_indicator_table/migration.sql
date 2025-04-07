/*
  Warnings:

  - The primary key for the `SUM_VALOR_INDICADOR` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `AGRUPADOR_SUMARIZACAO` on the `SUM_VALOR_INDICADOR` table. All the data in the column will be lost.
  - Added the required column `ANO_SUMARIZACAO` to the `SUM_VALOR_INDICADOR` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "SUM_VALOR_INDICADOR" DROP CONSTRAINT "SUM_VALOR_INDICADOR_pkey",
DROP COLUMN "AGRUPADOR_SUMARIZACAO",
ADD COLUMN     "ANO_SUMARIZACAO" TEXT NOT NULL,
ADD CONSTRAINT "SUM_VALOR_INDICADOR_pkey" PRIMARY KEY ("ID_PRODUTOR", "ID_INDICADOR", "ANO_SUMARIZACAO");
