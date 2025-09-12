import { Inject, Injectable, InternalServerErrorException } from '@nestjs/common';
import { Connection } from 'mongoose';

import { MONGO_DB } from './mongo.constants';

@Injectable()
export class MongoService {
    constructor(@Inject(MONGO_DB) private readonly connection: Connection) {}

    getConnection(): Connection {
        if (!this.connection) {
            throw new InternalServerErrorException('Mongoose connection not initialized');
        }
        return this.connection;
    }

    /**
     * Get a Mongoose model by name
     */
    model<T = any>(name: string) {
        if (!this.connection) {
            throw new InternalServerErrorException('Mongoose connection not initialized');
        }
        return this.connection.model<T>(name);
    }

    /**
     * Get a native MongoDB collection by name (from Mongoose connection)
     */
    collection(name: string) {
        if (!this.connection) {
            throw new InternalServerErrorException('Mongoose connection not initialized');
        }
        return this.connection.collection(name);
    }
}
