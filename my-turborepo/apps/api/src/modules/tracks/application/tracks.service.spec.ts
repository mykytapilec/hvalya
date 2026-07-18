import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { TracksService } from './tracks.service';
import { TRACK_REPOSITORY } from '../../../domain/track/track.repository.interface';
import { TrackEntity } from '../../../domain/track/track.entity';
import { UserRole, Genre } from '@hvalya/types';

const mockTrackRepository = {
  findAll: jest.fn(),
  findById: jest.fn(),
  findByArtistId: jest.fn(),
  findByIds: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

const mockTrack = new TrackEntity(
  'track-uuid',
  'Test Track',
  180,
  'http://example.com/audio.mp3',
  'artist-uuid',
  null,
  [],
  new Date(),
  new Date(),
);

describe('TracksService', () => {
  let service: TracksService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TracksService,
        { provide: TRACK_REPOSITORY, useValue: mockTrackRepository },
      ],
    }).compile();

    service = module.get<TracksService>(TracksService);
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return array of tracks', async () => {
      mockTrackRepository.findAll.mockResolvedValue([mockTrack]);
      expect(await service.findAll()).toEqual([mockTrack]);
    });

    it('should return empty array if no tracks', async () => {
      mockTrackRepository.findAll.mockResolvedValue([]);
      expect(await service.findAll()).toEqual([]);
    });
  });

  describe('findById', () => {
    it('should return track if found', async () => {
      mockTrackRepository.findById.mockResolvedValue(mockTrack);
      expect(await service.findById('track-uuid')).toEqual(mockTrack);
    });

    it('should throw NotFoundException if not found', async () => {
      mockTrackRepository.findById.mockResolvedValue(null);
      await expect(service.findById('non-existent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create a track', async () => {
      mockTrackRepository.create.mockResolvedValue(mockTrack);
      const result = await service.create('artist-uuid', {
        title: 'Test Track',
        duration: 180,
        audioUrl: 'http://example.com/audio.mp3',
      });
      expect(result).toEqual(mockTrack);
      expect(mockTrackRepository.create).toHaveBeenCalledWith({
        title: 'Test Track',
        duration: 180,
        audioUrl: 'http://example.com/audio.mp3',
        artistId: 'artist-uuid',
        albumId: undefined,
      });
    });
  });

  describe('update', () => {
    it('should update track if owner', async () => {
      mockTrackRepository.findById.mockResolvedValue(mockTrack);
      mockTrackRepository.update.mockResolvedValue({ ...mockTrack, title: 'Updated' });
      const result = await service.update(
        'track-uuid',
        { title: 'Updated' },
        'artist-uuid',
        UserRole.ARTIST,
      );
      expect(result.title).toBe('Updated');
    });

    it('should update track if ADMIN', async () => {
      mockTrackRepository.findById.mockResolvedValue(mockTrack);
      mockTrackRepository.update.mockResolvedValue({ ...mockTrack, title: 'Admin Updated' });
      const result = await service.update(
        'track-uuid',
        { title: 'Admin Updated' },
        'other-artist-uuid',
        UserRole.ADMIN,
      );
      expect(result.title).toBe('Admin Updated');
    });

    it('should throw ForbiddenException if not owner', async () => {
      mockTrackRepository.findById.mockResolvedValue(mockTrack);
      await expect(
        service.update('track-uuid', { title: 'Hacked' }, 'other-uuid', UserRole.ARTIST),
      ).rejects.toThrow(ForbiddenException);
      expect(mockTrackRepository.update).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException if track not found', async () => {
      mockTrackRepository.findById.mockResolvedValue(null);
      await expect(
        service.update('non-existent', { title: 'x' }, 'artist-uuid', UserRole.ARTIST),
      ).rejects.toThrow(NotFoundException);
    });

    it('should map genre to a single-element genres array when provided', async () => {
      mockTrackRepository.findById.mockResolvedValue(mockTrack);
      mockTrackRepository.update.mockResolvedValue({ ...mockTrack, genres: [Genre.JAZZ] });

      await service.update(
        'track-uuid',
        { genre: Genre.JAZZ },
        'artist-uuid',
        UserRole.ARTIST,
      );

      expect(mockTrackRepository.update).toHaveBeenCalledWith(
        'track-uuid',
        expect.objectContaining({ genres: [Genre.JAZZ] }),
      );
    });

    it('should not touch genres when genre is not provided', async () => {
      mockTrackRepository.findById.mockResolvedValue(mockTrack);
      mockTrackRepository.update.mockResolvedValue(mockTrack);

      await service.update(
        'track-uuid',
        { title: 'No genre change' },
        'artist-uuid',
        UserRole.ARTIST,
      );

      const callArg = mockTrackRepository.update.mock.calls[0][1];
      expect(callArg).not.toHaveProperty('genres');
    });
  });

  describe('delete', () => {
    it('should delete track if owner', async () => {
      mockTrackRepository.findById.mockResolvedValue(mockTrack);
      mockTrackRepository.delete.mockResolvedValue(undefined);
      await service.delete('track-uuid', 'artist-uuid', UserRole.ARTIST);
      expect(mockTrackRepository.delete).toHaveBeenCalledWith('track-uuid');
    });

    it('should delete track if ADMIN', async () => {
      mockTrackRepository.findById.mockResolvedValue(mockTrack);
      mockTrackRepository.delete.mockResolvedValue(undefined);
      await service.delete('track-uuid', 'other-uuid', UserRole.ADMIN);
      expect(mockTrackRepository.delete).toHaveBeenCalledWith('track-uuid');
    });

    it('should throw ForbiddenException if not owner', async () => {
      mockTrackRepository.findById.mockResolvedValue(mockTrack);
      await expect(
        service.delete('track-uuid', 'other-uuid', UserRole.ARTIST),
      ).rejects.toThrow(ForbiddenException);
      expect(mockTrackRepository.delete).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException if track not found', async () => {
      mockTrackRepository.findById.mockResolvedValue(null);
      await expect(
        service.delete('non-existent', 'artist-uuid', UserRole.ARTIST),
      ).rejects.toThrow(NotFoundException);
    });
  });
});