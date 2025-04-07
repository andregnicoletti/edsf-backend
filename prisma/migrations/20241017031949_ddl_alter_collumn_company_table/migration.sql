/*
  Warnings:

  - You are about to drop the column `TIPO` on the `CAD_ORGANIZACAO` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "CAD_ORGANIZACAO" DROP COLUMN "TIPO",
ADD COLUMN     "SEGMENTO_NEGOCIO" TEXT NOT NULL DEFAULT '';
