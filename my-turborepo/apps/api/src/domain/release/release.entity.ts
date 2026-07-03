import { ReleaseType } from '@hvalya/types';
import { TrackEntity } from '../track/track.entity';

export class ReleaseEntity {
  constructor(
    public readonly id: string,
    public readonly title: string,
    public readonly type: ReleaseType,
    public readonly coverUrl: string | null,
    public readonly releasedAt: Date,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly artistIds: string[],
    public readonly tracks: TrackEntity[],
  ) {}
}