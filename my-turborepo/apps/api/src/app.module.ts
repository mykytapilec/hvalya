import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './infrastructure/prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { AppController } from './app.controller';
import { ArtistsModule } from './modules/artists/artists.module';
import { TracksModule } from './modules/tracks/tracks.module';
import { SubscriptionsModule } from './modules/subscriptions/subscriptions.module';
import { ArtistApplicationsModule } from './modules/artist-applications/artist-applications.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    ArtistsModule,
    TracksModule,
    SubscriptionsModule,
    ArtistApplicationsModule,
  ],
  controllers: [AppController],
})
export class AppModule {}