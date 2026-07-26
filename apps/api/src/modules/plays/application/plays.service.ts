import { Inject, Injectable } from '@nestjs/common';
import { PlayEntity } from '../../../domain/play/play.entity';
import { PLAY_REPOSITORY, PlayRepository } from '../../../domain/play/play.repository.interface';

@Injectable()
export class PlaysService {
  constructor(
    @Inject(PLAY_REPOSITORY) private readonly playRepository: PlayRepository,
  ) {}

  async recordPlay(userId: string, trackId: string): Promise<PlayEntity> {
    return this.playRepository.create(userId, trackId);
  }
}