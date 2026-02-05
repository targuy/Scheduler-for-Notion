import { NotionService } from '../notion/NotionService';
import { ILLMClient } from '../llm/BaseLLMClient';
import { AgentAction, AgentWorkflow, NotionContext } from '../types';

export class NotionAgent {
  private notionService: NotionService;
  private llmClient: ILLMClient;

  constructor(notionService: NotionService, llmClient: ILLMClient) {
    this.notionService = notionService;
    this.llmClient = llmClient;
  }

  /**
   * Execute a single action
   */
  async executeAction(action: AgentAction, context: any = {}): Promise<any> {
    console.log(`Executing action: ${action.type}`, action.params);

    // Check condition if specified
    if (action.condition && !action.condition(context)) {
      console.log('Action condition not met, skipping');
      return null;
    }

    switch (action.type) {
      case 'read':
        return await this.executeRead(action, context);
      case 'write':
        return await this.executeWrite(action, context);
      case 'update':
        return await this.executeUpdate(action, context);
      case 'query':
        return await this.executeQuery(action, context);
      case 'llm':
        return await this.executeLLM(action, context);
      default:
        throw new Error(`Unknown action type: ${action.type}`);
    }
  }

  /**
   * Execute a workflow
   */
  async executeWorkflow(workflow: AgentWorkflow): Promise<void> {
    console.log(`\n=== Starting workflow: ${workflow.name} ===`);
    if (workflow.description) {
      console.log(`Description: ${workflow.description}`);
    }

    const context: any = {};

    // Execute main actions
    for (const action of workflow.actions) {
      try {
        const result = await this.executeAction(action, context);
        context.lastResult = result;
      } catch (error) {
        console.error(`Error executing action:`, error);
        throw error;
      }
    }

    // Execute loop if specified
    if (workflow.loop) {
      await this.executeLoop(workflow.loop, context);
    }

    console.log(`=== Completed workflow: ${workflow.name} ===\n`);
  }

  /**
   * Execute a loop over items
   */
  private async executeLoop(loop: any, context: any): Promise<void> {
    const items = context[loop.items];
    if (!Array.isArray(items)) {
      console.error(`Loop items not found or not an array: ${loop.items}`);
      return;
    }

    console.log(`Looping over ${items.length} items`);

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      console.log(`\nProcessing item ${i + 1}/${items.length}`);
      
      const loopContext = { ...context, currentItem: item, currentIndex: i };

      for (const action of loop.actions) {
        try {
          const result = await this.executeAction(action, loopContext);
          loopContext.lastResult = result;
        } catch (error) {
          console.error(`Error in loop action:`, error);
          // Continue with next item
          break;
        }
      }
    }
  }

  /**
   * Execute read action
   */
  private async executeRead(action: AgentAction, context: any): Promise<NotionContext> {
    const pageId = action.params?.pageId || action.target;
    if (!pageId) {
      throw new Error('Read action requires pageId');
    }

    const notionContext = await this.notionService.getPage(pageId);
    context.notionContext = notionContext;
    context.notionText = this.notionService.convertToText(notionContext);
    
    console.log(`Read page: ${notionContext.metadata?.title}`);
    return notionContext;
  }

  /**
   * Execute query action
   */
  private async executeQuery(action: AgentAction, context: any): Promise<NotionContext> {
    const databaseId = action.params?.databaseId || action.target;
    if (!databaseId) {
      throw new Error('Query action requires databaseId');
    }

    const filter = action.params?.filter;
    const notionContext = await this.notionService.queryDatabase(databaseId, filter);
    context.notionContext = notionContext;
    context.notionText = this.notionService.convertToText(notionContext);
    context.queryResults = notionContext.content;
    
    console.log(`Queried database: ${notionContext.content.length} results`);
    return notionContext;
  }

  /**
   * Execute LLM action
   */
  private async executeLLM(action: AgentAction, context: any): Promise<string> {
    if (!action.prompt) {
      throw new Error('LLM action requires a prompt');
    }

    const notionText = context.notionText || '';
    const llmResponse = await this.llmClient.sendPrompt(action.prompt, notionText);
    
    context.llmResponse = llmResponse.content;
    console.log(`LLM response received (${llmResponse.provider})`);
    console.log(`Usage: ${JSON.stringify(llmResponse.usage)}`);
    
    return llmResponse.content;
  }

  /**
   * Execute write action
   */
  private async executeWrite(action: AgentAction, context: any): Promise<string> {
    const databaseId = action.params?.databaseId || action.target;
    if (!databaseId) {
      throw new Error('Write action requires databaseId');
    }

    const properties = action.params?.properties || {};
    const content = action.params?.content || context.llmResponse || '';

    // Create blocks from content if it's a string
    const blocks = [];
    if (typeof content === 'string' && content) {
      const lines = content.split('\n\n');
      for (const line of lines) {
        if (line.trim()) {
          blocks.push(this.notionService.createTextBlock(line.trim()));
        }
      }
    }

    const pageId = await this.notionService.createPage(databaseId, properties, blocks);
    console.log(`Created new page: ${pageId}`);
    return pageId;
  }

  /**
   * Execute update action
   */
  private async executeUpdate(action: AgentAction, context: any): Promise<void> {
    const pageId = action.params?.pageId || action.target;
    if (!pageId) {
      throw new Error('Update action requires pageId');
    }

    // Update properties if specified
    if (action.params?.properties) {
      await this.notionService.updatePage(pageId, action.params.properties);
      console.log(`Updated page properties: ${pageId}`);
    }

    // Append content if specified
    const content = action.params?.content || context.llmResponse;
    if (content) {
      const blocks = [];
      
      // Add a divider
      blocks.push({
        object: 'block',
        type: 'divider',
        divider: {}
      });

      // Add heading for LLM response
      blocks.push(this.notionService.createHeadingBlock('AI Analysis'));

      // Add content blocks
      if (typeof content === 'string') {
        const lines = content.split('\n\n');
        for (const line of lines) {
          if (line.trim()) {
            blocks.push(this.notionService.createTextBlock(line.trim()));
          }
        }
      }

      await this.notionService.appendBlocks(pageId, blocks);
      console.log(`Appended content to page: ${pageId}`);
    }
  }
}
