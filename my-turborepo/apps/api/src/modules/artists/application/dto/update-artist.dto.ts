import { IsString, IsOptional, MinLength, MaxLength } from 'class-validator';

export class UpdateArtistDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  bio?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  socialLinks?: string;
}
