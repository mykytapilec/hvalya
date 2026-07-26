import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import {
  IReleaseRepository,
  ICreateReleaseData,
  IUpdateReleaseData,
} from '../../../domain/release/release.repository.interface';
import { ReleaseEntity } from '../../../domain/release/release.entity';
import { TrackEntity } from '../../../domain/track/track.entity';
import { ReleaseType, Genre } from '@hvalya/types';

@Injectable()
export class ReleasesPrismaRepository implements IReleaseRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<ReleaseEntity[]> {
    const albums = await this.prisma.album.findMany({
      include: { tracks: true, artists: { select: { artistId: true } } },
      orderBy: { releasedAt: 'desc' },
    });
    return albums.map((a) => this.toEntity(a));
  }

  async findById(id: string): Promise<ReleaseEntity | null> {
    const album = await this.prisma.album.findUnique({
      where: { id },
      include: { tracks: true, artists: { select: { artistId: true } } },
    });
    return album ? this.toEntity(album) : null;
  }

  async findByArtistId(artistId: string): Promise<ReleaseEntity[]> {
    const albums = await this.prisma.album.findMany({
      where: { artists: { some: { artistId } } },
      include: { tracks: true, artists: { select: { artistId: true } } },
      orderBy: { releasedAt: 'desc' },
    });
    return albums.map((a) => this.toEntity(a));
  }

  async create(data: ICreateReleaseData): Promise<ReleaseEntity> {
    const album = await this.prisma.album.create({
      data: {
        title: data.title,
        type: data.type,
        coverUrl: data.coverUrl,
        releasedAt: data.releasedAt,
        genre: data.genre,
        artists: {
          create: data.artistIds.map((artistId) => ({ artistId })),
        },
        tracks: {
          create: data.tracks.map((t) => ({
            title: t.title,
            duration: t.duration,
            audioUrl: t.audioUrl,
            artistId: t.artistId,
            genres: t.genres,
          })),
        },
      },
      include: { tracks: true, artists: { select: { artistId: true } } },
    });
    return this.toEntity(album);
  }

  async update(id: string, data: IUpdateReleaseData): Promise<ReleaseEntity> {
    const album = await this.prisma.album.update({
      where: { id },
      data: {
        ...(data.title !== undefined && { title: data.title }),
        ...(data.type !== undefined && { type: data.type }),
        ...(data.coverUrl !== undefined && { coverUrl: data.coverUrl }),
        ...(data.releasedAt !== undefined && { releasedAt: data.releasedAt }),
        ...(data.genre !== undefined && { genre: data.genre }),
      },
      include: { tracks: true, artists: { select: { artistId: true } } },
    });
    return this.toEntity(album);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.album.delete({ where: { id } });
  }

  async updateCover(id: string, coverUrl: string): Promise<ReleaseEntity> {
    const album = await this.prisma.album.update({
      where: { id },
      data: { coverUrl },
      include: { tracks: true, artists: { select: { artistId: true } } },
    });
    return this.toEntity(album);
  }

  private toEntity(raw: {
    id: string;
    title: string;
    type: string;
    coverUrl: string | null;
    releasedAt: Date | null;
    genre: string | null;
    createdAt: Date;
    updatedAt: Date;
    artists: { artistId: string }[];
    tracks: {
      id: string;
      title: string;
      duration: number;
      audioUrl: string;
      artistId: string;
      albumId: string | null;
      genres: string[];
      createdAt: Date;
      updatedAt: Date;
    }[];
  }): ReleaseEntity {
    return new ReleaseEntity(
      raw.id,
      raw.title,
      raw.type as ReleaseType,
      raw.coverUrl,
      raw.releasedAt ?? new Date(),
      (raw.genre as Genre) ?? null,
      raw.createdAt,
      raw.updatedAt,
      raw.artists.map((a) => a.artistId),
      raw.tracks.map(
        (t) =>
          new TrackEntity(
            t.id,
            t.title,
            t.duration,
            t.audioUrl,
            t.artistId,
            t.albumId,
            t.genres,
            t.createdAt,
            t.updatedAt,
          ),
      ),
    );
  }
}