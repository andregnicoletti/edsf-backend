/*
  Warnings:

  - Changed the type of `META` on the `CAD_INDICADOR_META` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "CAD_INDICADOR_META" DROP COLUMN "META",
ADD COLUMN     "META" DECIMAL(65,30) NOT NULL;
