import { Test, TestingModule } from '@nestjs/testing';
// import { UsersService } from './users.service';
// import { USER_REPOSITORY } from '../../../domain/user/user.repository.interface';
// import { UserEntity } from '../../../domain/user/user.entity';
import { UserRole } from '@hvalya/types';
import { UserEntity } from '../../domain/user/user.entity';
import { UsersService } from '../auth/application/users.service';
import { USER_REPOSITORY } from '../../domain/user/user.repository.interface';

const mockUserRepository = {
  findById: jest.fn(),
  findByEmail: jest.fn(),
  findByUsername: jest.fn(),
  create: jest.fn(),
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

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: USER_REPOSITORY, useValue: mockUserRepository },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    jest.clearAllMocks();
  });

  it('should return user by id', async () => {
    mockUserRepository.findById.mockResolvedValue(mockUser);

    const result = await service.findById('uuid-123');

    expect(result).toEqual(mockUser);
    expect(mockUserRepository.findById).toHaveBeenCalledWith('uuid-123');
  });

  it('should return null if user not found by id', async () => {
    mockUserRepository.findById.mockResolvedValue(null);

    const result = await service.findById('non-existent');

    expect(result).toBeNull();
  });

  it('should return user by email', async () => {
    mockUserRepository.findByEmail.mockResolvedValue(mockUser);

    const result = await service.findByEmail('test@hvalya.com');

    expect(result).toEqual(mockUser);
  });

  it('should return user by username', async () => {
    mockUserRepository.findByUsername.mockResolvedValue(mockUser);

    const result = await service.findByUsername('testuser');

    expect(result).toEqual(mockUser);
  });
});