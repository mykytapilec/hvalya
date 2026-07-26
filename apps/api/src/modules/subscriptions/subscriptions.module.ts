import { Module } from '@nestjs/common';
import { SubscriptionsController } from './subscriptions.controller';
import { SubscriptionsService } from './application/subscriptions.service';
import { SubscriptionsPrismaRepository } from './infrastructure/subscriptions.prisma.repository';
import { SUBSCRIPTION_REPOSITORY } from './subscription.repository.interface';

@Module({
  controllers: [SubscriptionsController],
  providers: [
    SubscriptionsService,
    {
      provide: SUBSCRIPTION_REPOSITORY,
      useClass: SubscriptionsPrismaRepository,
    },
  ],
  exports: [SubscriptionsService],
})
export class SubscriptionsModule {}