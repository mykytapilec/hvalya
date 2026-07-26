import { Injectable } from '@nestjs/common';
import { Track } from '@prisma/client';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import {
  ITrackRepository,
  ICreateTrackData,
  IUpdateTrackData,
} from '../../../domain/track/track.repository.interface';
import { TrackEntity } from '../../../domain/track/track.entity';

@Injectable()
export class TracksPrismaRepository implements ITrackRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<TrackEntity[]> {
    const tracks = await this.prisma.track.findMany();
    return tracks.map(this.toEntity);
  }

  async findById(id: string): Promise<TrackEntity | null> {
    const track = await this.prisma.track.findUnique({ where: { id } });
    return track ? this.toEntity(track) : null;
  }

 async findByIds(ids: string[]): Promise<TrackEntity[]> {
    if (ids.length === 0) return [];
    const tracks = await this.prisma.track.findMany({ where: { id: { in: ids } } });
    return tracks.map(this.toEntity);
  }

  async findByArtistId(artistId: string): Promise<TrackEntity[]> {
    const tracks = await this.prisma.track.findMany({ where: { artistId } });
    return tracks.map(this.toEntity);
  }

  async create(data: ICreateTrackData): Promise<TrackEntity> {
    const track = await this.prisma.track.create({ data });
    return this.toEntity(track);
  }

  async update(id: string, data: IUpdateTrackData): Promise<TrackEntity> {
    const track = await this.prisma.track.update({ where: { id }, data });
    return this.toEntity(track);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.track.delete({ where: { id } });
  }

  private toEntity(raw: Track): TrackEntity {
    return new TrackEntity(
      raw.id,
      raw.title,
      raw.duration,
      raw.audioUrl,
      raw.artistId,
      raw.albumId,
      raw.genres,
      raw.createdAt,
      raw.updatedAt,
    );
  }
}