import { NotionContext, MCPContext } from '../types';
import axios from 'axios';

/**
 * MCP (Model Context Protocol) Connector
 * This connector enables passing Notion context to LLMs via MCP
 */
export class MCPConnector {
  private serverUrl: string;

  constructor(serverUrl: string) {
    this.serverUrl = serverUrl;
  }

  /**
   * Send Notion context to MCP server
   */
  async sendContext(notionContext: NotionContext): Promise<void> {
    try {
      const mcpContext: MCPContext = {
        serverUrl: this.serverUrl,
        notionData: notionContext
      };

      await axios.post(`${this.serverUrl}/context`, mcpContext);
      console.log('Context sent to MCP server');
    } catch (error) {
      console.error('Failed to send context to MCP server:', error);
      // Don't throw - MCP is optional
    }
  }

  /**
   * Retrieve context from MCP server
   */
  async getContext(): Promise<NotionContext | null> {
    try {
      const response = await axios.get(`${this.serverUrl}/context`);
      return response.data.notionData;
    } catch (error) {
      console.error('Failed to retrieve context from MCP server:', error);
      return null;
    }
  }

  /**
   * Check if MCP server is available
   */
  async isAvailable(): Promise<boolean> {
    try {
      await axios.get(`${this.serverUrl}/health`, { timeout: 2000 });
      return true;
    } catch (error) {
      return false;
    }
  }
}
