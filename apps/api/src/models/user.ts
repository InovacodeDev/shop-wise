import { BaseModel } from './common';

export interface User extends BaseModel<string> {
    email?: string;
    displayName?: string;
    photoURL?: string;
    // allow extra legacy fields
    [key: string]: any;
}
