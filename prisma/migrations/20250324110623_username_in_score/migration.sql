/*
  Warnings:

  - Added the required column `username` to the `Score` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Score" ADD COLUMN     "username" TEXT NOT NULL;
