#!/usr/bin/env node

/**
 * Prepare template for publishing
 * Copies backend and frontend from monorepo apps/ into template/apps/
 * with filtering for unnecessary files
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CLI_ROOT = path.join(__dirname, '..');
const MONOREPO_ROOT = path.join(CLI_ROOT, '../..');
const TEMPLATE_PATH = path.join(CLI_ROOT, 'template');
const TEMPLATE_APPS_PATH = path.join(TEMPLATE_PATH, 'apps');

// Directories to exclude when copying
const EXCLUDE_DIRS = new Set([
    'node_modules',
    '.git',
    '__pycache__',
    '.pytest_cache',
    'alembic',
    'tests',
    '.venv',
    'dist',
    '.next',
    '.turbo',
    'coverage',
]);

// Files to exclude
const EXCLUDE_FILES = new Set([
    '.env',
    '.env.local',
    'alembic.ini',
    '.DS_Store',
]);

/**
 * Recursively copy directory with filtering
 */
function copyDirFiltered(src, dest) {
    if (!fs.existsSync(src)) {
        console.log(`  ⚠ Source not found: ${src}`);
        return;
    }

    // Create destination directory
    if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
    }

    const entries = fs.readdirSync(src, { withFileTypes: true });

    for (const entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);

        // Skip excluded items
        if (EXCLUDE_DIRS.has(entry.name) || EXCLUDE_FILES.has(entry.name)) {
            continue;
        }

        if (entry.isDirectory()) {
            copyDirFiltered(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
    }
}

/**
 * Main function
 */
function main() {
    console.log('📦 Preparing template for publishing...\n');

    // Clean existing template/apps
    if (fs.existsSync(TEMPLATE_APPS_PATH)) {
        console.log('  🗑  Cleaning existing template/apps...');
        fs.rmSync(TEMPLATE_APPS_PATH, { recursive: true, force: true });
    }

    // Create template/apps directory
    fs.mkdirSync(TEMPLATE_APPS_PATH, { recursive: true });

    // Copy backend
    const backendSrc = path.join(MONOREPO_ROOT, 'apps', 'backend');
    const backendDest = path.join(TEMPLATE_APPS_PATH, 'backend');
    console.log('  📁 Copying backend...');
    copyDirFiltered(backendSrc, backendDest);

    // Copy frontend
    const frontendSrc = path.join(MONOREPO_ROOT, 'apps', 'frontend');
    const frontendDest = path.join(TEMPLATE_APPS_PATH, 'frontend');
    console.log('  📁 Copying frontend...');
    copyDirFiltered(frontendSrc, frontendDest);

    // Verify nextjs-fullstack exists
    const nextjsTemplatePath = path.join(TEMPLATE_PATH, 'nextjs-fullstack');
    if (fs.existsSync(nextjsTemplatePath)) {
        console.log('  ✅ Verified nextjs-fullstack template exists');
    } else {
        console.log('  ⚠️  Warning: nextjs-fullstack template not found in template directory!');
    }

    console.log('\n✅ Template prepared successfully!\n');
    
    // Show what was created
    const files = countFiles(TEMPLATE_APPS_PATH);
    console.log(`  Total files in template/apps: ${files}`);
}

/**
 * Count files recursively
 */
function countFiles(dir) {
    let count = 0;
    if (!fs.existsSync(dir)) return 0;
    
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
        if (entry.isDirectory()) {
            count += countFiles(path.join(dir, entry.name));
        } else {
            count++;
        }
    }
    return count;
}

main();
