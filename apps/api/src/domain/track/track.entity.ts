export class TrackEntity {
  constructor(
    public readonly id: string,
    public readonly title: string,
    public readonly duration: number,
    public readonly audioUrl: string,
    public readonly artistId: string,
    public readonly albumId: string | null,
    public readonly genres: string[],
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}
}