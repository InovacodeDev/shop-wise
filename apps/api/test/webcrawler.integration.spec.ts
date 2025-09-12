import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Application } from 'express';
import supertest from 'supertest';

import { AppModule } from '../src/app.module';

describe('WebcrawlerController (e2e)', () => {
    let app: INestApplication;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();

        // Note: In a real test, you would authenticate and get a valid JWT token
        // For this example, we're just checking that the endpoints exist and are protected
    });

    afterAll(async () => {
        await app.close();
    });

    describe('/webcrawler/nfce (POST)', () => {
        it('should return 401 without authentication', async () => {
            const response = await supertest(app.getHttpServer() as Application)
                .post('/webcrawler/nfce')
                .send({
                    url: 'https://example.com',
                })
                .expect(401);

            expect(response.body).toHaveProperty('message');
        });

        it('should validate URL format', async () => {
            // This test would require a valid JWT token
            // await request(app.getHttpServer())
            //     .post('/webcrawler/nfce')
            //     .set('Authorization', `Bearer ${jwtToken}`)
            //     .send({
            //         url: 'invalid-url',
            //     })
            //     .expect(400);
        });
    });

    describe('/webcrawler/nfce/enhanced (POST)', () => {
        it('should return 401 without authentication', async () => {
            const response = await supertest(app.getHttpServer() as Application)
                .post('/webcrawler/nfce/enhanced')
                .send({
                    url: 'https://example.com',
                })
                .expect(401);

            expect(response.body).toHaveProperty('message');
        });
    });

    describe('AI Integration', () => {
        it('should have the extract-from-nfce-web endpoint', async () => {
            const response = await supertest(app.getHttpServer() as Application)
                .post('/ai/extract-from-nfce-web')
                .send({
                    rawNfceData: {
                        products: [],
                        storeName: 'Test Store',
                        date: '2025-01-01',
                        cnpj: '00.000.000/0000-00',
                        address: 'Test Address',
                        accessKey: '12345',
                        type: 'supermarket',
                        nfceNumber: '123',
                        series: '1',
                        emissionDateTime: '01/01/2025 10:00:00',
                        authorizationProtocol: 'ABC123',
                        totalAmount: 10.0,
                    },
                })
                .expect(401); // Should be protected

            expect(response.body).toHaveProperty('message');
        });
    });
});
