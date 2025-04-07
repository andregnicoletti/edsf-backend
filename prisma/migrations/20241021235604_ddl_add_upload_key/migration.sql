/*
  Warnings:

  - Made the column `DATA` on table `CONTROLE_UPLOAD` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "CONTROLE_UPLOAD" ALTER COLUMN "DATA" SET NOT NULL;
