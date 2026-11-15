// Copies src/ to www/ and bundles app.js (with Capacitor plugins) into one file.
import { build } from "esbuild";
import { cpSync, rmSync, mkdirSync } from "node:fs";
rmSync("www", { recursive: true, force: true });
mkdirSync("www");
cpSync("src/index.html", "www/index.html");
cpSync("src/fonts.css", "www/fonts.css");
cpSync("src/fonts", "www/fonts", { recursive: true });
await build({ entryPoints: ["src/app.js"], bundle: true, minify: true, format: "iife", target: ["es2020", "safari15"], outfile: "www/app.bundle.js" });
console.log("Built www/");
