import { SubscriptionTier, SubscriptionStatus } from './enums';

export interface ISubscription {
  id: string;
  userId: string;
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  startedAt: Date;
  expiresAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}