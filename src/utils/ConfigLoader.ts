import { AgentWorkflow, SchedulerConfig } from '../types';
import * as fs from 'fs';
import * as path from 'path';

export class ConfigLoader {
  /**
   * Load configuration from a JSON file
   */
  static loadFromFile(configPath: string): SchedulerConfig {
    try {
      const fullPath = path.resolve(configPath);
      const data = fs.readFileSync(fullPath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      throw new Error(`Failed to load config from ${configPath}: ${error}`);
    }
  }

  /**
   * Load configuration from environment or use defaults
   */
  static loadFromEnv(): SchedulerConfig {
    return {
      cronSchedule: process.env.CRON_SCHEDULE || '0 */6 * * *',
      workflows: [],
      enabled: true
    };
  }

  /**
   * Save configuration to a file
   */
  static saveToFile(config: SchedulerConfig, configPath: string): void {
    try {
      const fullPath = path.resolve(configPath);
      fs.writeFileSync(fullPath, JSON.stringify(config, null, 2), 'utf-8');
      console.log(`Configuration saved to ${fullPath}`);
    } catch (error) {
      throw new Error(`Failed to save config to ${configPath}: ${error}`);
    }
  }

  /**
   * Create a sample workflow configuration
   */
  static createSampleConfig(): SchedulerConfig {
    const sampleWorkflow: AgentWorkflow = {
      name: 'analyze-database',
      description: 'Read from Notion database, analyze with LLM, and write results back',
      actions: [
        {
          type: 'query',
          target: process.env.NOTION_DATABASE_ID || 'your-database-id',
          params: {
            databaseId: process.env.NOTION_DATABASE_ID || 'your-database-id'
          }
        },
        {
          type: 'llm',
          prompt: 'Analyze the following Notion database content and provide insights.'
        }
      ],
      loop: {
        items: 'queryResults',
        actions: [
          {
            type: 'read',
            params: {
              pageId: '${currentItem.id}'
            }
          },
          {
            type: 'llm',
            prompt: 'Summarize this page and provide key takeaways.'
          },
          {
            type: 'update',
            params: {
              pageId: '${currentItem.id}'
            }
          }
        ]
      }
    };

    return {
      cronSchedule: '0 */6 * * *',
      workflows: [sampleWorkflow],
      enabled: false
    };
  }
}
