export interface IRecommendationClient {
  getRecommendedTrackIds(userId: string, limit?: number): Promise<string[]>;
}

export const RECOMMENDATION_CLIENT = Symbol('IRecommendationClient');