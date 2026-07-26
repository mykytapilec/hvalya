import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { AiServiceClient } from './ai-service.client';
import { RECOMMENDATION_CLIENT } from '../../domain/recommendation/recommendation.client.interface';

@Module({
  imports: [HttpModule, ConfigModule],
  providers: [
    {
      provide: RECOMMENDATION_CLIENT,
      useClass: AiServiceClient,
    },
  ],
  exports: [RECOMMENDATION_CLIENT],
})
export class AiServiceModule {}
