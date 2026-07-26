import { UserEntity } from './user.entity';
import { UserRole } from '@hvalya/types';

export interface IUserRepository {
  findById(id: string): Promise<UserEntity | null>;
  findByEmail(email: string): Promise<UserEntity | null>;
  findByUsername(username: string): Promise<UserEntity | null>;
  create(data: {
    email: string;
    username: string;
    passwordHash: string;
  }): Promise<UserEntity>;
  updateRole(id: string, role: UserRole): Promise<UserEntity>;
}

export const USER_REPOSITORY = Symbol('IUserRepository');