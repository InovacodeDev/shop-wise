import { BaseModel, ID } from './common';

export interface FamilyMember extends BaseModel {
    familyId: ID; // family._id
    userId: ID; // user._id
    displayName: string; // user.displayName
    role: 'owner' | 'admin' | 'member';
    type: 'adult' | 'child' | 'pet';
}
