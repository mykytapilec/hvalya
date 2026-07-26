import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { ReleasesController } from './releases.controller';
import { ReleasesService } from './application/releases.service';
import { ReleasesPrismaRepository } from './infrastructure/releases.prisma.repository';
import { RELEASE_REPOSITORY } from '../../domain/release/release.repository.interface';
import { ArtistsModule } from '../artists/artists.module';

@Module({
  imports: [
    ArtistsModule,
    MulterModule.register({ dest: './uploads' }),
  ],
  controllers: [ReleasesController],
  providers: [
    ReleasesService,
    {
      provide: RELEASE_REPOSITORY,
      useClass: ReleasesPrismaRepository,
    },
  ],
  exports: [ReleasesService],
})
export class ReleasesModule {}