import { Global, Module } from '@nestjs/common';
import { getConnectionToken } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

import { MONGO_DB } from './mongo.constants';
import { MongoService } from './mongo.service';

@Global()
@Module({
    providers: [
        {
            provide: MONGO_DB,
            useFactory: (connection: Connection) => connection,
            inject: [getConnectionToken()],
        },
        MongoService,
    ],
    exports: [MONGO_DB, MongoService],
})
export class MongoModule {}
