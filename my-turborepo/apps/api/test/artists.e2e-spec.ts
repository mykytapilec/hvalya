import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/infrastructure/prisma/prisma.service';

describe('Artists (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let token: string;
  let createdArtistId: string;

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
      email: 'artist-e2e@hvalya.com',
      username: 'artiste2e',
      password: 'password123',
    });

    const loginRes = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: 'artist-e2e@hvalya.com', password: 'password123' });

    token = loginRes.body.accessToken;
  });

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { email: { contains: 'artist-e2e' } } });
    await app.close();
  });

  describe('POST /api/v1/artists', () => {
    it('should create artist profile', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/artists')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'E2E Test Artist' });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body.name).toBe('E2E Test Artist');
      createdArtistId = res.body.id;
    });

    it('should return 401 without token', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/artists')
        .send({ name: 'No Auth Artist' });

      expect(res.status).toBe(401);
    });

    it('should return 409 if artist profile already exists', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/artists')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Duplicate Artist' });

      expect(res.status).toBe(409);
    });
  });

  describe('GET /api/v1/artists', () => {
    it('should return array of artists', async () => {
      const res = await request(app.getHttpServer()).get('/api/v1/artists');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe('GET /api/v1/artists/:id', () => {
    it('should return artist by id', async () => {
      const res = await request(app.getHttpServer()).get(`/api/v1/artists/${createdArtistId}`);
      expect(res.status).toBe(200);
      expect(res.body.id).toBe(createdArtistId);
    });

    it('should return 404 for non-existent artist', async () => {
      const res = await request(app.getHttpServer()).get(
        '/api/v1/artists/00000000-0000-0000-0000-000000000000',
      );
      expect(res.status).toBe(404);
    });
  });

  describe('PATCH /api/v1/artists/:id', () => {
    it('should update artist name', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/api/v1/artists/${createdArtistId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Updated E2E Artist' });

      expect(res.status).toBe(200);
      expect(res.body.name).toBe('Updated E2E Artist');
    });

    it('should return 401 without token', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/api/v1/artists/${createdArtistId}`)
        .send({ name: 'No Auth Update' });

      expect(res.status).toBe(401);
    });
  });

  describe('DELETE /api/v1/artists/:id', () => {
    it('should return 401 without token', async () => {
      const res = await request(app.getHttpServer()).delete(
        `/api/v1/artists/${createdArtistId}`,
      );
      expect(res.status).toBe(401);
    });

    it('should delete artist', async () => {
      const res = await request(app.getHttpServer())
        .delete(`/api/v1/artists/${createdArtistId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(204);
    });
  });
});