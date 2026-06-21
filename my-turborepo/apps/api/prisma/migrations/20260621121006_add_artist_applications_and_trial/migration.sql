-- CreateEnum
CREATE TYPE "ArtistApplicationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterTable
ALTER TABLE "subscriptions" ADD COLUMN     "trial_ends_at" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "artist_applications" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "bio" TEXT NOT NULL,
    "social_links" TEXT NOT NULL,
    "status" "ArtistApplicationStatus" NOT NULL DEFAULT 'PENDING',
    "reviewed_at" TIMESTAMP(3),
    "rejection_reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "artist_applications_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "artist_applications" ADD CONSTRAINT "artist_applications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
