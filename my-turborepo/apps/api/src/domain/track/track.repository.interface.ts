import { TrackEntity } from './track.entity';

export interface ICreateTrackData {
  title: string;
  duration: number;
  audioUrl: string;
  artistId: string;
  albumId?: string;
}

export interface IUpdateTrackData {
  title?: string;
  duration?: number;
  audioUrl?: string;
  albumId?: string | null;
}

export interface ITrackRepository {
  findAll(): Promise<TrackEntity[]>;
  findById(id: string): Promise<TrackEntity | null>;
  findByArtistId(artistId: string): Promise<TrackEntity[]>;
  findByIds(ids: string[]): Promise<TrackEntity[]>;
  create(data: ICreateTrackData): Promise<TrackEntity>;
  update(id: string, data: IUpdateTrackData): Promise<TrackEntity>;
  delete(id: string): Promise<void>;
}

export const TRACK_REPOSITORY = Symbol('ITrackRepository');