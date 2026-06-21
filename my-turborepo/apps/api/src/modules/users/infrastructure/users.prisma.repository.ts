import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { UserRole } from '@hvalya/types';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import { IUserRepository } from '../../../domain/user/user.repository.interface';
import { UserEntity } from '../../../domain/user/user.entity';

@Injectable()
export class UsersPrismaRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<UserEntity | null> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    return user ? this.toEntity(user) : null;
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    return user ? this.toEntity(user) : null;
  }

  async findByUsername(username: string): Promise<UserEntity | null> {
    const user = await this.prisma.user.findUnique({ where: { username } });
    return user ? this.toEntity(user) : null;
  }

  async create(data: {
    email: string;
    username: string;
    passwordHash: string;
  }): Promise<UserEntity> {
    const user = await this.prisma.user.create({ data });
    return this.toEntity(user);
  }

  async updateRole(id: string, role: UserRole): Promise<UserEntity> {
    const user = await this.prisma.user.update({ where: { id }, data: { role } });
    return this.toEntity(user);
  }

  private toEntity(raw: User): UserEntity {
    return new UserEntity(
      raw.id,
      raw.email,
      raw.username,
      raw.passwordHash,
      raw.role as unknown as UserRole,
      raw.createdAt,
      raw.updatedAt,
    );
  }
}