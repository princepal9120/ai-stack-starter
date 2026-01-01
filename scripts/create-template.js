const fs = require('fs-extra');
const path = require('path');

const sourceDir = process.cwd();
const targetDir = path.join(sourceDir, 'cli/template');

const dirsToCopy = [
  'apps/backend',
  'apps/frontend',
  'packages/ai-core',
  'packages/vector-db',
  'docker-compose.yml',
  'turbo.json',
  '.gitignore',
  'README.md'
];

async function createTemplate() {
  console.log('Creating template from current project...');

  for (const item of dirsToCopy) {
    const src = path.join(sourceDir, item);
    const dest = path.join(targetDir, item);

    if (await fs.pathExists(src)) {
      await fs.copy(src, dest, {
        filter: (src, dest) => {
          // Exclude node_modules, .git, .next, __pycache__, .venv
          if (src.includes('node_modules') || 
              src.includes('.git') || 
              src.includes('.next') || 
              src.includes('__pycache__') || 
              src.includes('.venv') ||
              src.includes('.DS_Store')) {
            return false;
          }
          return true;
        }
      });
      console.log(`Copied ${item}`);
    }
  }

  // Create root package.json for the template
  const rootPackageJson = {
    "name": "ai-stack-monorepo",
    "private": true,
    "scripts": {
      "build": "turbo build",
      "dev": "turbo dev",
      "lint": "turbo lint",
      "format": "prettier --write \"**/*.{ts,tsx,md}\""
    },
    "devDependencies": {
      "turbo": "^2.3.3",
      "prettier": "^3.4.2"
    },
    "packageManager": "pnpm@9.15.0",
    "engines": {
      "node": ">=18"
    }
  };

  await fs.writeJson(path.join(targetDir, 'package.json'), rootPackageJson, { spaces: 2 });
  console.log('Created root package.json');
  
  // Create pnpm-workspace.yaml
  const pnpmWorkspace = `packages:
  - "apps/*"
  - "packages/*"
`;
  await fs.writeFile(path.join(targetDir, 'pnpm-workspace.yaml'), pnpmWorkspace);
  console.log('Created pnpm-workspace.yaml');

  console.log('Template creation complete!');
}

createTemplate();
