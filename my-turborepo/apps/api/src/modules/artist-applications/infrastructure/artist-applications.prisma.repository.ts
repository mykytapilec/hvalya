import { Injectable } from '@nestjs/common';
import { ArtistApplication } from '@prisma/client';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import {
  IArtistApplicationRepository,
  ICreateArtistApplicationData,
  IUpdateArtistApplicationData,
} from '../../../domain/artist-application/artist-application.repository.interface';
import { ArtistApplicationEntity } from '../../../domain/artist-application/artist-application.entity';
import { ArtistApplicationStatus } from '@hvalya/types';

@Injectable()
export class ArtistApplicationsPrismaRepository implements IArtistApplicationRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<ArtistApplicationEntity[]> {
    const applications = await this.prisma.artistApplication.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return applications.map((a) => this.toEntity(a));
  }

  async findById(id: string): Promise<ArtistApplicationEntity | null> {
    const application = await this.prisma.artistApplication.findUnique({ where: { id } });
    return application ? this.toEntity(application) : null;
  }

  async findByUserId(userId: string): Promise<ArtistApplicationEntity | null> {
    const application = await this.prisma.artistApplication.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    return application ? this.toEntity(application) : null;
  }

  async findPending(): Promise<ArtistApplicationEntity[]> {
    const applications = await this.prisma.artistApplication.findMany({
      where: { status: 'PENDING' },
      orderBy: { createdAt: 'asc' },
    });
    return applications.map((a) => this.toEntity(a));
  }

  async create(data: ICreateArtistApplicationData): Promise<ArtistApplicationEntity> {
    const application = await this.prisma.artistApplication.create({
      data: {
        userId: data.userId,
        name: data.name,
        bio: data.bio,
        socialLinks: data.socialLinks ?? '',
      },
    });
    return this.toEntity(application);
  }

  async update(
    id: string,
    data: IUpdateArtistApplicationData,
  ): Promise<ArtistApplicationEntity> {
    const application = await this.prisma.artistApplication.update({ where: { id }, data });
    return this.toEntity(application);
  }

  private toEntity(raw: ArtistApplication): ArtistApplicationEntity {
    return new ArtistApplicationEntity(
      raw.id,
      raw.userId,
      raw.name,
      raw.bio,
      raw.socialLinks,
      raw.status as unknown as ArtistApplicationStatus,
      raw.reviewedAt,
      raw.rejectionReason,
      raw.createdAt,
      raw.updatedAt,
    );
  }
}