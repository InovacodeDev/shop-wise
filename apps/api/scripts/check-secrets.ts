import fs from 'fs';
import path from 'path';

const suspiciousPatterns = [
    /-----BEGIN PRIVATE KEY-----/i,
    /AWS_ACCESS_KEY_ID|AWS_SECRET_ACCESS_KEY|GITHUB_TOKEN|PRIVATE_KEY|SECRET_KEY/i,
    /AIza[0-9A-Za-z-_]{35}/i,
];

function scanFile(filePath: string): boolean {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        for (const p of suspiciousPatterns) {
            if (p.test(content)) return true;
        }
    } catch {
        // ignore binary or unreadable
    }
    return false;
}

function walk(dir: string) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const ent of entries) {
        const full = path.join(dir, ent.name);
        if (ent.isDirectory()) {
            if (['node_modules', '.git', 'dist'].includes(ent.name)) continue;
            walk(full);
        } else {
            if (['.png', '.jpg', '.jpeg', '.gif', '.bin'].some((ext) => full.endsWith(ext))) return;
            if (scanFile(full)) {
                console.warn('Possible secret found in', full);
                process.exit(2);
            }
        }
    }
}

// If file paths are passed, scan only those files (useful for lint-staged). Otherwise scan the whole repo.
const args = process.argv.slice(2);
if (args.length > 0) {
    for (const f of args) {
        const p = path.resolve(process.cwd(), f);
        if (fs.existsSync(p) && fs.statSync(p).isFile()) {
            if (scanFile(p)) {
                console.warn('Possible secret found in', p);
                process.exit(2);
            }
        }
    }
} else {
    walk(process.cwd());
}

export {};
