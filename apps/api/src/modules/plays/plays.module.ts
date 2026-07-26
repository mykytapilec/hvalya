import { Module } from '@nestjs/common';
import { PlaysService } from './application/plays.service';
import { PlaysPrismaRepository } from './infrastructure/plays.prisma.repository';
import { PLAY_REPOSITORY } from '../../domain/play/play.repository.interface';
import { PrismaModule } from '../../infrastructure/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [
    PlaysService,
    { provide: PLAY_REPOSITORY, useClass: PlaysPrismaRepository },
  ],
  exports: [PlaysService],
})
export class PlaysModule {}