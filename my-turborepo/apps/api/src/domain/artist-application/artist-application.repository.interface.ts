import { ArtistApplicationEntity } from './artist-application.entity';
import { ArtistApplicationStatus } from '@hvalya/types';

export interface ICreateArtistApplicationData {
  userId: string;
  bio: string;
  socialLinks: string;
}

export interface IUpdateArtistApplicationData {
  status?: ArtistApplicationStatus;
  reviewedAt?: Date;
  rejectionReason?: string | null;
}

export interface IArtistApplicationRepository {
  findAll(): Promise<ArtistApplicationEntity[]>;
  findById(id: string): Promise<ArtistApplicationEntity | null>;
  findByUserId(userId: string): Promise<ArtistApplicationEntity | null>;
  findPending(): Promise<ArtistApplicationEntity[]>;
  create(data: ICreateArtistApplicationData): Promise<ArtistApplicationEntity>;
  update(id: string, data: IUpdateArtistApplicationData): Promise<ArtistApplicationEntity>;
}

export const ARTIST_APPLICATION_REPOSITORY = Symbol('IArtistApplicationRepository');