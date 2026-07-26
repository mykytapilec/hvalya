import { ArtistEntity } from './artist.entity';

export interface ICreateArtistData {
  name: string;
  bio?: string;
  socialLinks?: string;
  userId: string;
}

export interface IUpdateArtistData {
  name?: string;
  bio?: string;
  socialLinks?: string;
}

export interface IArtistRepository {
  findAll(): Promise<ArtistEntity[]>;
  findById(id: string): Promise<ArtistEntity | null>;
  findByUserId(userId: string): Promise<ArtistEntity | null>;
  create(data: ICreateArtistData): Promise<ArtistEntity>;
  update(id: string, data: IUpdateArtistData): Promise<ArtistEntity>;
  delete(id: string): Promise<void>;
}

export const ARTIST_REPOSITORY = Symbol('IArtistRepository');
