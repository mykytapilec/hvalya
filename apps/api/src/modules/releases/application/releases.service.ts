import {
  Injectable,
  Inject,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { UserRole } from '@hvalya/types';
import {
  IReleaseRepository,
  RELEASE_REPOSITORY,
} from '../../../domain/release/release.repository.interface';
import { ReleaseEntity } from '../../../domain/release/release.entity';
import { CreateReleaseDto } from './dto/create-release.dto';
import { UpdateReleaseDto } from './dto/update-release.dto';

@Injectable()
export class ReleasesService {
  constructor(
    @Inject(RELEASE_REPOSITORY)
    private readonly releaseRepository: IReleaseRepository,
  ) {}

  async findAll(): Promise<ReleaseEntity[]> {
    return this.releaseRepository.findAll();
  }

  async findById(id: string): Promise<ReleaseEntity> {
    const release = await this.releaseRepository.findById(id);
    if (!release) throw new NotFoundException(`Release ${id} not found`);
    return release;
  }

  async findByArtistId(artistId: string): Promise<ReleaseEntity[]> {
    return this.releaseRepository.findByArtistId(artistId);
  }

  async create(
    artistId: string,
    dto: CreateReleaseDto,
  ): Promise<ReleaseEntity> {
    return this.releaseRepository.create({
      title: dto.title,
      type: dto.type,
      coverUrl: dto.coverUrl,
      releasedAt: new Date(dto.releasedAt),
      genre: dto.genre,
      artistIds: [artistId],
      tracks: dto.tracks.map((t) => ({
        title: t.title,
        duration: t.duration ?? 0,
        audioUrl: t.audioUrl,
        artistId,
        genres: [dto.genre],
      })),
    });
  }

  async update(
    id: string,
    dto: UpdateReleaseDto,
    requesterArtistId: string,
    requesterRole: UserRole,
  ): Promise<ReleaseEntity> {
    const release = await this.findById(id);
    this.assertOwnership(release, requesterArtistId, requesterRole);
    return this.releaseRepository.update(id, {
      title: dto.title,
      type: dto.type,
      coverUrl: dto.coverUrl,
      releasedAt: dto.releasedAt ? new Date(dto.releasedAt) : undefined,
      genre: dto.genre,
    });
  }

  async updateCover(
    id: string,
    coverUrl: string,
    requesterArtistId: string,
    requesterRole: UserRole,
  ): Promise<ReleaseEntity> {
    const release = await this.findById(id);
    this.assertOwnership(release, requesterArtistId, requesterRole);
    return this.releaseRepository.updateCover(id, coverUrl);
  }

  async delete(
    id: string,
    requesterArtistId: string,
    requesterRole: UserRole,
  ): Promise<void> {
    const release = await this.findById(id);
    this.assertOwnership(release, requesterArtistId, requesterRole);
    return this.releaseRepository.delete(id);
  }

  private assertOwnership(
    release: ReleaseEntity,
    requesterArtistId: string,
    requesterRole: UserRole,
  ): void {
    if (requesterRole === UserRole.ADMIN) return;
    if (!release.artistIds.includes(requesterArtistId)) {
      throw new ForbiddenException(
        'You do not have permission to modify this release',
      );
    }
  }
}