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
import { TrialGuard } from '../../common/guards/trial.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { TracksService } from './application/tracks.service';
import { ArtistsService } from '../artists//application/artists.service';
import { CreateTrackDto } from './application/dto/create-track.dto';
import { UpdateTrackDto } from './application/dto/update-track.dto';
import { TrackEntity } from '../../domain/track/track.entity';
import { PlaysService } from '../plays/application/plays.service';

interface AuthenticatedRequest {
  user: { id: string; email: string; username: string; role: UserRole };
}

@Controller('tracks')
export class TracksController {
  constructor(
    private readonly tracksService: TracksService,
    private readonly artistsService: ArtistsService,
    private readonly playsService: PlaysService,
  ) {}

  @Get()
  async findAll() {
    const tracks = await this.tracksService.findAll();
    return tracks.map((t) => this.toPublicTrack(t));
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    const track = await this.tracksService.findById(id);
    return this.toPublicTrack(track);
  }

  @Get(':id/play')
  @UseGuards(JwtAuthGuard, TrialGuard)
  async getPlayUrl(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    const track = await this.tracksService.findById(id);
    await this.playsService.recordPlay(req.user.id, id);
    return { audioUrl: track.audioUrl };
  }

  @Post('upload')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ARTIST, UserRole.ADMIN)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/audio',
        filename: (_req, file, cb) => {
          const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
          cb(null, `${unique}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (_req, file, cb) => {
        if (!file.mimetype.startsWith('audio/')) {
          return cb(new Error('Only audio files are allowed'), false);
        }
        cb(null, true);
      },
      limits: { fileSize: 50 * 1024 * 1024 },
    }),
  )
  async uploadAudio(@UploadedFile() file: Express.Multer.File) {
    const audioUrl = `/uploads/audio/${file.filename}`;
    return { audioUrl };
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ARTIST, UserRole.ADMIN)
  async create(@Request() req: AuthenticatedRequest, @Body() dto: CreateTrackDto) {
    const artist = await this.artistsService.findByUserId(req.user.id);
    return this.tracksService.create(artist.id, dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ARTIST, UserRole.ADMIN)
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateTrackDto,
    @Request() req: AuthenticatedRequest,
  ) {
    const requesterArtistId = await this.resolveRequesterArtistId(req);
    return this.tracksService.update(id, dto, requesterArtistId, req.user.role);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ARTIST, UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    const requesterArtistId = await this.resolveRequesterArtistId(req);
    return this.tracksService.delete(id, requesterArtistId, req.user.role);
  }

  private async resolveRequesterArtistId(req: AuthenticatedRequest): Promise<string> {
    if (req.user.role === UserRole.ADMIN) return '';
    const artist = await this.artistsService.findByUserId(req.user.id);
    return artist.id;
  }

  private toPublicTrack(track: TrackEntity) {
    const { audioUrl, ...publicFields } = track;
    return publicFields;
  }
}