import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import { PlayEntity } from '../../../domain/play/play.entity';
import { PlayRepository } from '../../../domain/play/play.repository.interface';

@Injectable()
export class PlaysPrismaRepository implements PlayRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, trackId: string): Promise<PlayEntity> {
    const play = await this.prisma.play.create({
      data: { userId, trackId },
    });

    return new PlayEntity(play.id, play.userId, play.trackId, play.playedAt);
  }
}