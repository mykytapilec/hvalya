import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtStrategy } from './jwt.strategy';
import { UserEntity } from '../../../domain/user/user.entity';
import { UserRole } from '@hvalya/types';
import { UsersService } from '../application/users.service';

const mockUsersService = {
  findById: jest.fn(),
};

const mockConfigService = {
  get: jest.fn().mockReturnValue('test_secret'),
};

const mockUser = new UserEntity(
  'uuid-123',
  'test@hvalya.com',
  'testuser',
  'hashedpassword',
  UserRole.LISTENER,
  new Date(),
  new Date(),
);

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        { provide: UsersService, useValue: mockUsersService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    strategy = module.get<JwtStrategy>(JwtStrategy);
    jest.clearAllMocks();
  });

  describe('validate', () => {
    it('should return user payload if user exists', async () => {
      mockUsersService.findById.mockResolvedValue(mockUser);

      const result = await strategy.validate({
        sub: 'uuid-123',
        email: 'test@hvalya.com',
        role: UserRole.LISTENER,
      });

      expect(result).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        username: mockUser.username,
        role: mockUser.role,
      });
      expect(mockUsersService.findById).toHaveBeenCalledWith('uuid-123');
    });

    it('should throw UnauthorizedException if user not found', async () => {
      mockUsersService.findById.mockResolvedValue(null);

      await expect(
        strategy.validate({
          sub: 'non-existent',
          email: 'ghost@hvalya.com',
          role: UserRole.LISTENER,
        }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});