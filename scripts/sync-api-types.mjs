#!/usr/bin/env node
import fs from "fs";
import path from "path";
import ts from "typescript";

// sync-api-types.mjs
// Generates a single canonical TypeScript file for web from API exports (zod-aware).

const apiSrc = path.resolve(process.cwd(), "apps/api/src");
const webTypesFile = path.resolve(process.cwd(), "apps/web/src/types/api.ts");

function walk(dir) {
    const files = [];
    for (const f of fs.readdirSync(dir)) {
        const full = path.join(dir, f);
        const stat = fs.statSync(full);
        if (stat.isDirectory()) files.push(...walk(full));
        else if (/\.([mc]?ts|d\.ts)$/.test(full)) files.push(full);
    }
    return files;
}

function hasExportModifier(node) {
    return !!node.modifiers && node.modifiers.some((m) => m.kind === ts.SyntaxKind.ExportKeyword);
}

function createSourceFile(filePath) {
    const src = fs.readFileSync(filePath, "utf8");
    return ts.createSourceFile(filePath, src, ts.ScriptTarget.ESNext, true, ts.ScriptKind.TS);
}

function textOf(node, sf) {
    try {
        return node.getText(sf);
    } catch (e) {
        return String(node);
    }
}

// Best-effort: materialize common zod schema shapes into concrete TS types.
function genFromZodCall(callExpr, sf, schemas) {
    const modifiers = [];
    let node = callExpr;
    // collect chained modifiers like .optional(), .nullable()
    while (ts.isCallExpression(node) && ts.isPropertyAccessExpression(node.expression)) {
        modifiers.push(String(node.expression.name.escapedText));
        node = node.expression.expression;
    }
    if (!ts.isCallExpression(node)) return { typeText: "any", optional: modifiers.includes("optional") };

    const baseExpr = node.expression;
    let baseName = "";
    if (ts.isPropertyAccessExpression(baseExpr) && ts.isIdentifier(baseExpr.name))
        baseName = String(baseExpr.name.escapedText);
    else if (ts.isIdentifier(baseExpr)) baseName = String(baseExpr.escapedText);

    const arg0 = node.arguments && node.arguments[0];
    const wrap = (t) => {
        if (modifiers.includes("nullable")) t = `${t} | null`;
        return { typeText: t, optional: modifiers.includes("optional") };
    };

    try {
        switch (baseName) {
            case "string":
            case "email":
            case "password":
                return wrap("string");
            case "number":
                return wrap("number");
            case "boolean":
                return wrap("boolean");
            case "date":
                return wrap("string | Date"); // accept string or Date on web
            case "unknown":
                return wrap("unknown");
            case "literal":
                if (arg0) return wrap(textOf(arg0, sf));
                return wrap("any");
            case "enum":
                // z.enum(['a','b']) -> 'a' | 'b'
                if (arg0 && ts.isArrayLiteralExpression(arg0))
                    return wrap(arg0.elements.map((el) => textOf(el, sf)).join(" | "));
                // z.enum(SOME_ARRAY) -> reference SOME_ARRAY
                if (arg0 && ts.isIdentifier(arg0)) return wrap(textOf(arg0, sf));
                return wrap("any");
            case "array":
                if (arg0) {
                    if (ts.isCallExpression(arg0)) {
                        const inner = genFromZodCall(arg0, sf, schemas);
                        return wrap(`Array<${inner.typeText}>`);
                    }
                    return wrap("any[]");
                }
                return wrap("any[]");
            case "union":
                if (arg0 && ts.isArrayLiteralExpression(arg0))
                    return wrap(
                        arg0.elements
                            .map((el) =>
                                ts.isCallExpression(el) ? genFromZodCall(el, sf, schemas).typeText : textOf(el, sf)
                            )
                            .join(" | ")
                    );
                if (arg0 && ts.isIdentifier(arg0)) return wrap(textOf(arg0, sf));
                return wrap("any");
            case "nativeEnum":
                if (arg0 && ts.isIdentifier(arg0)) return wrap(textOf(arg0, sf));
                return wrap("any");
            case "object": {
                // z.object({ a: z.string(), b: OtherSchema })
                if (arg0 && ts.isObjectLiteralExpression(arg0)) {
                    const props = [];
                    for (const p of arg0.properties) {
                        if (ts.isPropertyAssignment(p)) {
                            const key = textOf(p.name, sf)
                                .replace(/^\[|\]$/g, "")
                                .replace(/^['\"]|['\"]$/g, "");
                            const val = p.initializer;
                            let resolved = { typeText: "any", optional: false };
                            if (ts.isCallExpression(val)) resolved = genFromZodCall(val, sf, schemas);
                            else if (ts.isIdentifier(val)) {
                                const id = String(val.escapedText);
                                const typeName = id.endsWith("Schema") ? id.replace(/Schema$/, "") : id;
                                resolved = { typeText: typeName, optional: false };
                            } else {
                                resolved = { typeText: textOf(val, sf), optional: false };
                            }
                            props.push({ key, typeText: resolved.typeText, optional: resolved.optional });
                        } else if (ts.isShorthandPropertyAssignment(p)) {
                            props.push({ key: p.name.getText(sf), typeText: "any", optional: false });
                        }
                    }
                    const body = props
                        .map((pr) => `${pr.key}${pr.optional ? "?" : ""}: ${pr.typeText};`)
                        .join("\n    ");
                    return wrap(`{\n    ${body}\n}`);
                }
                return wrap("Record<string, any>");
            }
            default:
                return wrap("any");
        }
    } catch (e) {
        return { typeText: "any", optional: modifiers.includes("optional") };
    }
}

function extractFromSource(filePath) {
    const sf = createSourceFile(filePath);
    const collected = [];
    const schemas = new Map();

    function visit(node) {
        // collect exported zod schema variables
        if (ts.isVariableStatement(node) && hasExportModifier(node)) {
            for (const decl of node.declarationList.declarations) {
                if (ts.isIdentifier(decl.name) && decl.initializer && ts.isCallExpression(decl.initializer)) {
                    let base = decl.initializer;
                    while (ts.isCallExpression(base) && ts.isPropertyAccessExpression(base.expression))
                        base = base.expression.expression;
                    if (
                        (ts.isIdentifier(base) && base.escapedText === "z") ||
                        (ts.isPropertyAccessExpression(base) &&
                            ts.isIdentifier(base.expression) &&
                            base.expression.escapedText === "z")
                    ) {
                        schemas.set(String(decl.name.escapedText), decl.initializer);
                    }
                }
            }
        }

        // exported interfaces / type aliases / enums
        if (
            (ts.isInterfaceDeclaration(node) || ts.isTypeAliasDeclaration(node) || ts.isEnumDeclaration(node)) &&
            hasExportModifier(node)
        ) {
            const name = node.name && node.name.escapedText ? String(node.name.escapedText) : undefined;
            if (!name) return;
            let text = node.getText(sf);

            if (ts.isTypeAliasDeclaration(node)) {
                const typeText = node.type.getText(sf);
                const m = /z\.infer\s*<\s*typeof\s+([A-Za-z0-9_]+)\s*>/.exec(typeText);
                if (m) {
                    const schemaName = m[1];
                    if (schemas.has(schemaName)) {
                        const gen = genFromZodCall(schemas.get(schemaName), sf, schemas);
                        if (gen.typeText.startsWith("{")) text = `export interface ${name} ${gen.typeText}`;
                        else text = `export type ${name} = ${gen.typeText};`;
                    } else {
                        text = `export type ${name} = any;`;
                    }
                }
            }

            // avoid server-only constructs
            const serverPatterns = ["Document<", "mongoose", "ObjectId"];
            if (!text || serverPatterns.some((p) => text.includes(p))) text = `export type ${name} = any;`;

            collected.push({ name, text });
            return;
        }

        ts.forEachChild(node, visit);
    }

    visit(sf);
    return { collected, relative: path.relative(process.cwd(), filePath), schemas };
}

function main() {
    if (!fs.existsSync(apiSrc)) {
        console.error("apps/api/src not found, aborting");
        process.exit(1);
    }

    const files = walk(apiSrc);
    const byName = new Map();
    const schemaCache = new Map();

    // first pass: collect schemas
    for (const file of files) {
        try {
            const sf = createSourceFile(file);
            ts.forEachChild(sf, function findSchemas(node) {
                if (ts.isVariableStatement(node) && hasExportModifier(node)) {
                    for (const decl of node.declarationList.declarations) {
                        if (ts.isIdentifier(decl.name) && decl.initializer && ts.isCallExpression(decl.initializer)) {
                            let base = decl.initializer;
                            while (ts.isCallExpression(base) && ts.isPropertyAccessExpression(base.expression))
                                base = base.expression.expression;
                            if (
                                (ts.isIdentifier(base) && base.escapedText === "z") ||
                                (ts.isPropertyAccessExpression(base) &&
                                    ts.isIdentifier(base.expression) &&
                                    base.expression.escapedText === "z")
                            ) {
                                schemaCache.set(String(decl.name.escapedText), decl.initializer);
                            }
                        }
                    }
                }
                ts.forEachChild(node, findSchemas);
            });
        } catch (e) {
            /* ignore parse failures */
        }
    }

    for (const file of files) {
        try {
            const { collected, relative } = extractFromSource(file);
            for (const item of collected) {
                if (byName.has(item.name)) continue; // first wins
                // try to fill any `= any` placeholders by looking up SchemaName
                if (item.text.includes("export type") && item.text.includes("= any;")) {
                    const m = /export type\s+([A-Za-z0-9_]+)\s*=\s*any;/.exec(item.text);
                    if (m) {
                        const tname = m[1];
                        const schemaName = `${tname}Schema`;
                        if (schemaCache.has(schemaName)) {
                            const gen = genFromZodCall(
                                schemaCache.get(schemaName),
                                createSourceFile(file),
                                schemaCache
                            );
                            if (gen.typeText.startsWith("{")) item.text = `export interface ${tname} ${gen.typeText}`;
                            else item.text = `export type ${tname} = ${gen.typeText};`;
                        }
                    }
                }
                byName.set(item.name, { text: item.text, from: relative });
            }
        } catch (e) {
            console.warn("failed to process", file, e && e.message);
        }
    }

    const header = `/**\n * This file is generated by scripts/sync-api-types.mjs\n * Do not edit directly. Run \`pnpm run sync:api-types\` to regenerate.\n */\n\n`;
    const blocks = [];
    for (const [name, data] of byName.entries()) blocks.push(`// from ${data.from}\n${data.text}`);
    // If web types file already exists, preserve any exported declarations that do NOT
    // come from the API (web-only types). This avoids clobbering local helper types.
    const preserved = [];
    if (fs.existsSync(webTypesFile)) {
        try {
            const existingSf = ts.createSourceFile(
                webTypesFile,
                fs.readFileSync(webTypesFile, "utf8"),
                ts.ScriptTarget.ESNext,
                true,
                ts.ScriptKind.TS
            );
            function visitExisting(node) {
                if (
                    (ts.isInterfaceDeclaration(node) ||
                        ts.isTypeAliasDeclaration(node) ||
                        ts.isEnumDeclaration(node)) &&
                    hasExportModifier(node)
                ) {
                    const name = node.name && node.name.escapedText ? String(node.name.escapedText) : undefined;
                    if (name && !byName.has(name)) {
                        preserved.push({ name, text: node.getText(existingSf) });
                    }
                }
                ts.forEachChild(node, visitExisting);
            }
            ts.forEachChild(existingSf, visitExisting);
        } catch (e) {
            // ignore parse errors and continue
        }
    }

    for (const p of preserved) blocks.push(`// preserved from web types\n// original-file: ${webTypesFile}\n${p.text}`);

    let out = header + blocks.join("\n\n");

    // Best-effort: make Date properties accept string on the web to reduce
    // breakage where tests or code pass ISO strings. This converts occurrences
    // like `: Date;` into `: string | Date;` inside interface property lists.
    out = out.replace(/:\s*Date\s*([;,\n])/g, ": string | Date$1");

    fs.mkdirSync(path.dirname(webTypesFile), { recursive: true });
    fs.writeFileSync(webTypesFile, out, "utf8");
    console.log("Wrote", webTypesFile);

    // Generate a compatibility alias file for web imports that still reference
    // old/local names not present in the generated api.ts. This creates
    // `apps/web/src/types/api-compat.ts` with safe `export type` aliases that
    // point to the canonical types in `./api` when a heuristic match is found.
    try {
        const webFiles = walk(path.resolve(process.cwd(), "apps/web/src"));
        const importedNames = new Set();
        for (const f of webFiles) {
            const txt = fs.readFileSync(f, "utf8");
            const re = /from\s+['"]@\/types\/api['"]/g;
            if (!re.test(txt)) continue;
            // find import braces
            const importRe = /import\s+type?\s*\{([^}]+)\}\s*from\s+['"]@\/types\/api['"]/g;
            let m;
            while ((m = importRe.exec(txt))) {
                const names = m[1]
                    .split(",")
                    .map((s) =>
                        // remove inline comments, collapse whitespace, and strip `as` renames
                        s
                            .replace(/\/\/.*/g, "")
                            .replace(/\/\*.*?\*\//g, "")
                            .replace(/\s+/g, " ")
                            .trim()
                            .split(/\s+as\s+/)[0]
                            .trim()
                    )
                    .filter(Boolean);
                for (const n of names) {
                    const clean = n.replace(/\r?\n/g, " ").trim();
                    if (clean) importedNames.add(clean);
                }
            }
        }

        const apiExports = Array.from(byName.keys());
        const apiSet = new Set(apiExports);
        const aliases = [];

        function tryMap(name) {
            const candidates = [
                name.replace(/Request$/, "Input"),
                name.replace(/Response$/, "Output"),
                name.replace(/Request$/, ""),
                name.replace(/Response$/, ""),
            ];
            for (const c of candidates) if (apiSet.has(c)) return c;
            return null;
        }

        for (const n of importedNames) {
            if (apiSet.has(n)) continue;
            const mapped = tryMap(n);
            if (mapped) aliases.push({ from: mapped, to: n, fallback: false });
            else aliases.push({ from: null, to: n, fallback: true });
        }

        if (aliases.length > 0) {
            const compatFile = path.resolve(process.cwd(), "apps/web/src/types/api-compat.ts");
            const lines = [
                "/**",
                " * Compatibility aliases for legacy web imports. Generated by scripts/sync-api-types.mjs",
                " * The file provides aliases so web code can keep importing old names while we migrate",
                " * them to the canonical `./api` exports. TODO: remove this file after updating imports.",
                " */",
                "",
            ];

            for (const a of aliases) {
                // sanitize the original requested name to remove newlines and weird whitespace
                const rawTo = String(a.to).replace(/\s+/g, " ").trim();
                const to = rawTo.replace(/[^A-Za-z0-9_]/g, "_");
                if (!a.fallback) {
                    const from = String(a.from).replace(/[^A-Za-z0-9_]/g, "_");
                    lines.push(`export type ${to} = import('./api').${from};`);
                } else {
                    lines.push(`// TODO: ${to} not found in generated api.ts - please map or remove`);
                    lines.push(`export type ${to} = any;`);
                }
            }

            const content = lines.join("\n") + "\n";

            // Also, append non-fallback alias exports into the generated api.ts
            // so that imports from '@/types/api' that expect legacy names resolve
            // immediately. This helps reduce the first wave of missing-export
            // errors during migration.
            const nonFallback = aliases.filter((a) => !a.fallback);
            if (nonFallback.length > 0) {
                try {
                    // read existing file and remove any previous generated alias block
                    let existing = fs.readFileSync(webTypesFile, "utf8");
                    const aliasMarker = "// Compatibility aliases (generated) - safe forwarding to canonical types";
                    const idx = existing.indexOf(aliasMarker);
                    if (idx !== -1) {
                        // strip from marker to end of file
                        existing = existing.slice(0, idx).trimEnd() + "\n\n";
                        fs.writeFileSync(webTypesFile, existing, "utf8");
                    }

                    const aliasLines = ["\n// Compatibility aliases (generated) - safe forwarding to canonical types"];
                    for (const a of nonFallback) {
                        const to = String(a.to).replace(/[^A-Za-z0-9_]/g, "_");
                        const from = String(a.from).replace(/[^A-Za-z0-9_]/g, "_");
                        // only append if the alias name isn't already present in file
                        const fileNow = fs.readFileSync(webTypesFile, "utf8");
                        if (!new RegExp(`export\\s+type\\s+${to}\\b`).test(fileNow)) {
                            // Use import-based forwarding so the alias resolves regardless of symbol placement.
                            aliasLines.push(`export type ${to} = import('./api').${from};`);
                        }
                    }
                    // if we have real alias lines to add (more than the header)
                    if (aliasLines.length > 1) fs.appendFileSync(webTypesFile, aliasLines.join("\n") + "\n", "utf8");
                    console.log("Appended", Math.max(0, aliasLines.length - 1), "alias(es) to", webTypesFile);
                } catch (err) {
                    console.warn("Failed to append aliases to api.ts:", err && err.message);
                }

                // Ensure the generated api.ts re-exports the compat file so imports from
                // '@/types/api' can still resolve fallback types. This is idempotent.
                try {
                    const fileNow = fs.readFileSync(webTypesFile, "utf8");
                    if (!/export\s*\*\s*from\s*'\.\/api-compat'/.test(fileNow)) {
                        fs.appendFileSync(webTypesFile, "\nexport * from './api-compat';\n", "utf8");
                        console.log("Re-exported api-compat from", webTypesFile);
                    }
                } catch (err) {
                    console.warn("Failed to append re-export to api.ts:", err && err.message);
                }
            }

            // Validate produced content parses as TypeScript; ts.createSourceFile won't throw on syntax,
            // but we'll do a light sanity check: ensure it contains only valid identifier chars for exports.
            try {
                ts.createSourceFile(compatFile, content, ts.ScriptTarget.ESNext, true, ts.ScriptKind.TS);
                fs.writeFileSync(compatFile, content, "utf8");
                console.log("Wrote", compatFile);
            } catch (err) {
                console.warn("Generated compat content validation failed; writing safe fallback.", err && err.message);
                const safe =
                    [
                        "/**",
                        " * Compatibility aliases generation failed to validate; please run the generator and fix mappings.",
                        " */",
                        "",
                    ].join("\n") + "\n";
                fs.writeFileSync(compatFile, safe, "utf8");
                console.log("Wrote safe fallback", compatFile);
            }
        }
    } catch (e) {
        // non-fatal
        console.warn("compat generation failed", e && e.message);
    }
}

main();
