import {
  Injectable,
  Inject,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import {
  ISubscriptionRepository,
  SUBSCRIPTION_REPOSITORY,
} from '../subscription.repository.interface';
import { SubscriptionEntity } from '../../../domain/subscription/subscription.entity';
import { SubscriptionTier, SubscriptionStatus } from '@hvalya/types';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';

@Injectable()
export class SubscriptionsService {
  constructor(
    @Inject(SUBSCRIPTION_REPOSITORY)
    private readonly subscriptionRepository: ISubscriptionRepository,
  ) {}

  async getMySubscription(userId: string): Promise<SubscriptionEntity> {
    const sub = await this.subscriptionRepository.findByUserId(userId);
    if (!sub) throw new NotFoundException('Subscription not found');
    return sub;
  }

  async createDefault(userId: string): Promise<SubscriptionEntity> {
    const existing = await this.subscriptionRepository.findByUserId(userId);
    if (existing) throw new ConflictException('Subscription already exists');

    return this.subscriptionRepository.create({
      userId,
      tier: SubscriptionTier.FREE,
      status: SubscriptionStatus.ACTIVE,
    });
  }

  async upgrade(userId: string, dto: UpdateSubscriptionDto): Promise<SubscriptionEntity> {
    const sub = await this.subscriptionRepository.findByUserId(userId);
    if (!sub) throw new NotFoundException('Subscription not found');

    return this.subscriptionRepository.update(sub.id, {
      tier: dto.tier,
      status: dto.status,
      expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : undefined,
    });
  }

  async findById(id: string): Promise<SubscriptionEntity> {
    const sub = await this.subscriptionRepository.findById(id);
    if (!sub) throw new NotFoundException(`Subscription ${id} not found`);
    return sub;
  }

  async update(id: string, dto: UpdateSubscriptionDto): Promise<SubscriptionEntity> {
    await this.findById(id);
    return this.subscriptionRepository.update(id, {
      tier: dto.tier,
      status: dto.status,
      expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : undefined,
    });
  }

  async delete(id: string): Promise<void> {
    await this.findById(id);
    return this.subscriptionRepository.delete(id);
  }
}