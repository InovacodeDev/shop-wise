#!/usr/bin/env node
const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

console.log("Starting Vercel build process...");

try {
    // 1. Install dependencies
    console.log("Installing dependencies...");
    execSync("pnpm install --frozen-lockfile", { stdio: "inherit" });

    // 2. Build the web app
    console.log("Building web app...");
    execSync("pnpm turbo run build --filter=@shop-wise/web", { stdio: "inherit" });

    // 3. Verify the dist folder exists
    const distPath = path.join(__dirname, "apps", "web", "dist");
    if (!fs.existsSync(distPath)) {
        throw new Error(`Build failed: dist folder not found at ${distPath}`);
    }

    // 4. List contents of dist folder for debugging
    console.log("Contents of apps/web/dist:");
    execSync("ls -la apps/web/dist/", { stdio: "inherit" });

    console.log("Build completed successfully!");
    console.log(`Output directory: ${distPath}`);
} catch (error) {
    console.error("Build failed:", error.message);
    process.exit(1);
}
