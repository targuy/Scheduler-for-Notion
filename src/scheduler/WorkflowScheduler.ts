import * as cron from 'node-cron';
import { NotionAgent } from '../agent/NotionAgent';
import { AgentWorkflow, SchedulerConfig } from '../types';

export class WorkflowScheduler {
  private agent: NotionAgent;
  private config: SchedulerConfig;
  private scheduledTask: cron.ScheduledTask | null = null;

  constructor(agent: NotionAgent, config: SchedulerConfig) {
    this.agent = agent;
    this.config = config;
  }

  /**
   * Start the scheduler
   */
  start(): void {
    if (!this.config.enabled) {
      console.log('Scheduler is disabled');
      return;
    }

    if (!cron.validate(this.config.cronSchedule)) {
      throw new Error(`Invalid cron schedule: ${this.config.cronSchedule}`);
    }

    console.log(`Starting scheduler with schedule: ${this.config.cronSchedule}`);

    this.scheduledTask = cron.schedule(this.config.cronSchedule, async () => {
      await this.runWorkflows();
    });

    console.log('Scheduler started');
  }

  /**
   * Stop the scheduler
   */
  stop(): void {
    if (this.scheduledTask) {
      this.scheduledTask.stop();
      this.scheduledTask = null;
      console.log('Scheduler stopped');
    }
  }

  /**
   * Run all workflows manually
   */
  async runWorkflows(): Promise<void> {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`Running scheduled workflows at ${new Date().toISOString()}`);
    console.log('='.repeat(60));

    for (const workflow of this.config.workflows) {
      try {
        await this.agent.executeWorkflow(workflow);
      } catch (error) {
        console.error(`Error in workflow ${workflow.name}:`, error);
      }
    }

    console.log(`${'='.repeat(60)}`);
    console.log('All workflows completed\n');
  }

  /**
   * Run a specific workflow by name
   */
  async runWorkflow(workflowName: string): Promise<void> {
    const workflow = this.config.workflows.find(w => w.name === workflowName);
    if (!workflow) {
      throw new Error(`Workflow not found: ${workflowName}`);
    }

    await this.agent.executeWorkflow(workflow);
  }
}
