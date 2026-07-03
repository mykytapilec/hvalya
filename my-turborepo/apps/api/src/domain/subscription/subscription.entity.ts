import { SubscriptionTier, SubscriptionStatus } from '@hvalya/types';

export class SubscriptionEntity {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly tier: SubscriptionTier,
    public readonly status: SubscriptionStatus,
    public readonly startedAt: Date,
    public readonly trialEndsAt: Date | null,
    public readonly expiresAt: Date | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}
}