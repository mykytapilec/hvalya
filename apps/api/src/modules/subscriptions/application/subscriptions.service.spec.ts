import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { SUBSCRIPTION_REPOSITORY } from '../subscription.repository.interface';
import { SubscriptionEntity } from '../../../domain/subscription/subscription.entity';
import { SubscriptionTier, SubscriptionStatus } from '@hvalya/types';

const mockSubscriptionRepository = {
  findByUserId: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

const now = new Date();
const futureDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
const pastDate = new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000);

function makeSub(overrides: Partial<{
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  trialEndsAt: Date | null;
}>): SubscriptionEntity {
  return new SubscriptionEntity(
    'sub-uuid',
    'user-uuid',
    overrides.tier ?? SubscriptionTier.FREE,
    overrides.status ?? SubscriptionStatus.ACTIVE,
    now,
    overrides.trialEndsAt !== undefined ? overrides.trialEndsAt : futureDate,
    null,
    now,
    now,
  );
}

describe('SubscriptionsService', () => {
  let service: SubscriptionsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubscriptionsService,
        { provide: SUBSCRIPTION_REPOSITORY, useValue: mockSubscriptionRepository },
      ],
    }).compile();

    service = module.get<SubscriptionsService>(SubscriptionsService);
    jest.clearAllMocks();
  });

  describe('createDefault', () => {
    it('should create subscription with trialEndsAt ~30 days from now', async () => {
      mockSubscriptionRepository.findByUserId.mockResolvedValue(null);
      mockSubscriptionRepository.create.mockImplementation(async (data) =>
        makeSub({ trialEndsAt: data.trialEndsAt }),
      );

      await service.createDefault('user-uuid');

      const callArg = mockSubscriptionRepository.create.mock.calls[0][0];
      expect(callArg.tier).toBe(SubscriptionTier.FREE);
      expect(callArg.status).toBe(SubscriptionStatus.ACTIVE);
      expect(callArg.trialEndsAt).toBeInstanceOf(Date);
      const diffDays =
        (callArg.trialEndsAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24);
      expect(diffDays).toBeGreaterThan(29);
      expect(diffDays).toBeLessThan(31);
    });

    it('should throw ConflictException if subscription already exists', async () => {
      mockSubscriptionRepository.findByUserId.mockResolvedValue(makeSub({}));
      await expect(service.createDefault('user-uuid')).rejects.toThrow(ConflictException);
      expect(mockSubscriptionRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('isPlaybackAllowed', () => {
    it('should return false if no subscription found', async () => {
      mockSubscriptionRepository.findByUserId.mockResolvedValue(null);
      expect(await service.isPlaybackAllowed('user-uuid')).toBe(false);
    });

    it('should return false if subscription is not ACTIVE', async () => {
      mockSubscriptionRepository.findByUserId.mockResolvedValue(
        makeSub({ status: SubscriptionStatus.CANCELLED }),
      );
      expect(await service.isPlaybackAllowed('user-uuid')).toBe(false);
    });

    it('should return true if tier is STANDARD regardless of trialEndsAt', async () => {
      mockSubscriptionRepository.findByUserId.mockResolvedValue(
        makeSub({ tier: SubscriptionTier.STANDARD, trialEndsAt: null }),
      );
      expect(await service.isPlaybackAllowed('user-uuid')).toBe(true);
    });

    it('should return false if FREE and trialEndsAt is null', async () => {
      mockSubscriptionRepository.findByUserId.mockResolvedValue(
        makeSub({ trialEndsAt: null }),
      );
      expect(await service.isPlaybackAllowed('user-uuid')).toBe(false);
    });

    it('should return false if FREE and trial has expired', async () => {
      mockSubscriptionRepository.findByUserId.mockResolvedValue(
        makeSub({ trialEndsAt: pastDate }),
      );
      expect(await service.isPlaybackAllowed('user-uuid')).toBe(false);
    });

    it('should return true if FREE and trial is still active', async () => {
      mockSubscriptionRepository.findByUserId.mockResolvedValue(
        makeSub({ trialEndsAt: futureDate }),
      );
      expect(await service.isPlaybackAllowed('user-uuid')).toBe(true);
    });
  });

  describe('getMySubscription', () => {
    it('should return subscription if found', async () => {
      const sub = makeSub({});
      mockSubscriptionRepository.findByUserId.mockResolvedValue(sub);
      expect(await service.getMySubscription('user-uuid')).toEqual(sub);
    });

    it('should throw NotFoundException if not found', async () => {
      mockSubscriptionRepository.findByUserId.mockResolvedValue(null);
      await expect(service.getMySubscription('user-uuid')).rejects.toThrow(NotFoundException);
    });
  });
});