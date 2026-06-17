import {
  Injectable,
  Inject,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { CreateArtistDto } from './application/dto/create-artist.dto';import { UpdateArtistDto } from './application/dto/update-artist.dto';
import { ARTIST_REPOSITORY, IArtistRepository } from '../../domain/artist/artist.repository.interface';
import { ArtistEntity } from '../../domain/artist/artist.entity';

@Injectable()
export class ArtistsService {
  constructor(
    @Inject(ARTIST_REPOSITORY)
    private readonly artistRepository: IArtistRepository,
  ) {}

  async findAll(): Promise<ArtistEntity[]> {
    return this.artistRepository.findAll();
  }

  async findById(id: string): Promise<ArtistEntity> {
    const artist = await this.artistRepository.findById(id);
    if (!artist) throw new NotFoundException(`Artist ${id} not found`);
    return artist;
  }

  async findByUserId(userId: string): Promise<ArtistEntity> {
    const artist = await this.artistRepository.findByUserId(userId);
    if (!artist) {
      throw new NotFoundException('Artist profile not found for this user. Create one first.');
    }
    return artist;
  }

  async create(userId: string, dto: CreateArtistDto): Promise<ArtistEntity> {
    const existing = await this.artistRepository.findByUserId(userId);
    if (existing) {
      throw new ConflictException('User already has an artist profile');
    }
    return this.artistRepository.create({ name: dto.name!, userId });
  }

  async update(id: string, dto: UpdateArtistDto): Promise<ArtistEntity> {
    await this.findById(id);
    return this.artistRepository.update(id, dto);
  }

  async delete(id: string): Promise<void> {
    await this.findById(id);
    return this.artistRepository.delete(id);
  }
}


