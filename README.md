# Scheduler for Notion

An intelligent automation agent that interfaces Notion with Large Language Models (LLMs) to enhance the capabilities of Notion's built-in AI. This tool enables scheduled execution of complex workflows with conditional logic, loops, and AI-powered analysis.

## Features

- **Multi-LLM Support**: Works with OpenAI (ChatGPT), Anthropic (Claude), and LMStudio (local models)
- **Notion API Integration**: Full read/write access to Notion pages and databases
- **Workflow Automation**: Execute sequences of actions with conditional logic and loops
- **Scheduled Execution**: Cron-based scheduler for automated workflows
- **MCP (Model Context Protocol) Support**: Enhanced context passing to LLMs
- **Flexible Configuration**: JSON-based workflow definitions

## Why This Tool?

Notion's built-in AI has limitations:
- Cannot execute sequences of actions with conditions
- Cannot loop over multiple items
- Limited context awareness
- No automation or scheduling

This tool solves these problems by providing a powerful agent that can:
- Read from Notion databases and pages
- Process data with advanced LLMs
- Update Notion with AI-generated insights
- Run workflows on a schedule or triggered by events
- Execute complex logic with conditions and loops

## Installation

1. Clone this repository:
```bash
git clone https://github.com/targuy/Scheduler-for-Notion.git
cd Scheduler-for-Notion
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
cp .env.example .env
# Edit .env with your API keys
```

## Configuration

### Environment Variables

Create a `.env` file with the following variables:

```env
# Notion Configuration (Required)
NOTION_API_KEY=your_notion_api_key_here
NOTION_DATABASE_ID=your_database_id_here

# LLM Provider (Choose one)
DEFAULT_LLM_PROVIDER=openai  # Options: openai, anthropic, lmstudio

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-4

# Anthropic Configuration
ANTHROPIC_API_KEY=your_anthropic_api_key_here
ANTHROPIC_MODEL=claude-3-opus-20240229

# LMStudio Configuration (for local models)
LMSTUDIO_API_URL=http://localhost:1234/v1
LMSTUDIO_MODEL=local-model

# Scheduler Configuration
CRON_SCHEDULE=0 */6 * * *  # Run every 6 hours

# MCP Configuration (Optional)
MCP_SERVER_URL=http://localhost:3000
```

### Getting Notion API Key

1. Go to https://www.notion.so/my-integrations
2. Click "New integration"
3. Give it a name and select the workspace
4. Copy the "Internal Integration Token"
5. Share your database/pages with the integration

### Workflow Configuration

Create a `workflow-config.json` file or generate a sample:

```bash
npm start generate-config ./workflow-config.json
```

Example workflow configuration:

```json
{
  "cronSchedule": "0 */6 * * *",
  "enabled": true,
  "workflows": [
    {
      "name": "analyze-database",
      "description": "Analyze Notion database with AI",
      "actions": [
        {
          "type": "query",
          "target": "database-id",
          "params": {
            "databaseId": "your-database-id"
          }
        },
        {
          "type": "llm",
          "prompt": "Analyze this database and provide insights"
        }
      ],
      "loop": {
        "items": "queryResults",
        "actions": [
          {
            "type": "read",
            "params": {
              "pageId": "${currentItem.id}"
            }
          },
          {
            "type": "llm",
            "prompt": "Summarize this page"
          },
          {
            "type": "update",
            "params": {
              "pageId": "${currentItem.id}"
            }
          }
        ]
      }
    }
  ]
}
```

## Usage

### Start Scheduler (Continuous Mode)

Run the scheduler with automated execution:

```bash
npm start start ./workflow-config.json
```

This will start the scheduler and run workflows based on the cron schedule.

### Run Workflows Once

Execute all workflows once and exit:

```bash
npm start run ./workflow-config.json
```

### Run Specific Workflow

Execute a single workflow by name:

```bash
npm start workflow analyze-database ./workflow-config.json
```

### Generate Sample Configuration

Create a sample workflow configuration file:

```bash
npm start generate-config ./my-workflow.json
```

### Test MCP Connection

Check if the MCP server is available:

```bash
npm start test-mcp
```

## Workflow Actions

### Available Action Types

#### 1. Read Action
Read a Notion page:
```json
{
  "type": "read",
  "target": "page-id",
  "params": {
    "pageId": "page-id"
  }
}
```

#### 2. Query Action
Query a Notion database:
```json
{
  "type": "query",
  "target": "database-id",
  "params": {
    "databaseId": "database-id",
    "filter": {
      "property": "Status",
      "select": {
        "equals": "Active"
      }
    }
  }
}
```

#### 3. LLM Action
Execute an LLM prompt with Notion context:
```json
{
  "type": "llm",
  "prompt": "Analyze the following content and provide insights"
}
```

#### 4. Write Action
Create a new page in Notion:
```json
{
  "type": "write",
  "target": "database-id",
  "params": {
    "databaseId": "database-id",
    "properties": {
      "Title": {
        "title": [
          {
            "text": {
              "content": "New Page"
            }
          }
        ]
      }
    }
  }
}
```

#### 5. Update Action
Update an existing page:
```json
{
  "type": "update",
  "target": "page-id",
  "params": {
    "pageId": "page-id",
    "properties": {
      "Status": {
        "select": {
          "name": "Completed"
        }
      }
    }
  }
}
```

### Conditional Actions

Add conditions to actions:
```json
{
  "type": "llm",
  "prompt": "Analyze this item",
  "condition": "(context) => context.currentItem.status === 'pending'"
}
```

### Loops

Process multiple items:
```json
{
  "loop": {
    "items": "queryResults",
    "actions": [
      {
        "type": "read",
        "params": {
          "pageId": "${currentItem.id}"
        }
      },
      {
        "type": "llm",
        "prompt": "Process this item"
      }
    ]
  }
}
```

## Example Use Cases

### 1. Automated Content Summarization

Summarize all pages in a database daily:

```json
{
  "name": "daily-summarization",
  "description": "Summarize all pages daily",
  "actions": [
    {
      "type": "query",
      "target": "database-id"
    }
  ],
  "loop": {
    "items": "queryResults",
    "actions": [
      {
        "type": "read",
        "params": {
          "pageId": "${currentItem.id}"
        }
      },
      {
        "type": "llm",
        "prompt": "Create a concise summary of this content"
      },
      {
        "type": "update",
        "params": {
          "pageId": "${currentItem.id}"
        }
      }
    ]
  }
}
```

### 2. Task Prioritization

Analyze tasks and suggest priorities:

```json
{
  "name": "task-prioritization",
  "description": "Analyze and prioritize tasks",
  "actions": [
    {
      "type": "query",
      "target": "tasks-database-id",
      "params": {
        "filter": {
          "property": "Status",
          "select": {
            "equals": "Todo"
          }
        }
      }
    },
    {
      "type": "llm",
      "prompt": "Analyze these tasks and suggest priority order based on urgency and importance"
    }
  ]
}
```

### 3. Content Generation

Generate content based on templates:

```json
{
  "name": "content-generator",
  "description": "Generate content from templates",
  "actions": [
    {
      "type": "read",
      "target": "template-page-id"
    },
    {
      "type": "llm",
      "prompt": "Based on this template, generate 5 unique article ideas with outlines"
    },
    {
      "type": "write",
      "target": "articles-database-id"
    }
  ]
}
```

## Architecture

```
┌─────────────────────────────────────────────────┐
│            Notion Scheduler App                 │
├─────────────────────────────────────────────────┤
│                                                 │
│  ┌────────────┐    ┌──────────────┐           │
│  │  Scheduler │───▶│ Workflow     │           │
│  │  (Cron)    │    │ Engine       │           │
│  └────────────┘    └──────┬───────┘           │
│                            │                    │
│                     ┌──────▼───────┐           │
│                     │ Notion Agent │           │
│                     └──────┬───────┘           │
│                            │                    │
│          ┌─────────────────┼─────────────┐     │
│          │                 │             │     │
│   ┌──────▼──────┐   ┌──────▼──────┐   ┌─▼───┐│
│   │   Notion    │   │     LLM     │   │ MCP ││
│   │   Service   │   │   Clients   │   │     ││
│   └──────┬──────┘   └──────┬──────┘   └─┬───┘│
│          │                 │             │     │
└──────────┼─────────────────┼─────────────┼─────┘
           │                 │             │
     ┌─────▼─────┐    ┌──────▼──────┐    │
     │  Notion   │    │ OpenAI/     │    │
     │    API    │    │ Claude/     │    │
     │           │    │ LMStudio    │    │
     └───────────┘    └─────────────┘    │
                                          │
                                  ┌───────▼──────┐
                                  │ MCP Server   │
                                  └──────────────┘
```

## Development

### Build TypeScript

```bash
npm run build
```

### Run in Development Mode

```bash
npm run dev
```

### Project Structure

```
.
├── src/
│   ├── agent/          # Agent and workflow execution
│   ├── llm/            # LLM client implementations
│   ├── notion/         # Notion API integration
│   ├── scheduler/      # Cron scheduler
│   ├── types/          # TypeScript type definitions
│   ├── utils/          # Utilities and helpers
│   └── index.ts        # Main entry point
├── .env.example        # Example environment variables
├── tsconfig.json       # TypeScript configuration
└── package.json        # NPM configuration
```

## Security

- Never commit your `.env` file
- Keep your API keys secure
- Use environment variables for sensitive data
- Review LLM outputs before updating Notion
- Test workflows with non-production data first

## Troubleshooting

### "Missing required environment variables"

Ensure all required variables in `.env` are set, especially:
- `NOTION_API_KEY`
- LLM provider API key (based on `DEFAULT_LLM_PROVIDER`)

### "Failed to retrieve page"

- Verify the page/database ID is correct
- Ensure your Notion integration has access to the page/database
- Check that the integration is added to the workspace

### "LLM API error"

- Verify your API key is valid
- Check API rate limits
- For LMStudio, ensure the server is running locally

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

ISC

## Support

For issues and questions, please open an issue on GitHub:
https://github.com/targuy/Scheduler-for-Notion/issues
