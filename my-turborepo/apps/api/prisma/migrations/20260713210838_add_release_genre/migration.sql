-- CreateEnum
CREATE TYPE "Genre" AS ENUM ('ROCK', 'POP', 'JAZZ', 'HIP_HOP', 'ELECTRONIC', 'CLASSICAL', 'METAL', 'BLUES', 'RNB', 'FOLK', 'INDIE', 'PUNK', 'REGGAE', 'COUNTRY', 'OTHER');

-- AlterTable
ALTER TABLE "albums" ADD COLUMN     "genre" "Genre";
