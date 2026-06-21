import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { UserRole } from '@hvalya/types';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { ArtistApplicationsService } from './application/artist-applications.service';
import { CreateArtistApplicationDto } from './application/dto/create-artist-application.dto';
import { RejectArtistApplicationDto } from './application/dto/reject-artist-application.dto';

interface AuthenticatedRequest {
  user: { id: string; email: string; username: string; role: UserRole };
}

@Controller('artist-applications')
@UseGuards(JwtAuthGuard)
export class ArtistApplicationsController {
  constructor(private readonly applicationsService: ArtistApplicationsService) {}

  @Post()
  apply(@Request() req: AuthenticatedRequest, @Body() dto: CreateArtistApplicationDto) {
    return this.applicationsService.apply(req.user.id, dto);
  }

  @Get('me')
  findMine(@Request() req: AuthenticatedRequest) {
    return this.applicationsService.findMine(req.user.id);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  findAll() {
    return this.applicationsService.findAll();
  }

  @Get('pending')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  findPending() {
    return this.applicationsService.findPending();
  }

  @Patch(':id/approve')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  approve(@Param('id') id: string) {
    return this.applicationsService.approve(id);
  }

  @Patch(':id/reject')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  reject(@Param('id') id: string, @Body() dto: RejectArtistApplicationDto) {
    return this.applicationsService.reject(id, dto);
  }
}