import { Injectable, Inject } from '@nestjs/common';
import {
  IRecommendationClient,
  RECOMMENDATION_CLIENT,
} from '../../domain/recommendation/recommendation.client.interface';
import {
  ITrackRepository,
  TRACK_REPOSITORY,
} from '../../domain/track/track.repository.interface';
import { TrackEntity } from '../../domain/track/track.entity';

@Injectable()
export class RecommendationsService {
  constructor(
    @Inject(RECOMMENDATION_CLIENT)
    private readonly recommendationClient: IRecommendationClient,
    @Inject(TRACK_REPOSITORY)
    private readonly trackRepository: ITrackRepository,
  ) {}

  async getRecommendedTracks(userId: string, limit = 10): Promise<TrackEntity[]> {
    const trackIds = await this.recommendationClient.getRecommendedTrackIds(userId, limit);
    return this.trackRepository.findByIds(trackIds);
  }
}
