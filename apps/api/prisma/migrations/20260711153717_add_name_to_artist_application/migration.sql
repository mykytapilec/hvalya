/*
  Warnings:

  - Added the required column `name` to the `artist_applications` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "artist_applications" ADD COLUMN     "name" TEXT NOT NULL;
