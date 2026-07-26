import { Injectable, Inject, NotFoundException, ForbiddenException } from '@nestjs/common';
import { UserRole } from '@hvalya/types';
import {
  ITrackRepository,
  TRACK_REPOSITORY,
  IUpdateTrackData,
} from '../../../domain/track/track.repository.interface';
import { TrackEntity } from '../../../domain/track/track.entity';
import { CreateTrackDto } from './dto/create-track.dto';
import { UpdateTrackDto } from './dto/update-track.dto';

@Injectable()
export class TracksService {
  constructor(
    @Inject(TRACK_REPOSITORY)
    private readonly trackRepository: ITrackRepository,
  ) {}

  async findAll(): Promise<TrackEntity[]> {
    return this.trackRepository.findAll();
  }

  async findById(id: string): Promise<TrackEntity> {
    const track = await this.trackRepository.findById(id);
    if (!track) throw new NotFoundException(`Track ${id} not found`);
    return track;
  }

  async findByArtistId(artistId: string): Promise<TrackEntity[]> {
    return this.trackRepository.findByArtistId(artistId);
  }

  async create(artistId: string, dto: CreateTrackDto): Promise<TrackEntity> {
    return this.trackRepository.create({
      title: dto.title,
      duration: dto.duration,
      audioUrl: dto.audioUrl,
      artistId,
      albumId: dto.albumId,
    });
  }

  async update(
    id: string,
    dto: UpdateTrackDto,
    requesterArtistId: string,
    requesterRole: UserRole,
  ): Promise<TrackEntity> {
    const track = await this.findById(id);
    this.assertOwnership(track, requesterArtistId, requesterRole);

    const updateData: IUpdateTrackData = {
      title: dto.title,
      duration: dto.duration,
      audioUrl: dto.audioUrl,
      albumId: dto.albumId,
    };
    if (dto.genre !== undefined) {
      updateData.genres = [dto.genre];
    }

    return this.trackRepository.update(id, updateData);
  }

  async delete(id: string, requesterArtistId: string, requesterRole: UserRole): Promise<void> {
    const track = await this.findById(id);
    this.assertOwnership(track, requesterArtistId, requesterRole);
    return this.trackRepository.delete(id);
  }

  private assertOwnership(
    track: TrackEntity,
    requesterArtistId: string,
    requesterRole: UserRole,
  ): void {
    if (requesterRole === UserRole.ADMIN) return;
    if (track.artistId !== requesterArtistId) {
      throw new ForbiddenException('You do not have permission to modify this track');
    }
  }
}