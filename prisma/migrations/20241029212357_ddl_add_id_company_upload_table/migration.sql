/*
  Warnings:

  - You are about to drop the `_SheetCells` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `ID_ORGANIZACAO` to the `CONTROLE_UPLOAD` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "_SheetCells" DROP CONSTRAINT "_SheetCells_A_fkey";

-- DropForeignKey
ALTER TABLE "_SheetCells" DROP CONSTRAINT "_SheetCells_B_fkey";

-- AlterTable
ALTER TABLE "CONTROLE_UPLOAD" ADD COLUMN     "ID_ORGANIZACAO" TEXT NOT NULL;

-- DropTable
DROP TABLE "_SheetCells";

-- CreateTable
CREATE TABLE "_UPLOAD_CELLS" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_UPLOAD_CELLS_AB_unique" ON "_UPLOAD_CELLS"("A", "B");

-- CreateIndex
CREATE INDEX "_UPLOAD_CELLS_B_index" ON "_UPLOAD_CELLS"("B");

-- AddForeignKey
ALTER TABLE "CONTROLE_UPLOAD" ADD CONSTRAINT "CONTROLE_UPLOAD_ID_ORGANIZACAO_fkey" FOREIGN KEY ("ID_ORGANIZACAO") REFERENCES "CAD_ORGANIZACAO"("ID_ORGANIZACAO") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UPLOAD_CELLS" ADD CONSTRAINT "_UPLOAD_CELLS_A_fkey" FOREIGN KEY ("A") REFERENCES "DATA_UPLOAD"("ID_DATA") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UPLOAD_CELLS" ADD CONSTRAINT "_UPLOAD_CELLS_B_fkey" FOREIGN KEY ("B") REFERENCES "CONTROLE_UPLOAD"("ID_ARQUIVO") ON DELETE CASCADE ON UPDATE CASCADE;
