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

interface ProjectConfig {
    projectName: string;
    llmProvider: 'openai' | 'anthropic' | 'gemini' | 'ollama';
    vectorDb: 'qdrant' | 'weaviate' | 'pgvector';
    authProvider: 'clerk' | 'jwt';
    includeObservability: boolean;
    includeCelery: boolean;
}

const program = new Command();

program
    .name('create-ai-stack')
    .description('Create a new AI Stack FastAPI project')
    .version('1.0.0');

program
    .argument('[project-directory]', 'Project directory name')
    .option('--use-pnpm', 'Use pnpm as package manager')
    .option('--use-npm', 'Use npm as package manager')
    .option('--skip-install', 'Skip dependency installation')
    .action(async (projectDirectory, options) => {
        console.log();
        console.log(AI_STACK_GRADIENT('╔═══════════════════════════════════════════════╗'));
        console.log(AI_STACK_GRADIENT('║                                               ║'));
        console.log(AI_STACK_GRADIENT('║        🚀 AI STACK FASTAPI GENERATOR 🚀       ║'));
        console.log(AI_STACK_GRADIENT('║                                               ║'));
        console.log(AI_STACK_GRADIENT('║     Production-ready RAG with zero lock-in    ║'));
        console.log(AI_STACK_GRADIENT('║                                               ║'));
        console.log(AI_STACK_GRADIENT('╚═══════════════════════════════════════════════╝'));
        console.log();

        let config: ProjectConfig;

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
                    name: 'llmProvider',
                    message: 'Which LLM provider would you like to use?',
                    choices: [
                        { title: 'OpenAI (GPT-4, GPT-3.5)', value: 'openai', description: 'Best for general use, most popular' },
                        { title: 'Anthropic (Claude 3)', value: 'anthropic', description: '200k context, great for long documents' },
                        { title: 'Google Gemini', value: 'gemini', description: '2M context, multimodal capabilities' },
                        { title: 'Ollama (Local)', value: 'ollama', description: 'Privacy-first, zero cost' },
                    ],
                    initial: 0,
                },
                {
                    type: 'select',
                    name: 'vectorDb',
                    message: 'Which vector database would you like?',
                    choices: [
                        { title: 'Qdrant', value: 'qdrant', description: 'Production-ready, recommended' },
                        { title: 'Weaviate', value: 'weaviate', description: 'Hybrid search, GraphQL' },
                        { title: 'pgvector', value: 'pgvector', description: 'PostgreSQL extension, simple' },
                    ],
                    initial: 0,
                },
                {
                    type: 'select',
                    name: 'authProvider',
                    message: 'Which authentication provider?',
                    choices: [
                        { title: 'Clerk (Recommended)', value: 'clerk', description: 'Modern auth with UI components' },
                        { title: 'JWT (Custom)', value: 'jwt', description: 'Roll your own, full control' },
                    ],
                    initial: 0,
                },
                {
                    type: 'confirm',
                    name: 'includeObservability',
                    message: 'Include observability? (Langfuse + Prometheus)',
                    initial: true,
                },
                {
                    type: 'confirm',
                    name: 'includeCelery',
                    message: 'Include background jobs? (Celery + Redis)',
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
                llmProvider: responses.llmProvider,
                vectorDb: responses.vectorDb,
                authProvider: responses.authProvider,
                includeObservability: responses.includeObservability,
                includeCelery: responses.includeCelery,
            };

        } catch (error) {
            console.error(chalk.red('Error during setup:'), error);
            process.exit(1);
        }

        // Create project
        await scaffoldProject(config, options);
    });

async function scaffoldProject(config: ProjectConfig, options: any) {
    const projectPath = path.resolve(process.cwd(), config.projectName);

    // Check if directory exists
    if (await fs.pathExists(projectPath)) {
        console.log(chalk.red(`\n✖ Directory ${config.projectName} already exists!`));
        process.exit(1);
    }

    const spinner = ora('Creating project structure...').start();

    try {
        // Create project directory
        await fs.ensureDir(projectPath);

        // Get template path
        const templatePath = path.join(__dirname, '../template');

        // Copy template
        await fs.copy(templatePath, projectPath);

        spinner.succeed('Project structure created');

        // Update environment files
        spinner.start('Configuring environment...');
        await configureEnvironment(projectPath, config);
        spinner.succeed('Environment configured');

        // Update docker-compose based on vector DB choice
        spinner.start('Configuring Docker services...');
        await configureDocker(projectPath, config);
        spinner.succeed('Docker configured');

        // Install dependencies
        if (!options.skipInstall) {
            const packageManager = options.usePnpm ? 'pnpm' : options.useNpm ? 'npm' : 'pnpm';

            // Install frontend dependencies
            spinner.start(`Installing frontend dependencies with ${packageManager}...`);
            await execa(packageManager, ['install'], {
                cwd: path.join(projectPath, 'apps/frontend'),
                stdio: 'ignore',
            });
            spinner.succeed('Frontend dependencies installed');

            // Install backend dependencies
            spinner.start('Installing backend dependencies with uv...');
            await execa('uv', ['sync'], {
                cwd: path.join(projectPath, 'apps/backend'),
                stdio: 'ignore',
            });
            spinner.succeed('Backend dependencies installed');
        }

        // Success message
        console.log();
        console.log(AI_STACK_GRADIENT('╔═══════════════════════════════════════════════╗'));
        console.log(AI_STACK_GRADIENT('║                                               ║'));
        console.log(AI_STACK_GRADIENT('║              ✨ SUCCESS! ✨                    ║'));
        console.log(AI_STACK_GRADIENT('║                                               ║'));
        console.log(AI_STACK_GRADIENT('╚═══════════════════════════════════════════════╝'));
        console.log();
        console.log(chalk.green(`Your AI Stack project is ready at: ${chalk.bold(config.projectName)}`));
        console.log();
        console.log(chalk.cyan('Configuration:'));
        console.log(`  ${chalk.dim('LLM Provider:')}      ${chalk.bold(config.llmProvider)}`);
        console.log(`  ${chalk.dim('Vector DB:')}         ${chalk.bold(config.vectorDb)}`);
        console.log(`  ${chalk.dim('Auth:')}              ${chalk.bold(config.authProvider)}`);
        console.log(`  ${chalk.dim('Observability:')}     ${config.includeObservability ? chalk.green('Yes') : chalk.dim('No')}`);
        console.log(`  ${chalk.dim('Background Jobs:')}   ${config.includeCelery ? chalk.green('Yes') : chalk.dim('No')}`);
        console.log();
        console.log(chalk.bold('Next steps:'));
        console.log();
        console.log(`  ${chalk.cyan('cd')} ${config.projectName}`);
        console.log(`  ${chalk.cyan('docker-compose up -d')}              ${chalk.dim('# Start services')}`);
        console.log(`  ${chalk.cyan('cd apps/backend && uv run alembic upgrade head')}  ${chalk.dim('# Run migrations')}`);
        console.log();
        console.log(chalk.bold('Then start development:'));
        console.log();
        console.log(`  ${chalk.cyan('# Terminal 1 - Backend')}`);
        console.log(`  ${chalk.dim('cd apps/backend && uv run uvicorn app.main:app --reload')}`);
        console.log();
        console.log(`  ${chalk.cyan('# Terminal 2 - Frontend')}`);
        console.log(`  ${chalk.dim('cd apps/frontend && pnpm dev')}`);
        console.log();
        console.log(chalk.dim('───────────────────────────────────────────────'));
        console.log();
        console.log(`${chalk.bold('Documentation:')} https://ai-stack-fastapi.dev/docs`);
        console.log(`${chalk.bold('Issues:')} https://github.com/yourusername/ai-stack/issues`);
        console.log();

    } catch (error) {
        spinner.fail('Failed to create project');
        console.error(chalk.red('\nError:'), error);
        process.exit(1);
    }
}

async function configureEnvironment(projectPath: string, config: ProjectConfig) {
    const backendEnv = path.join(projectPath, 'apps/backend/.env');
    const frontendEnv = path.join(projectPath, 'apps/frontend/.env');

    // Update backend .env
    let envContent = await fs.readFile(path.join(projectPath, 'apps/backend/.env.example'), 'utf-8');

    envContent = envContent.replace(/LLM_PROVIDER=openai/, `LLM_PROVIDER=${config.llmProvider}`);
    envContent = envContent.replace(/VECTOR_DB_PROVIDER=qdrant/, `VECTOR_DB_PROVIDER=${config.vectorDb}`);
    envContent = envContent.replace(/AUTH_PROVIDER=clerk/, `AUTH_PROVIDER=${config.authProvider}`);

    await fs.writeFile(backendEnv, envContent);

    // Update frontend .env
    let frontendEnvContent = await fs.readFile(path.join(projectPath, 'apps/frontend/.env.example'), 'utf-8');
    await fs.writeFile(frontendEnv, frontendEnvContent);
}

async function configureDocker(projectPath: string, config: ProjectConfig) {
    const dockerComposePath = path.join(projectPath, 'docker-compose.yml');
    const content = await fs.readFile(dockerComposePath, 'utf-8');

    // Update based on vector DB choice
    if (config.vectorDb === 'weaviate') {
        // Add Weaviate service (template should have commented versions)
    } else if (config.vectorDb === 'pgvector') {
        // Remove Qdrant, use pgvector with PostgreSQL
    }

    await fs.writeFile(dockerComposePath, content);
}

program.parse();
