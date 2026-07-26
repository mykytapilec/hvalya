import { IsString, MinLength, IsOptional } from 'class-validator';

export class CreateArtistApplicationDto {
  @IsString()
  @MinLength(1)
  name!: string;

  @IsString()
  @MinLength(1)
  bio!: string;

  @IsOptional()
  @IsString()
  socialLinks?: string;
}