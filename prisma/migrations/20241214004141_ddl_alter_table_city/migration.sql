/*
  Warnings:

  - The primary key for the `_UPLOAD_CELLS` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[A,B]` on the table `_UPLOAD_CELLS` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "CAD_CIDADE" ADD COLUMN     "CIDADE_NORMALIZADA" TEXT;

-- AlterTable
ALTER TABLE "_UPLOAD_CELLS" DROP CONSTRAINT "_UPLOAD_CELLS_AB_pkey";

-- CreateIndex
CREATE UNIQUE INDEX "_UPLOAD_CELLS_AB_unique" ON "_UPLOAD_CELLS"("A", "B");

-- 
CREATE EXTENSION IF NOT EXISTS unaccent;

--
UPDATE "CAD_CIDADE" SET "CIDADE_NORMALIZADA" = unaccent("CIDADE");