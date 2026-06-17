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
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TracksService } from './application/tracks.service';
import { ArtistsService } from '../artists/application/artists.service';
import { CreateTrackDto } from './application/dto/create-track.dto';
import { UpdateTrackDto } from './application/dto/update-track.dto';

interface AuthenticatedRequest {
  user: { id: string; email: string; username: string };
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
  @UseGuards(JwtAuthGuard)
  async create(@Request() req: AuthenticatedRequest, @Body() dto: CreateTrackDto) {
    const artist = await this.artistsService.findByUserId(req.user.id);
    return this.tracksService.create(artist.id, dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(@Param('id') id: string, @Body() dto: UpdateTrackDto) {
    return this.tracksService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  delete(@Param('id') id: string) {
    return this.tracksService.delete(id);
  }
}