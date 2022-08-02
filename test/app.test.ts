/* eslint-disable import/first */
require('dotenv').config({ path: '.env.test' });

import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { authenticator } from 'otplib';
import request from 'supertest';

import { AppModule } from '../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let userId: string;
  let secret: string;
  let refreshToken: string;
  let accessToken: string;

  beforeEach(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  afterAll(() => {
    userId = '';
    secret = '';
    refreshToken = '';
    accessToken = '';
    app.close();
  });

  describe('/auth/register', () => {
    it('should return validation error', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          username: 'any_username',
        })
        .expect(400)
        .expect({
          statusCode: 400,
          message: [
            'email should not be empty',
            'email must be an email',
            'phone should not be empty',
            'phone must be a valid phone number',
          ],
          error: 'Bad Request',
        });
    });

    it('should register an user properly', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          username: 'any_username',
          phone: '+5551999999999',
          email: 'any@email.com',
        })
        .expect(201)
        .expect(({ body }) => {
          userId = body.userId;
          secret = body.secret;

          expect(body).toEqual({
            qrcode: expect.any(String),
            secret: expect.any(String),
            userId: expect.any(String),
          });
        });
    });
  });

  describe('/auth/activate/{userId}', () => {
    it('should return validation error', () => {
      return request(app.getHttpServer())
        .patch(`/auth/activate/${userId}`)
        .expect(400)
        .expect({
          statusCode: 400,
          message: [
            'otp must be shorter than or equal to 6 characters',
            'otp must be longer than or equal to 6 characters',
            'otp must be a number string',
          ],
          error: 'Bad Request',
        });
    });

    it('should return otp error', () => {
      return request(app.getHttpServer())
        .patch(`/auth/activate/${userId}`)
        .send({ otp: '000000' })
        .expect(400)
        .expect({
          statusCode: 400,
          message: 'Wrong authentication code',
          error: 'Bad Request',
        });
    });

    it('should activate user', () => {
      return request(app.getHttpServer())
        .patch(`/auth/activate/${userId}`)
        .send({ otp: authenticator.generate(secret) })
        .expect(202);
    });
  });

  describe('/auth/set-password/{userId}', () => {
    it('should return validation error', () => {
      return request(app.getHttpServer())
        .patch(`/auth/set-password/${userId}`)
        .expect(400)
        .expect({
          statusCode: 400,
          message: ['password should not be empty', 'password must be a string'],
          error: 'Bad Request',
        });
    });

    it('should set password properly', () => {
      return request(app.getHttpServer())
        .patch(`/auth/set-password/${userId}`)
        .send({ password: '123456' })
        .expect(200)
        .expect(({ body }) => {
          refreshToken = body.refreshToken;

          expect(body).toEqual({
            accessToken: expect.any(String),
            refreshToken: expect.any(String),
          });
        });
    });
  });

  describe('/auth/refresh', () => {
    it('should refresh token properly', () => {
      return request(app.getHttpServer())
        .post('/auth/refresh')
        .send({ refreshToken })
        .expect(201)
        .expect(({ body }) => {
          accessToken = body.accessToken;

          expect(body).toEqual({
            accessToken: expect.any(String),
            refreshToken: expect.any(String),
          });
        });
    });
  });

  describe('GET /user/me', () => {
    it('should get user info properly', () => {
      return request(app.getHttpServer())
        .get('/user/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect(({ body }) => {
          expect(body).toEqual({
            active: true,
            username: 'any_username',
            phone: '+5551999999999',
            email: 'any@email.com',
            id: userId,
          });
        });
    });
  });

  describe('PATCH /user/me', () => {
    it('should return error if oldPassword is invalid', () => {
      return request(app.getHttpServer())
        .patch('/user/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          password: 'new_password',
          otp: '000000',
        })
        .expect(400)
        .expect({
          statusCode: 400,
          message: 'Incorrect Password',
          error: 'Bad Request',
        });
    });

    it('should return error if OTP is invalid', () => {
      return request(app.getHttpServer())
        .patch('/user/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ password: 'new_password', oldPassword: '123456', otp: '000000' })
        .expect(400)
        .expect({
          statusCode: 400,
          message: 'Invalid OTP',
          error: 'Bad Request',
        });
    });

    it('should update data properly', () => {
      return request(app.getHttpServer())
        .patch('/user/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          password: '12345678',
          oldPassword: '123456',
          otp: authenticator.generate(secret),
        })
        .expect(202);
    });
  });

  describe('/auth/login', () => {
    it('should make login properly', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          password: '12345678',
          username: 'any_username',
          otp: authenticator.generate(secret),
        })
        .expect(201)
        .expect(({ body }) => {
          accessToken = body.accessToken;

          expect(body).toEqual({
            accessToken: expect.any(String),
            refreshToken: expect.any(String),
          });
        });
    });
  });

  describe('GET /wallet', () => {
    it('should return wallets properly', () => {
      return request(app.getHttpServer())
        .get('/wallet')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect(({ body }) => {
          expect(body).toHaveLength(2);
          expect(body[0]).toEqual({
            balance: expect.any(Number),
            type: expect.any(String),
          });
          expect(body[1]).toEqual({
            balance: expect.any(Number),
            type: expect.any(String),
          });
          expect(['fiat', 'crypto']).toContain(body[0].type);
          expect(['fiat', 'crypto']).toContain(body[1].type);
        });
    });
  });

  describe('POST /wallet/{type}/{to}', () => {
    let secondUserId: string;

    beforeAll(() => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          username: 'other_username',
          phone: '+5551999999999',
          email: 'any2@email.com',
        })
        .then(({ body }) => {
          secondUserId = body.userId;

          return request(app.getHttpServer())
            .patch(`/auth/activate/${body.userId}`)
            .send({ otp: authenticator.generate(body.secret) })
            .then(() => {
              return request(app.getHttpServer())
                .patch(`/auth/set-password/${body.userId}`)
                .send({ password: 'any_password' });
            });
        });
    });

    it('should return insuficient funds', () => {
      return request(app.getHttpServer())
        .post(`/wallet/fiat/${secondUserId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ amount: 7654321 })
        .expect(400)
        .expect({
          statusCode: 400,
          message: 'Insuficient funds',
          error: 'Bad Request',
        });
    });

    it('should make transfer properly', () => {
      return request(app.getHttpServer())
        .post(`/wallet/fiat/${secondUserId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ amount: 100 })
        .expect(201);
    });
  });
});
