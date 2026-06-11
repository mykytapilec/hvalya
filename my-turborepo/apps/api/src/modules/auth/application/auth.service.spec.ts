import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { AuthService } from './auth.service';
import { USER_REPOSITORY } from '../../../domain/user/user.repository.interface';
import { UserEntity } from '../../../domain/user/user.entity';
import { UserRole } from '@hvalya/types';
// import { beforeEach, describe, it, jest, expect } from 'node:test';

const mockUserRepository = {
  findByEmail: jest.fn(),
  findByUsername: jest.fn(),
  create: jest.fn(),
  findById: jest.fn(),
};

const mockJwtService = {
  sign: jest.fn().mockReturnValue('mock.jwt.token'),
};

const mockUser = new UserEntity(
  'uuid-123',
  'test@hvalya.com',
  'testuser',
  bcrypt.hashSync('password123', 10),
  UserRole.LISTENER,
  new Date(),
  new Date(),
);

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: USER_REPOSITORY, useValue: mockUserRepository },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register a new user and return accessToken', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockUserRepository.findByUsername.mockResolvedValue(null);
      mockUserRepository.create.mockResolvedValue(mockUser);

      const result = await service.register({
        email: 'test@hvalya.com',
        username: 'testuser',
        password: 'password123',
      });

      expect(result).toEqual({ accessToken: 'mock.jwt.token' });
      expect(mockUserRepository.create).toHaveBeenCalledTimes(1);
    });

    it('should throw ConflictException if email already exists', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(mockUser);

      await expect(
        service.register({
          email: 'test@hvalya.com',
          username: 'testuser',
          password: 'password123',
        }),
      ).rejects.toThrow(ConflictException);

      expect(mockUserRepository.create).not.toHaveBeenCalled();
    });

    it('should throw ConflictException if username already taken', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockUserRepository.findByUsername.mockResolvedValue(mockUser);

      await expect(
        service.register({
          email: 'new@hvalya.com',
          username: 'testuser',
          password: 'password123',
        }),
      ).rejects.toThrow(ConflictException);

      expect(mockUserRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('should return accessToken on valid credentials', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(mockUser);

      const result = await service.login({
        email: 'test@hvalya.com',
        password: 'password123',
      });

      expect(result).toEqual({ accessToken: 'mock.jwt.token' });
    });

    it('should throw UnauthorizedException if user not found', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(null);

      await expect(
        service.login({
          email: 'ghost@hvalya.com',
          password: 'password123',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if password is wrong', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(mockUser);

      await expect(
        service.login({
          email: 'test@hvalya.com',
          password: 'wrongpassword',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});