import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import {
  ITrackRepository,
  TRACK_REPOSITORY,
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

  async update(id: string, dto: UpdateTrackDto): Promise<TrackEntity> {
    await this.findById(id);
    return this.trackRepository.update(id, dto);
  }

  async delete(id: string): Promise<void> {
    await this.findById(id);
    return this.trackRepository.delete(id);
  }
}