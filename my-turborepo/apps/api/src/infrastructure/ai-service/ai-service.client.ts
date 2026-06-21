import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { IRecommendationClient } from '../../domain/recommendation/recommendation.client.interface';

interface RecommendationResponse {
  user_id: string;
  track_ids: string[];
}

@Injectable()
export class AiServiceClient implements IRecommendationClient {
  private readonly logger = new Logger(AiServiceClient.name);
  private readonly baseUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.baseUrl = this.configService.get<string>(
      'AI_SERVICE_URL',
      'http://localhost:8000',
    );
  }

  async getRecommendedTrackIds(userId: string, limit = 10): Promise<string[]> {
    try {
      const response = await firstValueFrom(
        this.httpService.get<RecommendationResponse>(
          `${this.baseUrl}/api/v1/recommend/${userId}`,
          { params: { limit }, timeout: 5000 },
        ),
      );
      return response.data.track_ids;
    } catch (error) {
      this.logger.error(`AI service unavailable for user ${userId}`, error);
      throw new ServiceUnavailableException('Recommendation service is currently unavailable');
    }
  }
}
