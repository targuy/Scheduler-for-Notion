# Architecture Overview

## System Architecture

The Scheduler for Notion is built with a modular architecture that separates concerns and allows for easy extensibility.

```
┌─────────────────────────────────────────────────────────────┐
│                    User Interface (CLI)                      │
│  Commands: start, run, workflow, generate-config, help      │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              NotionSchedulerApp (Main App)                   │
│  • Initialization & Configuration                            │
│  • Environment Validation                                    │
│  • Service Orchestration                                     │
└───┬───────────────────┬──────────────────┬──────────────────┘
    │                   │                  │
    ▼                   ▼                  ▼
┌───────────┐   ┌──────────────┐   ┌──────────────┐
│ Scheduler │   │ NotionAgent  │   │     MCP      │
│  Service  │   │   (Engine)   │   │  Connector   │
└─────┬─────┘   └──────┬───────┘   └──────────────┘
      │                │
      │    ┌───────────┴───────────┐
      │    │                       │
      ▼    ▼                       ▼
┌──────────────┐         ┌──────────────────┐
│   Workflow   │         │  Action Handlers │
│  Execution   │         │  • read          │
└──────────────┘         │  • write         │
                         │  • update        │
                         │  • query         │
                         │  • llm           │
                         └────┬──────┬──────┘
                              │      │
                              ▼      ▼
                    ┌─────────────┐ ┌──────────────┐
                    │   Notion    │ │     LLM      │
                    │   Service   │ │   Factory    │
                    └──────┬──────┘ └──────┬───────┘
                           │                │
                           ▼                ▼
                    ┌─────────────┐ ┌──────────────┐
                    │  Notion API │ │ LLM Clients  │
                    │             │ │ • OpenAI     │
                    └─────────────┘ │ • Anthropic  │
                                    │ • LMStudio   │
                                    └──────────────┘
```

## Core Components

### 1. CLI Interface (`src/index.ts`)
- **Purpose**: User interaction and command routing
- **Responsibilities**:
  - Parse command-line arguments
  - Initialize application
  - Route commands to appropriate handlers
  - Display help and usage information

### 2. NotionSchedulerApp (`src/index.ts`)
- **Purpose**: Main application controller
- **Responsibilities**:
  - Environment validation
  - Service initialization
  - Workflow management
  - Error handling

### 3. NotionService (`src/notion/NotionService.ts`)
- **Purpose**: Notion API abstraction
- **Responsibilities**:
  - Read pages and databases
  - Write and update content
  - Query databases with filters
  - Convert Notion blocks to text
  - Create formatted blocks

### 4. LLM Integration (`src/llm/`)

#### BaseLLMClient
- Abstract base class for all LLM providers
- Defines common interface
- Handles prompt formatting with context

#### Provider-Specific Clients
- **OpenAIClient**: Integration with OpenAI API
- **AnthropicClient**: Integration with Claude API
- **LMStudioClient**: Integration with local LMStudio

#### LLMFactory
- Creates appropriate client based on configuration
- Loads credentials from environment
- Provides unified interface

### 5. NotionAgent (`src/agent/NotionAgent.ts`)
- **Purpose**: Workflow execution engine
- **Responsibilities**:
  - Execute action sequences
  - Handle conditional logic
  - Process loops over items
  - Manage workflow context
  - Coordinate between Notion and LLM services

### 6. WorkflowScheduler (`src/scheduler/WorkflowScheduler.ts`)
- **Purpose**: Automated workflow scheduling
- **Responsibilities**:
  - Manage cron-based schedules
  - Trigger workflows at specified times
  - Handle scheduled task lifecycle

### 7. MCPConnector (`src/utils/MCPConnector.ts`)
- **Purpose**: Model Context Protocol integration
- **Responsibilities**:
  - Send Notion context to MCP server
  - Retrieve context from MCP server
  - Health checks for MCP availability

### 8. ConfigLoader (`src/utils/ConfigLoader.ts`)
- **Purpose**: Configuration management
- **Responsibilities**:
  - Load workflow configurations from files
  - Generate sample configurations
  - Validate configuration structure

## Data Flow

### Reading from Notion → LLM → Writing Back

```
1. User triggers workflow
          │
          ▼
2. Agent queries Notion database
          │
          ▼
3. NotionService fetches data
          │
          ▼
4. Agent converts to text
          │
          ▼
5. Agent sends to LLM with prompt
          │
          ▼
6. LLM processes and responds
          │
          ▼
7. Agent receives response
          │
          ▼
8. Agent formats for Notion
          │
          ▼
9. NotionService writes back
          │
          ▼
10. Workflow completes
```

### Loop Processing

```
1. Query database → returns array of items
          │
          ▼
2. For each item:
    a. Read full page content
    b. Process with LLM
    c. Update page with results
          │
          ▼
3. Continue to next item
          │
          ▼
4. Complete when all items processed
```

## Configuration Flow

```
1. Load .env file
          │
          ▼
2. Validate required variables
          │
          ▼
3. Initialize services with credentials
          │
          ▼
4. Load workflow config (JSON)
          │
          ▼
5. Parse workflow definitions
          │
          ▼
6. Execute workflows
```

## Action Types

### Read Action
- Fetches a Notion page
- Converts to readable text
- Stores in workflow context

### Query Action
- Queries a database with optional filters
- Returns array of items
- Can be used with loops

### LLM Action
- Takes workflow context
- Sends to LLM with prompt
- Returns AI-generated response

### Write Action
- Creates new page in database
- Can include AI response
- Sets properties

### Update Action
- Updates existing page
- Can append content
- Can modify properties

## Extension Points

### Adding New LLM Provider
1. Create client class extending `BaseLLMClient`
2. Implement `sendPrompt` method
3. Add to `LLMFactory`
4. Update environment configuration

### Adding New Action Type
1. Define action in types
2. Add handler in `NotionAgent`
3. Implement execution logic
4. Document usage

### Custom Workflow Logic
1. Create workflow JSON configuration
2. Define action sequence
3. Add conditions if needed
4. Implement loops for batch processing

## Error Handling

- Try-catch blocks at service boundaries
- Graceful degradation for optional features (MCP)
- Clear error messages with context
- Validation before execution

## Security Considerations

- API keys stored in environment variables
- Never commit .env file
- Input validation on all external data
- Rate limiting awareness for API calls
- TypeScript for type safety

## Performance Considerations

- Async/await for all I/O operations
- Batch processing with loops
- Configurable cron schedules
- Connection pooling in HTTP clients
- Efficient text conversion from Notion blocks

## Scalability

- Stateless workflow execution
- Can run multiple instances
- Scheduled jobs are independent
- No shared state between workflows
- Easy horizontal scaling
