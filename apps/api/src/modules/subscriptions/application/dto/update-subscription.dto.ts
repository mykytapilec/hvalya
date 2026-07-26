import { IsEnum, IsOptional, IsDateString } from 'class-validator';
import { SubscriptionTier, SubscriptionStatus } from '@hvalya/types';

export class UpdateSubscriptionDto {
  @IsOptional()
  @IsEnum(SubscriptionTier)
  tier?: SubscriptionTier;

  @IsOptional()
  @IsEnum(SubscriptionStatus)
  status?: SubscriptionStatus;

  @IsOptional()
  @IsDateString()
  expiresAt?: string;
}