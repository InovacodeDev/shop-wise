#!/usr/bin/env node
const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

console.log("Starting Vercel build process...");
console.log("Node.js version:", process.version);
console.log("Working directory:", process.cwd());

// Find the project root (where package.json with shop-wise is located)
let projectRoot = process.cwd();
const rootPackageJsonPath = path.join(projectRoot, "package.json");

if (fs.existsSync(rootPackageJsonPath)) {
    const packageJson = JSON.parse(fs.readFileSync(rootPackageJsonPath, "utf8"));
    if (packageJson.name !== "shop-wise") {
        // Look for the shop-wise root
        projectRoot = path.resolve(projectRoot, "..");
        const parentPackageJsonPath = path.join(projectRoot, "package.json");
        if (fs.existsSync(parentPackageJsonPath)) {
            const parentPackageJson = JSON.parse(fs.readFileSync(parentPackageJsonPath, "utf8"));
            if (parentPackageJson.name === "shop-wise") {
                console.log("Found shop-wise root at:", projectRoot);
                process.chdir(projectRoot);
            }
        }
    }
}

console.log("Final working directory:", process.cwd());

try {
    // 1. Verify pnpm is available
    console.log("Checking pnpm version...");
    execSync("pnpm --version", { stdio: "inherit" });

    // 2. Install dependencies with frozen lockfile
    console.log("Installing dependencies with frozen lockfile...");
    execSync("pnpm install --frozen-lockfile", { stdio: "inherit" });

    // 3. Clean any existing builds
    console.log("Cleaning previous builds...");
    const distPath = path.join(__dirname, "apps", "web", "dist");
    if (fs.existsSync(distPath)) {
        fs.rmSync(distPath, { recursive: true, force: true });
        console.log("Cleaned existing dist folder");
    }

    // 4. Build the web app with turbo
    console.log("Building web app with Turbo...");
    execSync("pnpm turbo run build --filter=@shop-wise/web", {
        stdio: "inherit",
        env: {
            ...process.env,
            NODE_ENV: "production",
        },
    });

    // 5. Verify the dist folder exists and has content
    if (!fs.existsSync(distPath)) {
        throw new Error(`Build failed: dist folder not found at ${distPath}`);
    }

    const distFiles = fs.readdirSync(distPath);
    if (distFiles.length === 0) {
        throw new Error("Build failed: dist folder is empty");
    }

    // 6. Verify essential files exist
    const indexPath = path.join(distPath, "index.html");
    if (!fs.existsSync(indexPath)) {
        throw new Error("Build failed: index.html not found in dist folder");
    }

    // 7. List contents of dist folder for debugging
    console.log("Build successful! Contents of apps/web/dist:");
    execSync("ls -la apps/web/dist/", { stdio: "inherit" });

    console.log("✅ Vercel build completed successfully!");
    console.log(`📁 Output directory: ${distPath}`);
    console.log(`📄 Files generated: ${distFiles.length}`);
} catch (error) {
    console.error("❌ Build failed:", error.message);

    // Additional debugging information
    console.log("\n🔍 Debug information:");
    console.log("Current working directory:", process.cwd());

    try {
        console.log("Files in root:", fs.readdirSync("."));
        console.log("Files in apps/web:", fs.readdirSync("apps/web"));
    } catch (e) {
        console.log("Could not list files:", e.message);
    }

    process.exit(1);
}
