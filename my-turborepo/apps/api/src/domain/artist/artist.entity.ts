export class ArtistEntity {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly userId: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}
}