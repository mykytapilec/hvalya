import { Injectable } from '@nestjs/common';
import { Subscription } from '@prisma/client';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import {
  ISubscriptionRepository,
  ICreateSubscriptionData,
  IUpdateSubscriptionData,
} from '../../../modules/subscriptions/subscription.repository.interface';
import { SubscriptionEntity } from '../../../domain/subscription/subscription.entity';
import { SubscriptionTier, SubscriptionStatus } from '@hvalya/types';

@Injectable()
export class SubscriptionsPrismaRepository implements ISubscriptionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByUserId(userId: string): Promise<SubscriptionEntity | null> {
    const sub = await this.prisma.subscription.findUnique({ where: { userId } });
    return sub ? this.toEntity(sub) : null;
  }

  async findById(id: string): Promise<SubscriptionEntity | null> {
    const sub = await this.prisma.subscription.findUnique({ where: { id } });
    return sub ? this.toEntity(sub) : null;
  }

  async create(data: ICreateSubscriptionData): Promise<SubscriptionEntity> {
    const sub = await this.prisma.subscription.create({ data });
    return this.toEntity(sub);
  }

  async update(id: string, data: IUpdateSubscriptionData): Promise<SubscriptionEntity> {
    const sub = await this.prisma.subscription.update({ where: { id }, data });
    return this.toEntity(sub);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.subscription.delete({ where: { id } });
  }

  private toEntity(raw: Subscription): SubscriptionEntity {
    return new SubscriptionEntity(
      raw.id,
      raw.userId,
      raw.tier as unknown as SubscriptionTier,
      raw.status as unknown as SubscriptionStatus,
      raw.startedAt,
      raw.expiresAt,
      raw.createdAt,
      raw.updatedAt,
    );
  }
}