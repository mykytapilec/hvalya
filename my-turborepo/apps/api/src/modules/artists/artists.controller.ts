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
import { ArtistsService } from './application/artists.service';
import { CreateArtistDto } from './application/dto/create-artist.dto';
import { UpdateArtistDto } from './application/dto/update-artist.dto';

interface AuthenticatedRequest {
  user: { id: string; email: string; username: string; role: UserRole };
}

@Controller('artists')
export class ArtistsController {
  constructor(private readonly artistsService: ArtistsService) {}

  @Get()
  findAll() {
    return this.artistsService.findAll();
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.artistsService.findById(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ARTIST, UserRole.ADMIN)
  create(@Request() req: AuthenticatedRequest, @Body() dto: CreateArtistDto) {
    return this.artistsService.create(req.user.id, dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ARTIST, UserRole.ADMIN)
  update(
    @Param('id') id: string,
    @Body() dto: UpdateArtistDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.artistsService.update(id, dto, req.user.id, req.user.role);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ARTIST, UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  delete(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    return this.artistsService.delete(id, req.user.id, req.user.role);
  }
}
