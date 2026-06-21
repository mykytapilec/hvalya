import { Module } from '@nestjs/common';
import { TracksController } from './tracks.controller';
import { TracksService } from './application/tracks.service';
import { TracksPrismaRepository } from './infrastructure/tracks.prisma.repository';
import { TRACK_REPOSITORY } from '../../domain/track/track.repository.interface';
import { ArtistsModule } from '../artists/artists.module';

@Module({
  imports: [ArtistsModule],
  controllers: [TracksController],
  providers: [
    TracksService,
    {
      provide: TRACK_REPOSITORY,
      useClass: TracksPrismaRepository,
    },
  ],
  exports: [TracksService, TRACK_REPOSITORY],
})
export class TracksModule {}
