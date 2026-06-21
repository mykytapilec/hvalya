import { ArtistApplicationStatus } from './enums';

export interface IArtistApplication {
  id: string;
  userId: string;
  bio: string;
  socialLinks: string;
  status: ArtistApplicationStatus;
  reviewedAt: Date | null;
  rejectionReason: string | null;
  createdAt: Date;
  updatedAt: Date;
}