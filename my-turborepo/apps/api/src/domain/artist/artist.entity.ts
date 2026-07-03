export class ArtistEntity {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly bio: string | null,
    public readonly socialLinks: string | null,
    public readonly userId: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}
}
