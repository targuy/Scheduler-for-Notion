import dotenv from 'dotenv';
import { NotionService } from './notion/NotionService';
import { LLMFactory } from './llm/LLMFactory';
import { NotionAgent } from './agent/NotionAgent';
import { WorkflowScheduler } from './scheduler/WorkflowScheduler';
import { ConfigLoader } from './utils/ConfigLoader';
import { MCPConnector } from './utils/MCPConnector';
import { AgentWorkflow } from './types';

// Load environment variables
dotenv.config();

/**
 * Main application class
 */
export class NotionSchedulerApp {
  private notionService: NotionService;
  private llmClient: any;
  private agent: NotionAgent;
  private scheduler: WorkflowScheduler | null = null;
  private mcpConnector: MCPConnector | null = null;

  constructor() {
    // Validate required environment variables
    this.validateEnvironment();

    // Initialize services
    this.notionService = new NotionService(process.env.NOTION_API_KEY!);
    
    const llmProvider = process.env.DEFAULT_LLM_PROVIDER || 'openai';
    this.llmClient = LLMFactory.createFromEnv(llmProvider);
    
    this.agent = new NotionAgent(this.notionService, this.llmClient);

    // Initialize MCP connector if configured
    if (process.env.MCP_SERVER_URL) {
      this.mcpConnector = new MCPConnector(process.env.MCP_SERVER_URL);
    }

    console.log('Notion Scheduler initialized');
    console.log(`LLM Provider: ${llmProvider}`);
  }

  private validateEnvironment(): void {
    const required = ['NOTION_API_KEY'];
    const missing = required.filter(key => !process.env[key]);
    
    if (missing.length > 0) {
      throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }

    // Validate LLM configuration
    const provider = process.env.DEFAULT_LLM_PROVIDER || 'openai';
    if (provider === 'openai' && !process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is required when using OpenAI provider');
    }
    if (provider === 'anthropic' && !process.env.ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY is required when using Anthropic provider');
    }
  }

  /**
   * Initialize scheduler with configuration
   */
  initScheduler(configPath?: string): void {
    let config;
    
    if (configPath) {
      config = ConfigLoader.loadFromFile(configPath);
    } else {
      config = ConfigLoader.loadFromEnv();
    }

    this.scheduler = new WorkflowScheduler(this.agent, config);
  }

  /**
   * Start the scheduler
   */
  startScheduler(): void {
    if (!this.scheduler) {
      throw new Error('Scheduler not initialized. Call initScheduler() first.');
    }
    this.scheduler.start();
  }

  /**
   * Stop the scheduler
   */
  stopScheduler(): void {
    if (this.scheduler) {
      this.scheduler.stop();
    }
  }

  /**
   * Run workflows manually
   */
  async runWorkflows(): Promise<void> {
    if (!this.scheduler) {
      throw new Error('Scheduler not initialized. Call initScheduler() first.');
    }
    await this.scheduler.runWorkflows();
  }

  /**
   * Execute a single workflow
   */
  async executeWorkflow(workflow: AgentWorkflow): Promise<void> {
    await this.agent.executeWorkflow(workflow);
  }

  /**
   * Execute a single workflow by name
   */
  async executeWorkflowByName(workflowName: string): Promise<void> {
    if (!this.scheduler) {
      throw new Error('Scheduler not initialized. Call initScheduler() first.');
    }
    await this.scheduler.runWorkflow(workflowName);
  }

  /**
   * Test MCP connection
   */
  async testMCPConnection(): Promise<boolean> {
    if (!this.mcpConnector) {
      console.log('MCP connector not configured');
      return false;
    }
    return await this.mcpConnector.isAvailable();
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'help';

  // Commands that don't require app initialization
  if (command === 'help') {
    console.log(`
Notion Scheduler for LLM Agent

Usage: npm start <command> [options]

Commands:
  start [config-file]              Start the scheduler with optional config file
  run [config-file]                Run workflows once and exit
  workflow <name> [config-file]    Run a specific workflow
  generate-config [output-file]    Generate a sample workflow configuration
  test-mcp                         Test MCP server connection
  help                             Show this help message

Environment Variables:
  NOTION_API_KEY                   Required: Your Notion API key
  NOTION_DATABASE_ID               Optional: Default database ID
  DEFAULT_LLM_PROVIDER             Required: openai, anthropic, or lmstudio
  OPENAI_API_KEY                   Required for OpenAI
  ANTHROPIC_API_KEY                Required for Anthropic
  LMSTUDIO_API_URL                 Required for LMStudio
  CRON_SCHEDULE                    Optional: Cron schedule (default: 0 */6 * * *)
  MCP_SERVER_URL                   Optional: MCP server URL

Examples:
  npm start start ./workflow-config.json
  npm start run
  npm start workflow analyze-database ./config.json
  npm start generate-config ./my-workflow.json
    `);
    return;
  }

  if (command === 'generate-config') {
    const outputPath = args[1] || './workflow-config.json';
    const sampleConfig = ConfigLoader.createSampleConfig();
    ConfigLoader.saveToFile(sampleConfig, outputPath);
    console.log(`Sample configuration generated: ${outputPath}`);
    return;
  }

  // Initialize app for other commands
  const app = new NotionSchedulerApp();

  switch (command) {
    case 'start':
      // Start scheduler with config file or default
      const configPath = args[1];
      app.initScheduler(configPath);
      app.startScheduler();
      console.log('Scheduler running. Press Ctrl+C to stop.');
      // Keep process alive
      process.on('SIGINT', () => {
        console.log('\nStopping scheduler...');
        app.stopScheduler();
        process.exit(0);
      });
      break;

    case 'run':
      // Run workflows once
      const runConfigPath = args[1];
      app.initScheduler(runConfigPath);
      await app.runWorkflows();
      break;

    case 'workflow':
      // Run a specific workflow
      const workflowName = args[1];
      const workflowConfigPath = args[2];
      if (!workflowName) {
        console.error('Usage: npm start workflow <workflow-name> [config-file]');
        process.exit(1);
      }
      app.initScheduler(workflowConfigPath);
      await app.executeWorkflowByName(workflowName);
      break;

    case 'test-mcp':
      // Test MCP connection
      const isAvailable = await app.testMCPConnection();
      console.log(`MCP Server available: ${isAvailable}`);
      break;

    default:
      console.error(`Unknown command: ${command}`);
      console.error('Run "npm start help" for usage information');
      process.exit(1);
  }
}

// Run if this is the main module
if (require.main === module) {
  main().catch(error => {
    console.error('Error:', error);
    process.exit(1);
  });
}

export default NotionSchedulerApp;
