#!/usr/bin/env node

import { Command } from 'commander';
import prompts from 'prompts';
import chalk from 'chalk';
import ora from 'ora';
import gradient from 'gradient-string';
import { execa } from 'execa';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const AI_STACK_GRADIENT = gradient('#3b82f6', '#8b5cf6', '#ec4899');

// Directories to exclude when copying
const EXCLUDE_DIRS = [
    'node_modules',
    '.git',
    '__pycache__',
    '.pytest_cache',
    '.venv',
    'dist',
    '.next',
    '.turbo',
];

// Files to exclude
const EXCLUDE_FILES = [
    '.env',
    '.env.local',
    '.DS_Store',
];

interface ProjectConfig {
    projectName: string;
    backendType: 'nextjs' | 'fastapi' | 'typescript';
    tsFramework?: 'hono' | 'fastify' | 'nestjs';
    llmProvider: 'openai' | 'anthropic' | 'novita';
    vectorDb: 'qdrant' | 'weaviate' | 'pgvector';
    authProvider: 'clerk' | 'nextauth' | 'jwt';
    orm?: 'drizzle' | 'prisma';
}

/**
 * Copy directory with filter to exclude node_modules, .git, etc.
 */
async function copyWithFilter(src: string, dest: string) {
    await fs.copy(src, dest, {
        filter: (srcPath: string) => {
            const basename = path.basename(srcPath);
            if (EXCLUDE_DIRS.includes(basename)) return false;
            if (EXCLUDE_FILES.includes(basename)) return false;
            return true;
        },
    });
}

const program = new Command();

program
    .name('create-ai-stack-starter')
    .description('Create a new AI Stack project with Next.js, FastAPI, or TypeScript backend')
    .version('1.1.0');

program
    .argument('[project-directory]', 'Project directory name')
    .option('--next', 'Create Next.js Fullstack project (skip prompts)')
    .option('--fastapi', 'Create FastAPI + Next.js project (skip prompts)')
    .option('--use-pnpm', 'Use pnpm as package manager')
    .option('--use-npm', 'Use npm as package manager')
    .option('--skip-install', 'Skip dependency installation')
    .option('--skip-git', 'Skip git initialization')
    .action(async (projectDirectory, options) => {
        console.log();
        console.log(AI_STACK_GRADIENT('╔════════════════════════════════════════════════════╗'));
        console.log(AI_STACK_GRADIENT('║                                                    ║'));
        console.log(AI_STACK_GRADIENT('║           🚀 CREATE AI STACK STARTER 🚀            ║'));
        console.log(AI_STACK_GRADIENT('║                                                    ║'));
        console.log(AI_STACK_GRADIENT('║      Production-ready AI Apps with zero lock-in    ║'));
        console.log(AI_STACK_GRADIENT('║                                                    ║'));
        console.log(AI_STACK_GRADIENT('╚════════════════════════════════════════════════════╝'));
        console.log();

        let config: ProjectConfig;
        let initGit = !options.skipGit;

        // Handle --next flag (skip all prompts)
        if (options.next) {
            const projName = projectDirectory || 'my-ai-app';
            config = {
                projectName: projName,
                backendType: 'nextjs',
                llmProvider: 'openai',
                vectorDb: 'qdrant',
                authProvider: 'clerk',
            };
            console.log(chalk.cyan(`Creating Next.js Fullstack project: ${projName}`));
        }
        // Handle --fastapi flag
        else if (options.fastapi) {
            const projName = projectDirectory || 'my-ai-app';
            config = {
                projectName: projName,
                backendType: 'fastapi',
                llmProvider: 'openai',
                vectorDb: 'qdrant',
                authProvider: 'clerk',
            };
            console.log(chalk.cyan(`Creating FastAPI + Next.js project: ${projName}`));
        }
        // Interactive mode
        else {
            try {
                const responses = await prompts([
                    {
                        type: projectDirectory ? null : 'text',
                        name: 'projectName',
                        message: 'What is your project named?',
                        initial: 'my-ai-app',
                        validate: (value: string) => {
                            if (!value) return 'Project name is required';
                            if (!/^[a-z0-9-]+$/.test(value)) return 'Project name must be lowercase alphanumeric with dashes';
                            return true;
                        },
                    },
                    {
                        type: 'select',
                        name: 'backendType',
                        message: 'Which architecture would you like to use?',
                        choices: [
                            { title: '🌐 Next.js Fullstack', value: 'nextjs', description: 'Unified App Router, Vercel AI SDK, Drizzle, Better Auth' },
                            { title: '🐍 FastAPI (Python)', value: 'fastapi', description: 'Async Python Backend + Next.js Frontend' },
                            { title: '📦 TypeScript Backend', value: 'typescript', description: 'Node.js Backend (Hono/NestJS) + Next.js Frontend' },
                        ],
                        initial: 0,
                    },
                    {
                        type: (prev: string) => prev === 'typescript' ? 'select' : null,
                        name: 'tsFramework',
                        message: 'Which TypeScript framework?',
                        choices: [
                            { title: 'Hono', value: 'hono', description: 'Edge-first, Cloudflare Workers' },
                            { title: 'Fastify', value: 'fastify', description: 'High performance, 50K req/s' },
                            { title: 'NestJS', value: 'nestjs', description: 'Enterprise, dependency injection' },
                        ],
                        initial: 0,
                    },
                    {
                        type: 'select',
                        name: 'llmProvider',
                        message: 'Which LLM provider?',
                        choices: [
                            { title: 'OpenAI', value: 'openai', description: 'GPT-4 Turbo' },
                            { title: 'Anthropic', value: 'anthropic', description: 'Claude 3.5 Sonnet' },
                            { title: 'Novita AI', value: 'novita', description: 'Cheaper, uncensored' },
                        ],
                        initial: 0,
                    },
                    {
                        type: 'confirm',
                        name: 'initGit',
                        message: 'Initialize a git repository?',
                        initial: true,
                    },
                ], {
                    onCancel: () => {
                        console.log(chalk.red('\n✖ Operation cancelled'));
                        process.exit(0);
                    },
                });

                config = {
                    projectName: projectDirectory || responses.projectName,
                    backendType: responses.backendType,
                    tsFramework: responses.tsFramework,
                    llmProvider: responses.llmProvider,
                    vectorDb: 'qdrant',
                    authProvider: 'clerk',
                };
                initGit = responses.initGit;

            } catch (error) {
                console.error(chalk.red('Error during setup:'), error);
                process.exit(1);
            }
        }

        // Scaffold the project
        await scaffoldProject(config, options, initGit);
    });

async function scaffoldProject(config: ProjectConfig, options: any, initGit: boolean) {
    const projectPath = path.resolve(process.cwd(), config.projectName);
    const spinner = ora('Creating project...').start();

    // Check if directory exists
    if (await fs.pathExists(projectPath)) {
        spinner.fail(`Directory ${config.projectName} already exists!`);
        process.exit(1);
    }

    try {
        await fs.ensureDir(projectPath);
        const templatePath = path.join(__dirname, '../template');

        if (config.backendType === 'nextjs') {
            // Copy Next.js Fullstack template
            const source = path.join(templatePath, 'nextjs-fullstack');
            if (await fs.pathExists(source)) {
                await copyWithFilter(source, projectPath);

                // Handle gitignore rename (npm publish renames .gitignore to gitignore)
                const gitignorePath = path.join(projectPath, 'gitignore');
                const dotGitignorePath = path.join(projectPath, '.gitignore');
                if (await fs.pathExists(gitignorePath) && !(await fs.pathExists(dotGitignorePath))) {
                    await fs.move(gitignorePath, dotGitignorePath);
                }
            } else {
                spinner.fail('Next.js Fullstack template not found');
                console.log(chalk.dim(`Expected at: ${source}`));
                process.exit(1);
            }
        } else if (config.backendType === 'fastapi') {
            // Copy FastAPI + Next.js template
            const dockerComposeSrc = path.join(templatePath, 'docker-compose.yml');
            const readmeSrc = path.join(templatePath, 'README.md');

            if (await fs.pathExists(dockerComposeSrc)) {
                await fs.copy(dockerComposeSrc, path.join(projectPath, 'docker-compose.yml'));
            }
            if (await fs.pathExists(readmeSrc)) {
                await fs.copy(readmeSrc, path.join(projectPath, 'README.md'));
            }

            await fs.ensureDir(path.join(projectPath, 'apps'));

            const backendSrc = path.join(templatePath, 'apps/backend');
            const frontendSrc = path.join(templatePath, 'apps/frontend');

            if (await fs.pathExists(backendSrc)) {
                await copyWithFilter(backendSrc, path.join(projectPath, 'apps/backend'));
            }
            if (await fs.pathExists(frontendSrc)) {
                await copyWithFilter(frontendSrc, path.join(projectPath, 'apps/frontend'));
            }
        } else {
            // TypeScript backend - TODO: implement when templates are ready
            spinner.warn('TypeScript backend templates coming soon!');
            spinner.info('Using Next.js Fullstack as fallback...');
            const source = path.join(templatePath, 'nextjs-fullstack');
            if (await fs.pathExists(source)) {
                await copyWithFilter(source, projectPath);
            }
        }

        spinner.succeed('Project structure created');

        // Install dependencies
        if (!options.skipInstall) {
            spinner.start('Installing dependencies...');
            const pkgManager = options.usePnpm ? 'pnpm' : options.useNpm ? 'npm' : 'npm';

            try {
                if (config.backendType === 'nextjs') {
                    await execa(pkgManager, ['install'], { cwd: projectPath, stdio: 'pipe' });
                } else {
                    // For FastAPI projects, install frontend deps
                    const frontendPath = path.join(projectPath, 'apps/frontend');
                    if (await fs.pathExists(frontendPath)) {
                        await execa(pkgManager, ['install'], { cwd: frontendPath, stdio: 'pipe' });
                    }
                }
                spinner.succeed('Dependencies installed');
            } catch (e) {
                spinner.warn('Could not install dependencies automatically');
                console.log(chalk.dim('  Run `npm install` manually after setup'));
            }
        }

        // Git initialization
        if (initGit) {
            spinner.start('Initializing git...');
            try {
                await execa('git', ['init'], { cwd: projectPath, stdio: 'pipe' });
                await execa('git', ['add', '.'], { cwd: projectPath, stdio: 'pipe' });
                await execa('git', ['commit', '-m', 'Initial commit from create-ai-stack-starter'], { cwd: projectPath, stdio: 'pipe' });
                spinner.succeed('Git repository initialized');
            } catch (e) {
                spinner.warn('Could not initialize git');
            }
        }

        // Success message
        console.log();
        console.log(AI_STACK_GRADIENT('╔════════════════════════════════════════════════════╗'));
        console.log(AI_STACK_GRADIENT('║                                                    ║'));
        console.log(AI_STACK_GRADIENT('║              ✨ SUCCESS! ✨                         ║'));
        console.log(AI_STACK_GRADIENT('║                                                    ║'));
        console.log(AI_STACK_GRADIENT('╚════════════════════════════════════════════════════╝'));
        console.log();

        console.log(chalk.bold('Your AI app is ready!'));
        console.log();
        console.log(chalk.cyan('Next steps:'));
        console.log();
        console.log(`  ${chalk.bold('cd')} ${config.projectName}`);

        if (config.backendType === 'nextjs') {
            console.log(`  ${chalk.bold('cp')} .env.example .env.local`);
            console.log(`  ${chalk.dim('# Add your API keys to .env.local')}`);
            console.log(`  ${chalk.bold('npm run dev')}`);
            console.log();
            console.log(chalk.dim('  Then open http://localhost:3000'));
        } else {
            console.log(`  ${chalk.bold('docker-compose up -d')}`);
            console.log(`  ${chalk.dim('# Start Postgres, Redis, Qdrant')}`);
            console.log(`  ${chalk.bold('cd apps/backend && uv run uvicorn app.main:app --reload')}`);
            console.log(`  ${chalk.bold('cd apps/frontend && npm run dev')}`);
        }

        console.log();
        console.log(chalk.dim('─────────────────────────────────────────────────────'));
        console.log();
        console.log(`📚 Docs: ${chalk.cyan('https://ai-stack.dev/docs')}`);
        console.log(`⭐ Star: ${chalk.cyan('https://github.com/princepal9120/ai-stack')}`);
        console.log();

    } catch (error) {
        spinner.fail('Failed to create project');
        console.error(chalk.red('Error:'), error);
        process.exit(1);
    }
}

program.parse();
