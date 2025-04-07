/*
  Warnings:

  - You are about to drop the column `VALORES` on the `CONTROLE_UPLOAD` table. All the data in the column will be lost.
  - Added the required column `UPLOAD_CODE` to the `CONTROLE_UPLOAD` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "CONTROLE_UPLOAD" DROP COLUMN "VALORES",
ADD COLUMN     "DATA" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "UPLOAD_CODE" TEXT NOT NULL;
