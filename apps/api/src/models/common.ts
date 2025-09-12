export type ID = string; // as uuid

export interface BaseModel<T = ID> {
    _id: T;
    createdAt: Date;
    updatedAt: Date;
}
