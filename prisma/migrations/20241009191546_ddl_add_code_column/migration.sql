/*
  Warnings:

  - You are about to drop the column `indicatorId` on the `CAD_INDICADOR_META` table. All the data in the column will be lost.
  - You are about to drop the column `producerId` on the `CAD_INDICADOR_META` table. All the data in the column will be lost.
  - You are about to drop the column `indicator_id` on the `SUM_VALOR_INDICADOR` table. All the data in the column will be lost.
  - You are about to drop the column `producer_id` on the `SUM_VALOR_INDICADOR` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[CODIGO_INDICADOR]` on the table `CAD_INDICADOR` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[CODIGO_META]` on the table `CAD_INDICADOR_META` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[CODIGO_ORGANIZACAO]` on the table `CAD_ORGANIZACAO` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[CODIGO_PRODUTOR]` on the table `CAD_PRODUTOR` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `CODIGO` to the `CAD_CURSO` table without a default value. This is not possible if the table is not empty.
  - Added the required column `CODIGO_INDICADOR` to the `CAD_INDICADOR` table without a default value. This is not possible if the table is not empty.
  - Added the required column `CODIGO_META` to the `CAD_INDICADOR_META` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ID_INDICADOR` to the `CAD_INDICADOR_META` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ID_PRODUTOR` to the `CAD_INDICADOR_META` table without a default value. This is not possible if the table is not empty.
  - Added the required column `CODIGO_ORGANIZACAO` to the `CAD_ORGANIZACAO` table without a default value. This is not possible if the table is not empty.
  - Added the required column `CODIGO_PRODUTOR` to the `CAD_PRODUTOR` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ID_INDICADOR` to the `SUM_VALOR_INDICADOR` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ID_PRODUTOR` to the `SUM_VALOR_INDICADOR` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "CAD_INDICADOR_META" DROP CONSTRAINT "CAD_INDICADOR_META_indicatorId_fkey";

-- DropForeignKey
ALTER TABLE "CAD_INDICADOR_META" DROP CONSTRAINT "CAD_INDICADOR_META_producerId_fkey";

-- DropForeignKey
ALTER TABLE "SUM_VALOR_INDICADOR" DROP CONSTRAINT "SUM_VALOR_INDICADOR_indicator_id_fkey";

-- DropForeignKey
ALTER TABLE "SUM_VALOR_INDICADOR" DROP CONSTRAINT "SUM_VALOR_INDICADOR_producer_id_fkey";

-- AlterTable
ALTER TABLE "CAD_CURSO" ADD COLUMN     "CODIGO" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "CAD_INDICADOR" ADD COLUMN     "CODIGO_INDICADOR" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "CAD_INDICADOR_META" DROP COLUMN "indicatorId",
DROP COLUMN "producerId",
ADD COLUMN     "CODIGO_META" TEXT NOT NULL,
ADD COLUMN     "ID_INDICADOR" TEXT NOT NULL,
ADD COLUMN     "ID_PRODUTOR" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "CAD_ORGANIZACAO" ADD COLUMN     "CODIGO_ORGANIZACAO" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "CAD_PRODUTOR" ADD COLUMN     "CODIGO_PRODUTOR" TEXT NOT NULL,
ALTER COLUMN "DESC_PRODUTOR" DROP NOT NULL;

-- AlterTable
ALTER TABLE "SUM_VALOR_INDICADOR" DROP COLUMN "indicator_id",
DROP COLUMN "producer_id",
ADD COLUMN     "ID_INDICADOR" TEXT NOT NULL,
ADD COLUMN     "ID_PRODUTOR" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "CAD_INDICADOR_CODIGO_INDICADOR_key" ON "CAD_INDICADOR"("CODIGO_INDICADOR");

-- CreateIndex
CREATE UNIQUE INDEX "CAD_INDICADOR_META_CODIGO_META_key" ON "CAD_INDICADOR_META"("CODIGO_META");

-- CreateIndex
CREATE UNIQUE INDEX "CAD_ORGANIZACAO_CODIGO_ORGANIZACAO_key" ON "CAD_ORGANIZACAO"("CODIGO_ORGANIZACAO");

-- CreateIndex
CREATE UNIQUE INDEX "CAD_PRODUTOR_CODIGO_PRODUTOR_key" ON "CAD_PRODUTOR"("CODIGO_PRODUTOR");

-- AddForeignKey
ALTER TABLE "CAD_INDICADOR_META" ADD CONSTRAINT "CAD_INDICADOR_META_ID_PRODUTOR_fkey" FOREIGN KEY ("ID_PRODUTOR") REFERENCES "CAD_PRODUTOR"("ID_PRODUTOR") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CAD_INDICADOR_META" ADD CONSTRAINT "CAD_INDICADOR_META_ID_INDICADOR_fkey" FOREIGN KEY ("ID_INDICADOR") REFERENCES "CAD_INDICADOR"("ID_INDICADOR") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SUM_VALOR_INDICADOR" ADD CONSTRAINT "SUM_VALOR_INDICADOR_ID_PRODUTOR_fkey" FOREIGN KEY ("ID_PRODUTOR") REFERENCES "CAD_PRODUTOR"("ID_PRODUTOR") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SUM_VALOR_INDICADOR" ADD CONSTRAINT "SUM_VALOR_INDICADOR_ID_INDICADOR_fkey" FOREIGN KEY ("ID_INDICADOR") REFERENCES "CAD_INDICADOR"("ID_INDICADOR") ON DELETE RESTRICT ON UPDATE CASCADE;
