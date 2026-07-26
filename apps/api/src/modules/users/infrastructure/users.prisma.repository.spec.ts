import { Test, TestingModule } from '@nestjs/testing';
import { UsersPrismaRepository } from './users.prisma.repository';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import { UserEntity } from '../../../domain/user/user.entity';
import { UserRole } from '@hvalya/types';

const mockPrismaUser = {
  id: 'uuid-123',
  email: 'test@hvalya.com',
  username: 'testuser',
  passwordHash: 'hashedpassword',
  role: 'LISTENER',
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
};

const mockPrismaService = {
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
  },
};

describe('UsersPrismaRepository', () => {
  let repository: UsersPrismaRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersPrismaRepository,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    repository = module.get<UsersPrismaRepository>(UsersPrismaRepository);
    jest.clearAllMocks();
  });

  describe('findById', () => {
    it('should return UserEntity if found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockPrismaUser);

      const result = await repository.findById('uuid-123');

      expect(result).toBeInstanceOf(UserEntity);
      expect(result?.id).toBe('uuid-123');
      expect(result?.role).toBe(UserRole.LISTENER);
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'uuid-123' },
      });
    });

    it('should return null if not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      const result = await repository.findById('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('findByEmail', () => {
    it('should return UserEntity if found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockPrismaUser);

      const result = await repository.findByEmail('test@hvalya.com');

      expect(result).toBeInstanceOf(UserEntity);
      expect(result?.email).toBe('test@hvalya.com');
    });

    it('should return null if not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      const result = await repository.findByEmail('ghost@hvalya.com');

      expect(result).toBeNull();
    });
  });

  describe('findByUsername', () => {
    it('should return UserEntity if found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockPrismaUser);

      const result = await repository.findByUsername('testuser');

      expect(result).toBeInstanceOf(UserEntity);
      expect(result?.username).toBe('testuser');
    });

    it('should return null if not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      const result = await repository.findByUsername('ghost');

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create and return UserEntity', async () => {
      mockPrismaService.user.create.mockResolvedValue(mockPrismaUser);

      const result = await repository.create({
        email: 'test@hvalya.com',
        username: 'testuser',
        passwordHash: 'hashedpassword',
      });

      expect(result).toBeInstanceOf(UserEntity);
      expect(result.email).toBe('test@hvalya.com');
      expect(mockPrismaService.user.create).toHaveBeenCalledWith({
        data: {
          email: 'test@hvalya.com',
          username: 'testuser',
          passwordHash: 'hashedpassword',
        },
      });
    });
  });
});