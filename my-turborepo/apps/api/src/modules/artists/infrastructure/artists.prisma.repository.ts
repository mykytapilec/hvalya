import { Injectable } from '@nestjs/common';
import { Artist } from '@prisma/client';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import {
  IArtistRepository,
  ICreateArtistData,
  IUpdateArtistData,
} from '../../../domain/artist/artist.repository.interface';
import { ArtistEntity } from '../../../domain/artist/artist.entity';

@Injectable()
export class ArtistsPrismaRepository implements IArtistRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<ArtistEntity[]> {
    const artists = await this.prisma.artist.findMany();
    return artists.map(this.toEntity);
  }

  async findById(id: string): Promise<ArtistEntity | null> {
    const artist = await this.prisma.artist.findUnique({ where: { id } });
    return artist ? this.toEntity(artist) : null;
  }

  async findByUserId(userId: string): Promise<ArtistEntity | null> {
    const artist = await this.prisma.artist.findUnique({ where: { userId } });
    return artist ? this.toEntity(artist) : null;
  }

  async create(data: ICreateArtistData): Promise<ArtistEntity> {
    const artist = await this.prisma.artist.create({ data });
    return this.toEntity(artist);
  }

  async update(id: string, data: IUpdateArtistData): Promise<ArtistEntity> {
    const artist = await this.prisma.artist.update({ where: { id }, data });
    return this.toEntity(artist);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.artist.delete({ where: { id } });
  }

  private toEntity(raw: Artist): ArtistEntity {
    return new ArtistEntity(
      raw.id,
      raw.name,
      raw.userId,
      raw.createdAt,
      raw.updatedAt,
    );
  }
}