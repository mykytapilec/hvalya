import { IsString, IsEnum, IsDateString, IsOptional, IsUrl, MinLength } from 'class-validator';
import { ReleaseType } from '@hvalya/types';

export class UpdateReleaseDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  title?: string;

  @IsOptional()
  @IsEnum(ReleaseType)
  type?: ReleaseType;

  @IsOptional()
  @IsDateString()
  releasedAt?: string;

  @IsOptional()
  @IsUrl({ require_tld: false })
  coverUrl?: string;
}