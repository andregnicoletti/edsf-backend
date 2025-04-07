/*
  Warnings:

  - Added the required column `UPLOAD_ID` to the `CONTROLE_UPLOAD` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "CONTROLE_UPLOAD" ADD COLUMN     "UPLOAD_ID" TEXT NOT NULL;
