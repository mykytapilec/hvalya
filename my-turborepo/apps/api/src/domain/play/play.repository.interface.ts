import { PlayEntity } from './play.entity';

export const PLAY_REPOSITORY = 'PLAY_REPOSITORY';

export interface PlayRepository {
  create(userId: string, trackId: string): Promise<PlayEntity>;
}