import { Module } from '@nestjs/common';
import { ArtistsController } from './artists.controller';
import { ArtistsService } from './application/artists.service';
import { ArtistsPrismaRepository } from './infrastructure/artists.prisma.repository';
import { ARTIST_REPOSITORY } from '../../domain/artist/artist.repository.interface';

@Module({
  controllers: [ArtistsController],
  providers: [
    ArtistsService,
    {
      provide: ARTIST_REPOSITORY,
      useClass: ArtistsPrismaRepository,
    },
  ],
  exports: [ArtistsService],
})
export class ArtistsModule {}