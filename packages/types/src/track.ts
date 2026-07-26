export interface ITrack {
  id: string;
  title: string;
  duration: number; // seconds
  audioUrl: string;
  artistId: string;
  createdAt: Date;
  updatedAt: Date;
}