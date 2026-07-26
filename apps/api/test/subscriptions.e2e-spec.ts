import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/infrastructure/prisma/prisma.service';

describe('Subscriptions (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let token: string;

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
      email: 'sub-e2e@hvalya.com',
      username: 'sube2e',
      password: 'password123',
    });

    const loginRes = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: 'sub-e2e@hvalya.com', password: 'password123' });

    token = loginRes.body.accessToken;
  });

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { email: { contains: 'sub-e2e' } } });
    await app.close();
  });

  describe('GET /api/v1/subscriptions/me', () => {
    it('should return FREE subscription created on registration', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/subscriptions/me')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.tier).toBe('FREE');
      expect(res.body.status).toBe('ACTIVE');
    });

    it('should return 401 without token', async () => {
      const res = await request(app.getHttpServer()).get('/api/v1/subscriptions/me');
      expect(res.status).toBe(401);
    });
  });

  describe('PATCH /api/v1/subscriptions/me', () => {
    it('should upgrade subscription to STANDARD', async () => {
      const res = await request(app.getHttpServer())
        .patch('/api/v1/subscriptions/me')
        .set('Authorization', `Bearer ${token}`)
        .send({ tier: 'STANDARD' });

      expect(res.status).toBe(200);
      expect(res.body.tier).toBe('STANDARD');
    });

    it('should return 401 without token', async () => {
      const res = await request(app.getHttpServer())
        .patch('/api/v1/subscriptions/me')
        .send({ tier: 'STANDARD' });

      expect(res.status).toBe(401);
    });

    it('should return 400 on invalid tier value', async () => {
      const res = await request(app.getHttpServer())
        .patch('/api/v1/subscriptions/me')
        .set('Authorization', `Bearer ${token}`)
        .send({ tier: 'INVALID_TIER' });

      expect(res.status).toBe(400);
    });
  });
});