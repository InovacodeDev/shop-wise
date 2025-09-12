const fs = require('fs');
const path = require('path');

const suspiciousPatterns = [
    /-----BEGIN PRIVATE KEY-----/i,
    /AWS_ACCESS_KEY_ID|AWS_SECRET_ACCESS_KEY|GITHUB_TOKEN|PRIVATE_KEY|SECRET_KEY/i,
    /AIza[0-9A-Za-z-_]{35}/i,
];

function scanFile(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        for (const p of suspiciousPatterns) {
            if (p.test(content)) return true;
        }
    } catch (e) {
        // ignore binary or unreadable
    }
    return false;
}

function walk(dir) {
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
                // fail fast so CI job is aware
                process.exit(2);
            }
        }
    }
}

walk(process.cwd());

if (process.exitCode === 2) {
    console.error('Secrets scanner found potential secrets. Please remove them.');
}

module.exports = {};
