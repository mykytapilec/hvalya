-- CreateEnum
CREATE TYPE "ReleaseType" AS ENUM ('SINGLE', 'EP', 'ALBUM', 'SPLIT', 'OTHER');

-- AlterTable
ALTER TABLE "albums" ADD COLUMN     "type" "ReleaseType" NOT NULL DEFAULT 'ALBUM';
