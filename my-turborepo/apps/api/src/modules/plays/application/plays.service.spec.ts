import { Test, TestingModule } from '@nestjs/testing';
import { PlaysService } from './plays.service';
import { PLAY_REPOSITORY } from '../../../domain/play/play.repository.interface';
import { PlayEntity } from '../../../domain/play/play.entity';

const mockPlayRepository = {
  create: jest.fn(),
};

describe('PlaysService', () => {
  let service: PlaysService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PlaysService,
        { provide: PLAY_REPOSITORY, useValue: mockPlayRepository },
      ],
    }).compile();

    service = module.get<PlaysService>(PlaysService);
    jest.clearAllMocks();
  });

  describe('recordPlay', () => {
    it('should create a play record via the repository', async () => {
      const play = new PlayEntity('play-uuid', 'user-uuid', 'track-uuid', new Date());
      mockPlayRepository.create.mockResolvedValue(play);

      const result = await service.recordPlay('user-uuid', 'track-uuid');

      expect(result).toEqual(play);
      expect(mockPlayRepository.create).toHaveBeenCalledWith('user-uuid', 'track-uuid');
    });

    it('should propagate errors from the repository', async () => {
      mockPlayRepository.create.mockRejectedValue(new Error('DB unavailable'));

      await expect(service.recordPlay('user-uuid', 'track-uuid')).rejects.toThrow(
        'DB unavailable',
      );
    });
  });
});