import { Module } from '@nestjs/common';
import { ArtistApplicationsController } from './artist-applications.controller';
import { ArtistApplicationsService } from './application/artist-applications.service';
import { ArtistApplicationsPrismaRepository } from './infrastructure/artist-applications.prisma.repository';
import { ARTIST_APPLICATION_REPOSITORY } from '../../domain/artist-application/artist-application.repository.interface';
import { UsersModule } from '../users/users.module';
import { ArtistsModule } from '../artists/artists.module';

@Module({
  imports: [UsersModule, ArtistsModule],
  controllers: [ArtistApplicationsController],
  providers: [
    ArtistApplicationsService,
    {
      provide: ARTIST_APPLICATION_REPOSITORY,
      useClass: ArtistApplicationsPrismaRepository,
    },
  ],
  exports: [ArtistApplicationsService],
})
export class ArtistApplicationsModule {}