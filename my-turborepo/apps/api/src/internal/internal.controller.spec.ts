import { Test, TestingModule } from '@nestjs/testing';
import { InternalController } from './internal.controller';
import { PrismaService } from '../infrastructure/prisma/prisma.service';
import { InternalApiKeyGuard } from './internal-api-key.guard';

const mockPrismaService = {
  track: {
    findMany: jest.fn(),
  },
  play: {
    findMany: jest.fn(),
  },
};

describe('InternalController', () => {
  let controller: InternalController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InternalController],
      providers: [{ provide: PrismaService, useValue: mockPrismaService }],
    })
      .overrideGuard(InternalApiKeyGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<InternalController>(InternalController);
    jest.clearAllMocks();
  });

  describe('getTrackCatalog', () => {
    it('should return the track catalog with id and genres only', async () => {
      const tracks = [
        { id: 'track-1', genres: ['rock', 'alternative'] },
        { id: 'track-2', genres: [] },
      ];
      mockPrismaService.track.findMany.mockResolvedValue(tracks);

      const result = await controller.getTrackCatalog();

      expect(result).toEqual(tracks);
      expect(mockPrismaService.track.findMany).toHaveBeenCalledWith({
        select: { id: true, genres: true },
      });
    });

    it('should return an empty array if there are no tracks', async () => {
      mockPrismaService.track.findMany.mockResolvedValue([]);

      const result = await controller.getTrackCatalog();

      expect(result).toEqual([]);
    });
  });

  describe('getUserHistory', () => {
    it('should return play history ordered by most recent, limited to default 100', async () => {
      const history = [
        { trackId: 'track-1', playedAt: new Date('2026-07-02') },
        { trackId: 'track-2', playedAt: new Date('2026-07-01') },
      ];
      mockPrismaService.play.findMany.mockResolvedValue(history);

      const result = await controller.getUserHistory('user-uuid', undefined);

      expect(result).toEqual(history);
      expect(mockPrismaService.play.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-uuid' },
        orderBy: { playedAt: 'desc' },
        take: 100,
        select: { trackId: true, playedAt: true },
      });
    });

    it('should respect a custom limit query param', async () => {
      mockPrismaService.play.findMany.mockResolvedValue([]);

      await controller.getUserHistory('user-uuid', '5');

      expect(mockPrismaService.play.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ take: 5 }),
      );
    });

    it('should return an empty array for a user with no play history', async () => {
      mockPrismaService.play.findMany.mockResolvedValue([]);

      const result = await controller.getUserHistory('user-with-no-history', undefined);

      expect(result).toEqual([]);
    });
  });
});