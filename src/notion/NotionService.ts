import { Client } from '@notionhq/client';
import { NotionContext } from '../types';

export class NotionService {
  private client: Client;

  constructor(apiKey: string) {
    this.client = new Client({ auth: apiKey });
  }

  /**
   * Retrieve a page from Notion
   */
  async getPage(pageId: string): Promise<NotionContext> {
    try {
      const page = await this.client.pages.retrieve({ page_id: pageId });
      const blocks = await this.getPageBlocks(pageId);
      
      return {
        pageId,
        content: { page, blocks },
        metadata: {
          title: this.extractTitle(page),
          properties: (page as any).properties
        }
      };
    } catch (error) {
      throw new Error(`Failed to retrieve page: ${error}`);
    }
  }

  /**
   * Retrieve blocks from a page
   */
  async getPageBlocks(pageId: string): Promise<any[]> {
    try {
      const blocks = [];
      let hasMore = true;
      let startCursor: string | undefined;

      while (hasMore) {
        const response: any = await this.client.blocks.children.list({
          block_id: pageId,
          start_cursor: startCursor,
        });
        blocks.push(...response.results);
        hasMore = response.has_more;
        startCursor = response.next_cursor;
      }

      return blocks;
    } catch (error) {
      throw new Error(`Failed to retrieve blocks: ${error}`);
    }
  }

  /**
   * Query a database
   */
  async queryDatabase(databaseId: string, filter?: any): Promise<NotionContext> {
    try {
      const response: any = await (this.client.databases as any).query({
        database_id: databaseId,
        filter: filter,
      });

      return {
        databaseId,
        content: response.results,
        metadata: {
          title: 'Database Query Results'
        }
      };
    } catch (error) {
      throw new Error(`Failed to query database: ${error}`);
    }
  }

  /**
   * Create a new page in a database
   */
  async createPage(databaseId: string, properties: Record<string, any>, children?: any[]): Promise<string> {
    try {
      const response = await this.client.pages.create({
        parent: { database_id: databaseId },
        properties: properties,
        children: children || [],
      });

      return response.id;
    } catch (error) {
      throw new Error(`Failed to create page: ${error}`);
    }
  }

  /**
   * Update an existing page
   */
  async updatePage(pageId: string, properties: Record<string, any>): Promise<void> {
    try {
      await this.client.pages.update({
        page_id: pageId,
        properties: properties,
      });
    } catch (error) {
      throw new Error(`Failed to update page: ${error}`);
    }
  }

  /**
   * Append blocks to a page
   */
  async appendBlocks(pageId: string, blocks: any[]): Promise<void> {
    try {
      await this.client.blocks.children.append({
        block_id: pageId,
        children: blocks,
      });
    } catch (error) {
      throw new Error(`Failed to append blocks: ${error}`);
    }
  }

  /**
   * Extract title from page object
   */
  private extractTitle(page: any): string {
    const properties = page.properties;
    for (const key in properties) {
      const prop = properties[key];
      if (prop.type === 'title' && prop.title.length > 0) {
        return prop.title[0].plain_text;
      }
    }
    return 'Untitled';
  }

  /**
   * Convert Notion content to readable text format
   */
  convertToText(notionContext: NotionContext): string {
    let text = '';
    
    if (notionContext.metadata?.title) {
      text += `Title: ${notionContext.metadata.title}\n\n`;
    }

    const content = notionContext.content;
    if (content.blocks) {
      for (const block of content.blocks) {
        text += this.blockToText(block) + '\n';
      }
    } else if (Array.isArray(content)) {
      // Database results
      for (const item of content) {
        text += this.pageToText(item) + '\n\n';
      }
    }

    return text;
  }

  /**
   * Convert a block to text
   */
  private blockToText(block: any): string {
    const type = block.type;
    if (!block[type]) return '';

    switch (type) {
      case 'paragraph':
        return this.richTextToPlain(block[type].rich_text);
      case 'heading_1':
        return '# ' + this.richTextToPlain(block[type].rich_text);
      case 'heading_2':
        return '## ' + this.richTextToPlain(block[type].rich_text);
      case 'heading_3':
        return '### ' + this.richTextToPlain(block[type].rich_text);
      case 'bulleted_list_item':
        return '- ' + this.richTextToPlain(block[type].rich_text);
      case 'numbered_list_item':
        return '1. ' + this.richTextToPlain(block[type].rich_text);
      case 'to_do':
        const checked = block[type].checked ? '[x]' : '[ ]';
        return `${checked} ${this.richTextToPlain(block[type].rich_text)}`;
      case 'code':
        return '```\n' + this.richTextToPlain(block[type].rich_text) + '\n```';
      default:
        return '';
    }
  }

  /**
   * Convert page to text summary
   */
  private pageToText(page: any): string {
    let text = '';
    const properties = page.properties;
    
    for (const key in properties) {
      const prop = properties[key];
      text += `${key}: ${this.propertyToText(prop)}\n`;
    }
    
    return text;
  }

  /**
   * Convert property to text
   */
  private propertyToText(prop: any): string {
    switch (prop.type) {
      case 'title':
        return this.richTextToPlain(prop.title);
      case 'rich_text':
        return this.richTextToPlain(prop.rich_text);
      case 'number':
        return prop.number?.toString() || '';
      case 'select':
        return prop.select?.name || '';
      case 'multi_select':
        return prop.multi_select?.map((s: any) => s.name).join(', ') || '';
      case 'date':
        return prop.date?.start || '';
      case 'checkbox':
        return prop.checkbox ? 'Yes' : 'No';
      case 'url':
        return prop.url || '';
      case 'email':
        return prop.email || '';
      case 'phone_number':
        return prop.phone_number || '';
      default:
        return '';
    }
  }

  /**
   * Convert rich text array to plain text
   */
  private richTextToPlain(richText: any[]): string {
    return richText.map(text => text.plain_text).join('');
  }

  /**
   * Create a text block for Notion
   */
  createTextBlock(text: string): any {
    return {
      object: 'block',
      type: 'paragraph',
      paragraph: {
        rich_text: [
          {
            type: 'text',
            text: { content: text }
          }
        ]
      }
    };
  }

  /**
   * Create a heading block for Notion
   */
  createHeadingBlock(text: string, level: 1 | 2 | 3 = 2): any {
    const type = `heading_${level}`;
    return {
      object: 'block',
      type: type,
      [type]: {
        rich_text: [
          {
            type: 'text',
            text: { content: text }
          }
        ]
      }
    };
  }
}
