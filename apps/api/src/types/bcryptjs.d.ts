declare module 'bcryptjs' {
    export function hash(s: string, salt: number | string): Promise<string>;
    export function compare(s: string, hash: string): Promise<boolean>;
    export function hashSync(s: string, salt: number | string): string;
    export function compareSync(s: string, hash: string): boolean;
}
