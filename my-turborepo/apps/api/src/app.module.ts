import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { PrismaModule } from './infrastructure/prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { AppController } from './app.controller';
import { ArtistsModule } from './modules/artists/artists.module';
import { TracksModule } from './modules/tracks/tracks.module';
import { SubscriptionsModule } from './modules/subscriptions/subscriptions.module';
import { ArtistApplicationsModule } from './modules/artist-applications/artist-applications.module';
import { ReleasesModule } from './modules/releases/releases.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
    }),
    PrismaModule,
    AuthModule,
    ArtistsModule,
    TracksModule,
    SubscriptionsModule,
    ArtistApplicationsModule,
    ReleasesModule,
  ],
  controllers: [AppController],
})
export class AppModule {}