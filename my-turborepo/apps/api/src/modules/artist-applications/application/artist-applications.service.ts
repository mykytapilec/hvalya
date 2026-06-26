import {
  Injectable,
  Inject,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { ArtistApplicationStatus, UserRole } from '@hvalya/types';
import {
  IArtistApplicationRepository,
  ARTIST_APPLICATION_REPOSITORY,
} from '../../../domain/artist-application/artist-application.repository.interface';
import { ArtistApplicationEntity } from '../../../domain/artist-application/artist-application.entity';
import { IUserRepository, USER_REPOSITORY } from '../../../domain/user/user.repository.interface';
import {
  IArtistRepository,
  ARTIST_REPOSITORY,
} from '../../../domain/artist/artist.repository.interface';
import { CreateArtistApplicationDto } from './dto/create-artist-application.dto';
import { RejectArtistApplicationDto } from './dto/reject-artist-application.dto';

@Injectable()
export class ArtistApplicationsService {
  constructor(
    @Inject(ARTIST_APPLICATION_REPOSITORY)
    private readonly applicationRepository: IArtistApplicationRepository,
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(ARTIST_REPOSITORY)
    private readonly artistRepository: IArtistRepository,
  ) {}

  async apply(
    userId: string,
    dto: CreateArtistApplicationDto,
  ): Promise<ArtistApplicationEntity> {
    const existing = await this.applicationRepository.findByUserId(userId);
    if (existing && existing.status === ArtistApplicationStatus.PENDING) {
      throw new ConflictException('You already have a pending artist application');
    }

    return this.applicationRepository.create({
      userId,
      bio: dto.bio,
      socialLinks: dto.socialLinks,
    });
  }

  async findAll(): Promise<ArtistApplicationEntity[]> {
    return this.applicationRepository.findAll();
  }

  async findPending(): Promise<ArtistApplicationEntity[]> {
    return this.applicationRepository.findPending();
  }

  async findMine(userId: string): Promise<ArtistApplicationEntity | null> {
    return this.applicationRepository.findByUserId(userId);
  }

  async approve(id: string): Promise<ArtistApplicationEntity> {
    const application = await this.applicationRepository.findById(id);
    if (!application) throw new NotFoundException(`Application ${id} not found`);
    if (application.status !== ArtistApplicationStatus.PENDING) {
      throw new BadRequestException('Application has already been reviewed');
    }

    const updated = await this.applicationRepository.update(id, {
      status: ArtistApplicationStatus.APPROVED,
      reviewedAt: new Date(),
    });

    await this.userRepository.updateRole(application.userId, UserRole.ARTIST);

    const existingArtist = await this.artistRepository.findByUserId(application.userId);
    if (!existingArtist) {
      await this.artistRepository.create({
        name: `Artist-${application.userId.slice(0, 8)}`,
        bio: application.bio,
        socialLinks: application.socialLinks,
        userId: application.userId,
      });
    }

    return updated;
  }

  async reject(id: string, dto: RejectArtistApplicationDto): Promise<ArtistApplicationEntity> {
    const application = await this.applicationRepository.findById(id);
    if (!application) throw new NotFoundException(`Application ${id} not found`);
    if (application.status !== ArtistApplicationStatus.PENDING) {
      throw new BadRequestException('Application has already been reviewed');
    }

    return this.applicationRepository.update(id, {
      status: ArtistApplicationStatus.REJECTED,
      reviewedAt: new Date(),
      rejectionReason: dto.rejectionReason,
    });
  }
}
