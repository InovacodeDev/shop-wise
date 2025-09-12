import { BaseModel } from './common';

export interface Category extends BaseModel {
    // i18n names object used by DTO
    names: Record<string, string>;
    colorLight: string;
    colorDark: string;
    iconName: string;
}
