import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { PrismaService } from '../infrastructure/prisma/prisma.service';
import { InternalApiKeyGuard } from './internal-api-key.guard';

interface InternalTrackDto {
  id: string;
  genres: string[];
}

interface InternalPlayHistoryDto {
  trackId: string;
  playedAt: Date;
}

@UseGuards(InternalApiKeyGuard)
@Controller('internal')
export class InternalController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('tracks')
  async getTrackCatalog(): Promise<InternalTrackDto[]> {
    return this.prisma.track.findMany({
      select: { id: true, genres: true },
    });
  }

  @Get('users/:userId/history')
  async getUserHistory(
    @Param('userId') userId: string,
    @Query('limit') limit?: string,
  ): Promise<InternalPlayHistoryDto[]> {
    const take = limit ? parseInt(limit, 10) : 100;

    return this.prisma.play.findMany({
      where: { userId },
      orderBy: { playedAt: 'desc' },
      take,
      select: { trackId: true, playedAt: true },
    });
  }
}