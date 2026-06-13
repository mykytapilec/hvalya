declare module '@hvalya/types' {
  export enum UserRole {
    LISTENER = 'LISTENER',
    ARTIST = 'ARTIST',
    ADMIN = 'ADMIN',
  }

  export enum SubscriptionTier {
    FREE = 'FREE',
    STANDARD = 'STANDARD',
  }

  export enum SubscriptionStatus {
    ACTIVE = 'ACTIVE',
    CANCELLED = 'CANCELLED',
    EXPIRED = 'EXPIRED',
    PAST_DUE = 'PAST_DUE',
  }

  export interface IUser {
    id: string;
    email: string;
    username: string;
    role: UserRole;
    createdAt: Date;
    updatedAt: Date;
  }

  export interface ITrack {
    id: string;
    title: string;
    duration: number;
    audioUrl: string;
    artistId: string;
    createdAt: Date;
    updatedAt: Date;
  }

  export interface IArtist {
    id: string;
    name: string;
    userId: string;
    createdAt: Date;
    updatedAt: Date;
  }

  export interface ISubscription {
    id: string;
    userId: string;
    tier: SubscriptionTier;
    status: SubscriptionStatus;
    startedAt: Date;
    expiresAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
  }
}