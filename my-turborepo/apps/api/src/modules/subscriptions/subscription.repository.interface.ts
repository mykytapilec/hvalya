import { SubscriptionEntity } from '../../domain/subscription/subscription.entity';
import { SubscriptionTier, SubscriptionStatus } from '@hvalya/types';

export interface ICreateSubscriptionData {
  userId: string;
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  expiresAt?: Date;
}

export interface IUpdateSubscriptionData {
  tier?: SubscriptionTier;
  status?: SubscriptionStatus;
  expiresAt?: Date | null;
}

export interface ISubscriptionRepository {
  findByUserId(userId: string): Promise<SubscriptionEntity | null>;
  findById(id: string): Promise<SubscriptionEntity | null>;
  create(data: ICreateSubscriptionData): Promise<SubscriptionEntity>;
  update(id: string, data: IUpdateSubscriptionData): Promise<SubscriptionEntity>;
  delete(id: string): Promise<void>;
}

export const SUBSCRIPTION_REPOSITORY = Symbol('ISubscriptionRepository');