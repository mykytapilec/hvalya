import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { extname } from 'path';
import { UserRole } from '@hvalya/types';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { ReleasesService } from './application/releases.service';
import { ArtistsService } from '../artists/application/artists.service';
import { CreateReleaseDto } from './application/dto/create-release.dto';
import { UpdateReleaseDto } from './application/dto/update-release.dto';
import { S3Service } from '../../infrastructure/s3/s3.service';
import { ReleaseEntity } from '../../domain/release/release.entity';

interface AuthenticatedRequest {
  user: { id: string; email: string; username: string; role: UserRole };
}

const COVER_PRESIGN_TTL = 7 * 24 * 60 * 60; // 7 days

@Controller('releases')
export class ReleasesController {
  constructor(
    private readonly releasesService: ReleasesService,
    private readonly artistsService: ArtistsService,
    private readonly s3Service: S3Service,
  ) {}

  @Get()
  async findAll() {
    const releases = await this.releasesService.findAll();
    return Promise.all(releases.map((r) => this.toPublicRelease(r)));
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    const release = await this.releasesService.findById(id);
    return this.toPublicRelease(release);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ARTIST, UserRole.ADMIN)
  async create(
    @Request() req: AuthenticatedRequest,
    @Body() dto: CreateReleaseDto,
  ) {
    const artist = await this.artistsService.findByUserId(req.user.id);
    return this.releasesService.create(artist.id, dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ARTIST, UserRole.ADMIN)
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateReleaseDto,
    @Request() req: AuthenticatedRequest,
  ) {
    const requesterArtistId = await this.resolveRequesterArtistId(req);
    return this.releasesService.update(id, dto, requesterArtistId, req.user.role);
  }

  @Post(':id/cover')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ARTIST, UserRole.ADMIN)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      fileFilter: (_req, file, cb) => {
        if (!file.mimetype.startsWith('image/')) {
          return cb(new Error('Only image files are allowed'), false);
        }
        cb(null, true);
      },
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  async uploadCover(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @Request() req: AuthenticatedRequest,
  ) {
    const requesterArtistId = await this.resolveRequesterArtistId(req);
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const key = `covers/${unique}${extname(file.originalname)}`;
    await this.s3Service.uploadFile(file.buffer, key, file.mimetype);
    return this.releasesService.updateCover(id, key, requesterArtistId, req.user.role);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ARTIST, UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(
    @Param('id') id: string,
    @Request() req: AuthenticatedRequest,
  ) {
    const requesterArtistId = await this.resolveRequesterArtistId(req);
    return this.releasesService.delete(id, requesterArtistId, req.user.role);
  }

  private async resolveRequesterArtistId(
    req: AuthenticatedRequest,
  ): Promise<string> {
    if (req.user.role === UserRole.ADMIN) return '';
    const artist = await this.artistsService.findByUserId(req.user.id);
    return artist.id;
  }

  private async toPublicRelease(release: ReleaseEntity) {
    if (!release.coverUrl) return release;
    const coverUrl = await this.s3Service.getPresignedUrl(
      release.coverUrl,
      COVER_PRESIGN_TTL,
    );
    return { ...release, coverUrl };
  }
}
