import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './infrastructure/prisma/prisma.module';
import { S3Module } from './infrastructure/s3/s3.module';
import { AuthModule } from './modules/auth/auth.module';
import { AppController } from './app.controller';
import { ArtistsModule } from './modules/artists/artists.module';
import { TracksModule } from './modules/tracks/tracks.module';
import { SubscriptionsModule } from './modules/subscriptions/subscriptions.module';
import { ArtistApplicationsModule } from './modules/artist-applications/artist-applications.module';
import { ReleasesModule } from './modules/releases/releases.module';
import { InternalModule } from './internal/internal.module';
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    S3Module,
    PrismaModule,
    AuthModule,
    ArtistsModule,
    TracksModule,
    SubscriptionsModule,
    ArtistApplicationsModule,
    ReleasesModule,
    InternalModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
