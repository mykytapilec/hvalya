import { ArtistApplicationStatus } from '@hvalya/types';

export class ArtistApplicationEntity {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly bio: string,
    public readonly socialLinks: string,
    public readonly status: ArtistApplicationStatus,
    public readonly reviewedAt: Date | null,
    public readonly rejectionReason: string | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}
}
