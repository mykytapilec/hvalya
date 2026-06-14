export interface IAlbum {
  id: string;
  title: string;
  coverUrl: string | null;
  releasedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}