import {
  Injectable,
  Inject,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import {
  IArtistRepository,
  ARTIST_REPOSITORY,
} from '../../../domain/artist/artist.repository.interface';
import { ArtistEntity } from '../../../domain/artist/artist.entity';
import { CreateArtistDto } from './dto/create-artist.dto';
import { UpdateArtistDto } from './dto/update-artist.dto';

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