#!/usr/bin/env node
import fs from "fs";
import path from "path";

const webSrc = path.resolve(process.cwd(), "apps/web/src");
const apiTypes = path.resolve(webSrc, "types/api.ts");

function readFile(p) {
    return fs.existsSync(p) ? fs.readFileSync(p, "utf8") : "";
}

const apiContent = readFile(apiTypes);
const nameRe = /export\s+(?:interface|type|enum)\s+([A-Za-z0-9_]+)/g;
const apiNames = new Set();
let m;
while ((m = nameRe.exec(apiContent))) apiNames.add(m[1]);

function walk(dir) {
    const res = [];
    for (const f of fs.readdirSync(dir)) {
        const full = path.join(dir, f);
        if (fs.statSync(full).isDirectory()) res.push(...walk(full));
        else if (full.endsWith(".ts") || full.endsWith(".tsx") || full.endsWith(".d.ts")) res.push(full);
    }
    return res;
}

const files = walk(webSrc);
const duplicates = {};
for (const file of files) {
    const content = readFile(file);
    const localRe = /(?:export\s+)?(?:interface|type|enum)\s+([A-Za-z0-9_]+)/g;
    let mm;
    while ((mm = localRe.exec(content))) {
        const name = mm[1];
        if (apiNames.has(name)) {
            if (!duplicates[name]) duplicates[name] = [];
            duplicates[name].push(file);
        }
    }
}

console.log(JSON.stringify(duplicates, null, 2));
