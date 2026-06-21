import { Module } from '@nestjs/common';
import { RecommendationsService } from './recommendations.service';
import { AiServiceModule } from '../../infrastructure/ai-service/ai-service.module';
import { TracksModule } from '../tracks/tracks.module';

@Module({
  imports: [AiServiceModule, TracksModule],
  providers: [RecommendationsService],
  exports: [RecommendationsService],
})
export class RecommendationsModule {}
