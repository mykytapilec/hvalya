import { IsString, MinLength, MaxLength } from 'class-validator';

export class RejectArtistApplicationDto {
  @IsString()
  @MinLength(1)
  @MaxLength(1000)
  rejectionReason!: string;
}