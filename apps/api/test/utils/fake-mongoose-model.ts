/* eslint-disable @typescript-eslint/no-unsafe-call */
// Minimal fake Mongoose model wrappers used in unit/integration tests.
// Provides a thin adapter around a native collection to expose the subset of Mongoose API used in tests.
/* eslint-disable @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
import { Model } from 'mongoose';

type FakeCollection = {
    create?: (doc: any) => Promise<any>;
    insertOne?: (doc: any) => any;
    findOne?: (q: any) => any;
    find?: (q?: any) => any;
    updateOne?: (filter: any, update: any) => any;
    deleteOne?: (q: any) => any;
    deleteMany?: (q: any) => any;
};

export function createFakeModelFromCollection<TDoc = any>(collection: FakeCollection): Model<TDoc> {
    const impl: Partial<Model<TDoc>> = {
        create: async (docs: TDoc | TDoc[]) => {
            const docArray = Array.isArray(docs) ? docs : [docs];
            // prefer insertOne if the underlying fake collection exposes it (so unit tests that
            // mock insertOne see their store mutated)
            if (collection.insertOne) {
                const res = await collection.insertOne(docArray[0]);
                if (res && (res.insertedId || res._id)) return [{ _id: res.insertedId ?? res._id }] as any;
            }
            const res = await (collection.create ? collection.create(docArray[0]) : undefined);
            // normalize: if the collection returned an insertedId, return {_id: insertedId}
            if (res && (res.insertedId || res._id)) return { _id: res.insertedId ?? res._id } as any;
            // if collection didn't return a result, but doc already has _id, return it
            if ((docArray[0] as any)?._id) return { _id: (docArray[0] as any)._id } as any;
            // otherwise generate a pseudo-id string
            return { _id: 'fake-id-' + Math.random().toString(36).slice(2, 10) } as any;
        },
        findById: (id: any) =>
            ({
                lean: () => ({ exec: async () => (collection.findOne ? await collection.findOne({ _id: id }) : null) }),
                exec: async () => (collection.findOne ? await collection.findOne({ _id: id }) : null),
            }) as any,
        findOne: (q: any) =>
            ({
                lean: () => ({ exec: async () => (collection.findOne ? await collection.findOne(q) : null) }),
                exec: async () => (collection.findOne ? await collection.findOne(q) : null),
            }) as any,
        find: (q?: any) =>
            ({
                lean: () => ({
                    exec: async () => {
                        const res = collection.find ? await collection.find(q ?? {}) : [];
                        if (res && typeof res === 'object' && typeof res.toArray === 'function') {
                            return res.toArray();
                        }
                        return res;
                    },
                }),
                exec: async () => {
                    const res = collection.find ? await collection.find(q ?? {}) : [];
                    if (res && typeof res === 'object' && typeof res.toArray === 'function') {
                        return res.toArray();
                    }
                    return res;
                },
            }) as any,
        updateOne: (filter: any, update: any) =>
            ({
                exec: async () => (collection.updateOne ? await collection.updateOne(filter, update) : {}),
            }) as any,
        deleteOne: (q: any) =>
            ({ exec: async () => (collection.deleteOne ? await collection.deleteOne(q) : {}) }) as any,
        deleteMany: (q: any) =>
            ({ exec: async () => (collection.deleteMany ? await collection.deleteMany(q) : {}) }) as any,
    };

    return impl as unknown as Model<TDoc>;
}
