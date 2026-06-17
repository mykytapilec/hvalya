import { IsString, IsInt, IsUrl, IsOptional, IsUUID, Min } from 'class-validator';

export class CreateTrackDto {
  @IsString()
  title!: string;

  @IsInt()
  @Min(1)
  duration!: number;

  @IsUrl()
  audioUrl!: string;

  @IsOptional()
  @IsUUID()
  albumId?: string;
}