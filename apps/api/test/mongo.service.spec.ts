import { Test } from '@nestjs/testing';

import { MONGO_DB } from '../src/mongo/mongo.constants';
import { MongoService } from '../src/mongo/mongo.service';

describe('MongoService', () => {
    let service: MongoService;

    beforeAll(async () => {
        const mockDb = {
            collection: jest.fn().mockReturnValue({ name: 'mock' }),
        } as unknown;

        const moduleRef = await Test.createTestingModule({
            providers: [MongoService, { provide: MONGO_DB, useValue: mockDb }],
        }).compile();

        service = moduleRef.get(MongoService);
    });

    it('should return a collection', () => {
        const col = service.collection('users');
        expect(col).toEqual({ name: 'mock' });
    });
});
