/*
  Warnings:

  - The primary key for the `CAD_INDICADOR_META` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `ID_META` on the `CAD_INDICADOR_META` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "CAD_INDICADOR_META" DROP CONSTRAINT "CAD_INDICADOR_META_pkey",
DROP COLUMN "ID_META",
ADD CONSTRAINT "CAD_INDICADOR_META_pkey" PRIMARY KEY ("ANO_META", "ID_INDICADOR", "ID_PRODUTOR");
