import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/infrastructure/prisma/prisma.service';

describe('Tracks (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let token: string;
  let artistId: string;
  let createdTrackId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();

    prisma = moduleFixture.get<PrismaService>(PrismaService);

    await request(app.getHttpServer()).post('/api/v1/auth/register').send({
      email: 'track-e2e@hvalya.com',
      username: 'tracke2e',
      password: 'password123',
    });

    const loginRes = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: 'track-e2e@hvalya.com', password: 'password123' });

    token = loginRes.body.accessToken;

    const artistRes = await request(app.getHttpServer())
      .post('/api/v1/artists')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Track E2E Artist' });

    artistId = artistRes.body.id;
  });

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { email: { contains: 'track-e2e' } } });
    await app.close();
  });

  describe('POST /api/v1/tracks', () => {
    it('should create a track', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/tracks')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'E2E Test Track',
          duration: 180,
          audioUrl: 'https://example.com/track.mp3',
        });

      expect(res.status).toBe(201);
      expect(res.body.title).toBe('E2E Test Track');
      expect(res.body.artistId).toBe(artistId);
      createdTrackId = res.body.id;
    });

    it('should return 401 without token', async () => {
      const res = await request(app.getHttpServer()).post('/api/v1/tracks').send({
        title: 'No Auth Track',
        duration: 100,
        audioUrl: 'https://example.com/track.mp3',
      });

      expect(res.status).toBe(401);
    });

    it('should return 400 on invalid payload', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/tracks')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: '' });

      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/v1/tracks', () => {
    it('should return array of tracks', async () => {
      const res = await request(app.getHttpServer()).get('/api/v1/tracks');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe('GET /api/v1/tracks/:id', () => {
    it('should return track by id', async () => {
      const res = await request(app.getHttpServer()).get(`/api/v1/tracks/${createdTrackId}`);
      expect(res.status).toBe(200);
      expect(res.body.id).toBe(createdTrackId);
    });

    it('should return 404 for non-existent track', async () => {
      const res = await request(app.getHttpServer()).get(
        '/api/v1/tracks/00000000-0000-0000-0000-000000000000',
      );
      expect(res.status).toBe(404);
    });
  });

  describe('PATCH /api/v1/tracks/:id', () => {
    it('should update track title', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/api/v1/tracks/${createdTrackId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Updated E2E Track' });

      expect(res.status).toBe(200);
      expect(res.body.title).toBe('Updated E2E Track');
    });
  });

  describe('DELETE /api/v1/tracks/:id', () => {
    it('should return 401 without token', async () => {
      const res = await request(app.getHttpServer()).delete(`/api/v1/tracks/${createdTrackId}`);
      expect(res.status).toBe(401);
    });

    it('should delete track', async () => {
      const res = await request(app.getHttpServer())
        .delete(`/api/v1/tracks/${createdTrackId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(204);
    });
  });
});