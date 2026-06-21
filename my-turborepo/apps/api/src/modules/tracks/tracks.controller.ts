import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { UserRole } from '@hvalya/types';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { TracksService } from './application/tracks.service';
import { ArtistsService } from '../artists/application/artists.service';
import { CreateTrackDto } from './application/dto/create-track.dto';
import { UpdateTrackDto } from './application/dto/update-track.dto';

interface AuthenticatedRequest {
  user: { id: string; email: string; username: string; role: UserRole };
}

@Controller('tracks')
export class TracksController {
  constructor(
    private readonly tracksService: TracksService,
    private readonly artistsService: ArtistsService,
  ) {}

  @Get()
  findAll() {
    return this.tracksService.findAll();
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.tracksService.findById(id);
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
}
