import { IsString, MinLength, MaxLength } from 'class-validator';

export class CreateArtistApplicationDto {
  @IsString()
  @MinLength(50)
  @MaxLength(2000)
  bio!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(1000)
  socialLinks!: string;
}