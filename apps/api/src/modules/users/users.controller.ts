import { Controller, Get, UseGuards, Request, Query } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RecommendationsService } from '../recommendations/recommendations.service';

interface AuthenticatedRequest {
  user: { id: string; email: string; username: string };
}

@Controller('users')
export class UsersController {
  constructor(private readonly recommendationsService: RecommendationsService) {}

  @Get('me/recommendations')
  @UseGuards(JwtAuthGuard)
  getMyRecommendations(
    @Request() req: AuthenticatedRequest,
    @Query('limit') limit?: string,
  ) {
    const parsedLimit = limit ? parseInt(limit, 10) : 10;
    return this.recommendationsService.getRecommendedTracks(req.user.id, parsedLimit);
  }
}
