import { Module } from '@nestjs/common';
import { TracksController } from './tracks.controller';
import { TracksService } from './application/tracks.service';
import { TracksPrismaRepository } from './infrastructure/tracks.prisma.repository';
import { TRACK_REPOSITORY } from '../../domain/track/track.repository.interface';

@Module({
  controllers: [TracksController],
  providers: [
    TracksService,
    {
      provide: TRACK_REPOSITORY,
      useClass: TracksPrismaRepository,
    },
  ],
  exports: [TracksService],
})
export class TracksModule {}