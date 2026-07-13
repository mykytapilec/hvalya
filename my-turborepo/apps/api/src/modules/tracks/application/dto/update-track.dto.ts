import { IsString, IsInt, IsUrl, IsOptional, IsUUID, IsEnum, Min } from 'class-validator';
import { Genre } from '@hvalya/types';

export class UpdateTrackDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  duration?: number;

  @IsOptional()
  @IsUrl()
  audioUrl?: string;

  @IsOptional()
  @IsUUID()
  albumId?: string | null;

  @IsOptional()
  @IsEnum(Genre)
  genre?: Genre;
}