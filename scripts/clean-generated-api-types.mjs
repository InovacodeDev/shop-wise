#!/usr/bin/env node
import fs from "fs";
import path from "path";

const file = path.resolve(process.cwd(), "apps/web/src/types/api.ts");
if (!fs.existsSync(file)) {
    console.error("file not found:", file);
    process.exit(1);
}

const content = fs.readFileSync(file, "utf8");

const lines = content.split("\n");
const outLines = [];

const declRe = /^export\s+(interface|type|enum)\s+([A-Za-z0-9_]+)/;
const seen = new Set();

let i = 0;
while (i < lines.length) {
    const line = lines[i];
    const m = line.match(declRe);
    if (m) {
        const kind = m[1];
        const name = m[2];
        if (seen.has(name)) {
            // skip this block: find end by matching blank line or next export
            i++;
            let depth = 0;
            for (; i < lines.length; i++) {
                const l = lines[i];
                if (/^export\s+(interface|type|enum)\s+/.test(l)) break;
                // crude block end detection
                if (l.trim() === "" && depth === 0) {
                    break;
                }
            }
            continue;
        }
        seen.add(name);
        // keep block
        outLines.push(line);
        i++;
        for (; i < lines.length; i++) {
            const l = lines[i];
            if (/^export\s+(interface|type|enum)\s+/.test(l)) break;
            outLines.push(l);
            // end when blank line followed by another blank or export
        }
        continue;
    }
    outLines.push(line);
    i++;
}

fs.writeFileSync(file, outLines.join("\n"), "utf8");
console.log("Cleaned", file);
