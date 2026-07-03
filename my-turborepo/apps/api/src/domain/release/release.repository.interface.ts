import { ReleaseType } from '@hvalya/types';
import { ReleaseEntity } from './release.entity';

export interface ICreateReleaseData {
  title: string;
  type: ReleaseType;
  coverUrl?: string;
  releasedAt: Date;
  artistIds: string[];
  tracks: Array<{
    title: string;
    duration: number;
    audioUrl: string;
    artistId: string;
  }>;
}

export interface IUpdateReleaseData {
  title?: string;
  type?: ReleaseType;
  coverUrl?: string;
  releasedAt?: Date;
}

export interface IReleaseRepository {
  findAll(): Promise<ReleaseEntity[]>;
  findById(id: string): Promise<ReleaseEntity | null>;
  findByArtistId(artistId: string): Promise<ReleaseEntity[]>;
  create(data: ICreateReleaseData): Promise<ReleaseEntity>;
  update(id: string, data: IUpdateReleaseData): Promise<ReleaseEntity>;
  delete(id: string): Promise<void>;
  updateCover(id: string, coverUrl: string): Promise<ReleaseEntity>;
}

export const RELEASE_REPOSITORY = Symbol('IReleaseRepository');