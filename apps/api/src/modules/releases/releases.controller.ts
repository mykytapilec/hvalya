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
import { diskStorage } from 'multer';
import { extname } from 'path';
import { UserRole } from '@hvalya/types';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { ReleasesService } from './application/releases.service';
import { ArtistsService } from '../artists/application/artists.service';
import { CreateReleaseDto } from './application/dto/create-release.dto';
import { UpdateReleaseDto } from './application/dto/update-release.dto';



interface AuthenticatedRequest {
  user: { id: string; email: string; username: string; role: UserRole };
}

@Controller('releases')
export class ReleasesController {
  constructor(
    private readonly releasesService: ReleasesService,
    private readonly artistsService: ArtistsService,
  ) {}

  @Get()
  findAll() {
    return this.releasesService.findAll();
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.releasesService.findById(id);
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
      storage: diskStorage({
        destination: './uploads/covers',
        filename: (_req, file, cb) => {
          const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
          cb(null, `${unique}${extname(file.originalname)}`);
        },
      }),
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
    const coverUrl = `${process.env.API_URL ?? 'http://localhost:3001'}/uploads/covers/${file.filename}`;
    return this.releasesService.updateCover(id, coverUrl, requesterArtistId, req.user.role);
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
}