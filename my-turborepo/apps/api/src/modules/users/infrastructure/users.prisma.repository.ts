import { Injectable } from '@nestjs/common';
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

  private toEntity(raw: {
    id: string;
    email: string;
    username: string;
    passwordHash: string;
    createdAt: Date;
    updatedAt: Date;
  }): UserEntity {
    return new UserEntity(
      raw.id,
      raw.email,
      raw.username,
      raw.passwordHash,
      raw.createdAt,
      raw.updatedAt,
    );
  }
}