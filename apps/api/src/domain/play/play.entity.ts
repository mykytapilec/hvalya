export class PlayEntity {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly trackId: string,
    public readonly playedAt: Date,
  ) {}
}