import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { ArtistsService } from './application/artists.service';
import { ArtistEntity } from '../../domain/artist/artist.entity';
import { ARTIST_REPOSITORY } from '../../domain/artist/artist.repository.interface';
import { UserRole } from '@hvalya/types';

const mockArtistRepository = {
  findAll: jest.fn(),
  findById: jest.fn(),
  findByUserId: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

const mockArtist = new ArtistEntity(
  'artist-uuid',
  'Test Artist',
  'user-uuid',
  new Date(),
  new Date(),
);

describe('ArtistsService', () => {
  let service: ArtistsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ArtistsService,
        { provide: ARTIST_REPOSITORY, useValue: mockArtistRepository },
      ],
    }).compile();

    service = module.get<ArtistsService>(ArtistsService);
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return array of artists', async () => {
      mockArtistRepository.findAll.mockResolvedValue([mockArtist]);
      const result = await service.findAll();
      expect(result).toEqual([mockArtist]);
    });

    it('should return empty array if no artists', async () => {
      mockArtistRepository.findAll.mockResolvedValue([]);
      const result = await service.findAll();
      expect(result).toEqual([]);
    });
  });

  describe('findById', () => {
    it('should return artist if found', async () => {
      mockArtistRepository.findById.mockResolvedValue(mockArtist);
      const result = await service.findById('artist-uuid');
      expect(result).toEqual(mockArtist);
    });

    it('should throw NotFoundException if not found', async () => {
      mockArtistRepository.findById.mockResolvedValue(null);
      await expect(service.findById('non-existent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create artist if user has no profile', async () => {
      mockArtistRepository.findByUserId.mockResolvedValue(null);
      mockArtistRepository.create.mockResolvedValue(mockArtist);

      const result = await service.create('user-uuid', { name: 'Test Artist' });
      expect(result).toEqual(mockArtist);
      expect(mockArtistRepository.create).toHaveBeenCalledWith({
        name: 'Test Artist',
        userId: 'user-uuid',
      });
    });

    it('should throw ConflictException if artist profile already exists', async () => {
      mockArtistRepository.findByUserId.mockResolvedValue(mockArtist);
      await expect(
        service.create('user-uuid', { name: 'Test Artist' }),
      ).rejects.toThrow(ConflictException);
      expect(mockArtistRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update artist if owner', async () => {
      mockArtistRepository.findById.mockResolvedValue(mockArtist);
      mockArtistRepository.update.mockResolvedValue({
        ...mockArtist,
        name: 'Updated Artist',
      });

      const result = await service.update(
        'artist-uuid',
        { name: 'Updated Artist' },
        'user-uuid',
        UserRole.ARTIST,
      );
      expect(result.name).toBe('Updated Artist');
    });

    it('should update artist if requester is ADMIN (not owner)', async () => {
      mockArtistRepository.findById.mockResolvedValue(mockArtist);
      mockArtistRepository.update.mockResolvedValue({
        ...mockArtist,
        name: 'Admin Updated',
      });

      const result = await service.update(
        'artist-uuid',
        { name: 'Admin Updated' },
        'someone-else-uuid',
        UserRole.ADMIN,
      );
      expect(result.name).toBe('Admin Updated');
    });

    it('should throw ForbiddenException if requester is not the owner', async () => {
      mockArtistRepository.findById.mockResolvedValue(mockArtist);

      await expect(
        service.update(
          'artist-uuid',
          { name: 'Hacked' },
          'someone-else-uuid',
          UserRole.ARTIST,
        ),
      ).rejects.toThrow(ForbiddenException);
      expect(mockArtistRepository.update).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException if artist not found', async () => {
      mockArtistRepository.findById.mockResolvedValue(null);
      await expect(
        service.update('non-existent', { name: 'Updated' }, 'user-uuid', UserRole.ARTIST),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('should delete artist if owner', async () => {
      mockArtistRepository.findById.mockResolvedValue(mockArtist);
      mockArtistRepository.delete.mockResolvedValue(undefined);

      await service.delete('artist-uuid', 'user-uuid', UserRole.ARTIST);
      expect(mockArtistRepository.delete).toHaveBeenCalledWith('artist-uuid');
    });

    it('should throw ForbiddenException if requester is not the owner', async () => {
      mockArtistRepository.findById.mockResolvedValue(mockArtist);

      await expect(
        service.delete('artist-uuid', 'someone-else-uuid', UserRole.ARTIST),
      ).rejects.toThrow(ForbiddenException);
      expect(mockArtistRepository.delete).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException if artist not found', async () => {
      mockArtistRepository.findById.mockResolvedValue(null);
      await expect(
        service.delete('non-existent', 'user-uuid', UserRole.ARTIST),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
