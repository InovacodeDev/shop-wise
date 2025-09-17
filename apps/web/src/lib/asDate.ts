export function asDate(v?: string | Date | number | null): Date | undefined {
    if (v == null) return undefined;
    try {
        if (v instanceof Date) return v;
        if (typeof v === 'number') return new Date(v);
        if (typeof v === 'string') {
            const d = new Date(v);
            if (!isNaN(d.getTime())) return d;
        }
    } catch (e) {
        // ignore
    }
    return undefined;
}
