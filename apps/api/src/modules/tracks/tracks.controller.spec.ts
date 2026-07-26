import { Test, TestingModule } from '@nestjs/testing';
import { UserRole } from '@hvalya/types';
import { TracksController } from './tracks.controller';
import { TracksService } from './application/tracks.service';
import { ArtistsService } from '../artists/application/artists.service';
import { PlaysService } from '../plays/application/plays.service';
import { TrackEntity } from '../../domain/track/track.entity';
import { PlayEntity } from '../../domain/play/play.entity';
import { TrialGuard } from '../../common/guards/trial.guard';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

const mockTracksService = {
  findAll: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

const mockArtistsService = {
  findByUserId: jest.fn(),
};

const mockPlaysService = {
  recordPlay: jest.fn(),
};

const mockTrack = new TrackEntity(
  'track-uuid',
  'Test Track',
  180,
  'https://example.com/audio.mp3',
  'artist-uuid',
  null,
  [],
  new Date(),
  new Date(),
);

const authenticatedListener = {
  user: { id: 'user-uuid', email: 'listener@test.com', username: 'listener', role: UserRole.LISTENER },
};

describe('TracksController', () => {
  let controller: TracksController;

   beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TracksController],
      providers: [
        { provide: TracksService, useValue: mockTracksService },
        { provide: ArtistsService, useValue: mockArtistsService },
        { provide: PlaysService, useValue: mockPlaysService },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(TrialGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<TracksController>(TracksController);
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return public tracks without audioUrl', async () => {
      mockTracksService.findAll.mockResolvedValue([mockTrack]);

      const result = await controller.findAll();

      expect(result).toEqual([expect.objectContaining({ id: 'track-uuid' })]);
      expect(result[0]).not.toHaveProperty('audioUrl');
    });
  });

  describe('findById', () => {
    it('should return a public track without audioUrl', async () => {
      mockTracksService.findById.mockResolvedValue(mockTrack);

      const result = await controller.findById('track-uuid');

      expect(result).not.toHaveProperty('audioUrl');
      expect(result.id).toBe('track-uuid');
    });
  });

  describe('getPlayUrl', () => {
    it('should record a play and return the audioUrl', async () => {
      mockTracksService.findById.mockResolvedValue(mockTrack);
      mockPlaysService.recordPlay.mockResolvedValue(
        new PlayEntity('play-uuid', 'user-uuid', 'track-uuid', new Date()),
      );

      const result = await controller.getPlayUrl('track-uuid', authenticatedListener);

      expect(result).toEqual({ audioUrl: mockTrack.audioUrl });
      expect(mockPlaysService.recordPlay).toHaveBeenCalledWith('user-uuid', 'track-uuid');
    });

    it('should not record a play if the track does not exist', async () => {
      mockTracksService.findById.mockRejectedValue(new Error('Track not found'));

      await expect(
        controller.getPlayUrl('missing-track', authenticatedListener),
      ).rejects.toThrow('Track not found');

      expect(mockPlaysService.recordPlay).not.toHaveBeenCalled();
    });

    it('should propagate errors from recordPlay without swallowing them', async () => {
      mockTracksService.findById.mockResolvedValue(mockTrack);
      mockPlaysService.recordPlay.mockRejectedValue(new Error('DB unavailable'));

      await expect(
        controller.getPlayUrl('track-uuid', authenticatedListener),
      ).rejects.toThrow('DB unavailable');
    });
  });

  describe('create', () => {
    it('should create a track under the requesting artist profile', async () => {
      mockArtistsService.findByUserId.mockResolvedValue({ id: 'artist-uuid' });
      mockTracksService.create.mockResolvedValue(mockTrack);

      const artistUser = {
        user: { id: 'user-uuid', email: 'artist@test.com', username: 'artist', role: UserRole.ARTIST },
      };

      const result = await controller.create(artistUser, {
        title: 'Test Track',
        duration: 180,
        audioUrl: 'https://example.com/audio.mp3',
      } as any);

      expect(result).toEqual(mockTrack);
      expect(mockTracksService.create).toHaveBeenCalledWith('artist-uuid', expect.any(Object));
    });
  });
});