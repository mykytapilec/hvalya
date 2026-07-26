import { ReleaseType } from './enums';

export interface IAlbum {
  id: string;
  title: string;
  type: ReleaseType;
  coverUrl: string | null;
  releasedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}