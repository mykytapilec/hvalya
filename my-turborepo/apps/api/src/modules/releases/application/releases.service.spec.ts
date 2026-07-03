import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { ReleasesService } from './releases.service';
import { RELEASE_REPOSITORY } from '../../../domain/release/release.repository.interface';
import { ReleaseEntity } from '../../../domain/release/release.entity';
import { ReleaseType, UserRole } from '@hvalya/types';

const mockReleaseRepository = {
  findAll: jest.fn(),
  findById: jest.fn(),
  findByArtistId: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  updateCover: jest.fn(),
};

const now = new Date();

const mockRelease = new ReleaseEntity(
  'release-uuid',
  'Test Release',
  ReleaseType.SINGLE,
  null,
  now,
  now,
  now,
  ['artist-uuid'],
  [],
);

describe('ReleasesService', () => {
  let service: ReleasesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReleasesService,
        { provide: RELEASE_REPOSITORY, useValue: mockReleaseRepository },
      ],
    }).compile();

    service = module.get<ReleasesService>(ReleasesService);
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return array of releases', async () => {
      mockReleaseRepository.findAll.mockResolvedValue([mockRelease]);
      expect(await service.findAll()).toEqual([mockRelease]);
    });
  });

  describe('findById', () => {
    it('should return release if found', async () => {
      mockReleaseRepository.findById.mockResolvedValue(mockRelease);
      expect(await service.findById('release-uuid')).toEqual(mockRelease);
    });

    it('should throw NotFoundException if not found', async () => {
      mockReleaseRepository.findById.mockResolvedValue(null);
      await expect(service.findById('non-existent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create release with artist and tracks', async () => {
      mockReleaseRepository.create.mockResolvedValue(mockRelease);
      const result = await service.create('artist-uuid', {
        title: 'Test Release',
        type: ReleaseType.SINGLE,
        releasedAt: now.toISOString(),
        tracks: [{ title: 'Track 1', duration: 180, audioUrl: 'http://example.com/audio.mp3' }],
      });
      expect(result).toEqual(mockRelease);
      expect(mockReleaseRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Test Release',
          type: ReleaseType.SINGLE,
          artistIds: ['artist-uuid'],
        }),
      );
    });
  });

  describe('update', () => {
    it('should update release if owner', async () => {
      mockReleaseRepository.findById.mockResolvedValue(mockRelease);
      mockReleaseRepository.update.mockResolvedValue({ ...mockRelease, title: 'Updated' });
      const result = await service.update(
        'release-uuid',
        { title: 'Updated' },
        'artist-uuid',
        UserRole.ARTIST,
      );
      expect(result.title).toBe('Updated');
    });

    it('should update release if ADMIN', async () => {
      mockReleaseRepository.findById.mockResolvedValue(mockRelease);
      mockReleaseRepository.update.mockResolvedValue({ ...mockRelease, title: 'Admin Updated' });
      const result = await service.update(
        'release-uuid',
        { title: 'Admin Updated' },
        'other-uuid',
        UserRole.ADMIN,
      );
      expect(result.title).toBe('Admin Updated');
    });

    it('should throw ForbiddenException if not owner', async () => {
      mockReleaseRepository.findById.mockResolvedValue(mockRelease);
      await expect(
        service.update('release-uuid', { title: 'Hacked' }, 'other-uuid', UserRole.ARTIST),
      ).rejects.toThrow(ForbiddenException);
      expect(mockReleaseRepository.update).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException if release not found', async () => {
      mockReleaseRepository.findById.mockResolvedValue(null);
      await expect(
        service.update('non-existent', { title: 'x' }, 'artist-uuid', UserRole.ARTIST),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateCover', () => {
    it('should update cover if owner', async () => {
      mockReleaseRepository.findById.mockResolvedValue(mockRelease);
      mockReleaseRepository.updateCover.mockResolvedValue({
        ...mockRelease,
        coverUrl: 'http://example.com/cover.jpg',
      });
      const result = await service.updateCover(
        'release-uuid',
        'http://example.com/cover.jpg',
        'artist-uuid',
        UserRole.ARTIST,
      );
      expect(result.coverUrl).toBe('http://example.com/cover.jpg');
    });

    it('should throw ForbiddenException if not owner', async () => {
      mockReleaseRepository.findById.mockResolvedValue(mockRelease);
      await expect(
        service.updateCover('release-uuid', 'http://example.com/cover.jpg', 'other-uuid', UserRole.ARTIST),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('delete', () => {
    it('should delete release if owner', async () => {
      mockReleaseRepository.findById.mockResolvedValue(mockRelease);
      mockReleaseRepository.delete.mockResolvedValue(undefined);
      await service.delete('release-uuid', 'artist-uuid', UserRole.ARTIST);
      expect(mockReleaseRepository.delete).toHaveBeenCalledWith('release-uuid');
    });

    it('should delete release if ADMIN', async () => {
      mockReleaseRepository.findById.mockResolvedValue(mockRelease);
      mockReleaseRepository.delete.mockResolvedValue(undefined);
      await service.delete('release-uuid', 'other-uuid', UserRole.ADMIN);
      expect(mockReleaseRepository.delete).toHaveBeenCalledWith('release-uuid');
    });

    it('should throw ForbiddenException if not owner', async () => {
      mockReleaseRepository.findById.mockResolvedValue(mockRelease);
      await expect(
        service.delete('release-uuid', 'other-uuid', UserRole.ARTIST),
      ).rejects.toThrow(ForbiddenException);
      expect(mockReleaseRepository.delete).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException if release not found', async () => {
      mockReleaseRepository.findById.mockResolvedValue(null);
      await expect(
        service.delete('non-existent', 'artist-uuid', UserRole.ARTIST),
      ).rejects.toThrow(NotFoundException);
    });
  });
});