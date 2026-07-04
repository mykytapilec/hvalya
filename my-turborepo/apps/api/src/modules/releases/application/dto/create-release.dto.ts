import { IsString, IsEnum, IsDateString, IsArray, ValidateNested, IsInt, IsOptional, IsUrl, MinLength, Min, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';
import { ReleaseType } from '@hvalya/types';

export class CreateTrackInReleaseDto {
  @IsString()
  @MinLength(1)
  title!: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  duration?: number;

  @IsString()
  @MinLength(1)
  audioUrl!: string;
}

export class CreateReleaseDto {
  @IsString()
  @MinLength(1)
  title!: string;

  @IsEnum(ReleaseType)
  type!: ReleaseType;

  @IsDateString()
  releasedAt!: string;

  @IsOptional()
  @IsUrl()
  coverUrl?: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateTrackInReleaseDto)
  tracks!: CreateTrackInReleaseDto[];
}