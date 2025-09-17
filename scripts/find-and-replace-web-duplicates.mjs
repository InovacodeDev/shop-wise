#!/usr/bin/env node
import fs from "fs";
import path from "path";
import ts from "typescript";

const repoRoot = process.cwd();
const webSrc = path.resolve(repoRoot, "apps/web/src");
const webApiTypes = path.resolve(repoRoot, "apps/web/src/types/api.ts");

function createSourceFile(filePath) {
    const src = fs.readFileSync(filePath, "utf8");
    return ts.createSourceFile(filePath, src, ts.ScriptTarget.ESNext, true, ts.ScriptKind.TS);
}

function walk(dir) {
    const out = [];
    for (const name of fs.readdirSync(dir)) {
        const full = path.join(dir, name);
        const st = fs.statSync(full);
        if (st.isDirectory()) out.push(...walk(full));
        else if (/\.(ts|tsx)$/.test(full) && !full.includes("/types/")) out.push(full);
    }
    return out;
}

function exportedNamesFromApi() {
    if (!fs.existsSync(webApiTypes)) return new Set();
    const sf = createSourceFile(webApiTypes);
    const names = new Set();
    ts.forEachChild(sf, (node) => {
        if (ts.isInterfaceDeclaration(node) || ts.isTypeAliasDeclaration(node) || ts.isEnumDeclaration(node)) {
            if (node.name && node.name.escapedText) names.add(String(node.name.escapedText));
        }
    });
    return names;
}

function findLocalExports(file) {
    const sf = createSourceFile(file);
    const src = fs.readFileSync(file, "utf8");
    const matches = [];
    ts.forEachChild(sf, (node) => {
        if (
            (ts.isInterfaceDeclaration(node) || ts.isTypeAliasDeclaration(node) || ts.isEnumDeclaration(node)) &&
            node.modifiers &&
            node.modifiers.some((m) => m.kind === ts.SyntaxKind.ExportKeyword)
        ) {
            const name = node.name && node.name.escapedText ? String(node.name.escapedText) : undefined;
            if (!name) return;
            matches.push({
                name,
                pos: node.getFullStart(),
                end: node.getEnd(),
                text: src.slice(node.getFullStart(), node.getEnd()),
            });
        }
    });
    return matches;
}

function ensureImport(filePath, name) {
    const src = fs.readFileSync(filePath, "utf8");
    // If already imports name from '@/types/api', skip
    const importRegex = new RegExp(`from\s+['"]@/types/api['"][\s\S]*\\{[^}]*\\b${name}\\b[^}]*\}`);
    if (importRegex.test(src)) return src;
    // find first import block end
    const lines = src.split("\n");
    let insertAt = 0;
    for (let i = 0; i < lines.length; i++) {
        if (!lines[i].startsWith("import ")) {
            insertAt = i;
            break;
        }
    }
    const imp = `import type { ${name} } from '@/types/api';`;
    lines.splice(insertAt, 0, imp);
    return lines.join("\n");
}

function reportAndMaybeApply({ apply = false } = {}) {
    const apiNames = exportedNamesFromApi();
    const files = walk(webSrc);
    const candidates = [];
    for (const f of files) {
        const local = findLocalExports(f);
        const dupe = local.filter((l) => apiNames.has(l.name));
        if (dupe.length) candidates.push({ file: f, duplicates: dupe });
    }

    console.log(`Found ${candidates.length} file(s) with duplicate exported type/interface/enum declarations.`);
    for (const c of candidates) {
        console.log(`\nFile: ${path.relative(repoRoot, c.file)}`);
        for (const d of c.duplicates) console.log(`  - ${d.name}`);
    }

    if (!apply) {
        console.log('\nRun with `--apply` to replace local declarations with imports from "@/types/api".');
        return;
    }

    // Apply changes
    for (const c of candidates) {
        const src = fs.readFileSync(c.file, "utf8");
        let newSrc = src;
        // remove duplicates (from end to start to preserve offsets)
        const sorted = c.duplicates.slice().sort((a, b) => b.pos - a.pos);
        for (const d of sorted) {
            newSrc = newSrc.slice(0, d.pos) + newSrc.slice(d.end);
        }
        // ensure import lines
        for (const d of c.duplicates) newSrc = ensureImport(c.file, d.name);
        fs.writeFileSync(c.file, newSrc, "utf8");
        console.log(`Patched ${path.relative(repoRoot, c.file)} (removed ${c.duplicates.length} declaration(s))`);
    }
}

const apply = process.argv.includes("--apply");
reportAndMaybeApply({ apply });
