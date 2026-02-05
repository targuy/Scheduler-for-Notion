# Workflow Examples

This directory contains example workflow configurations for the Notion LLM Scheduler.

## Available Examples

### 1. Weekly Report (`weekly-report.json`)

**Schedule**: Every Monday at 9 AM

**What it does**:
- Queries items from the past week
- Uses LLM to analyze and create a comprehensive weekly report
- Creates a new page in a reports database

**Use case**: Automated weekly summaries for project management

---

### 2. Task Analysis (`task-analysis.json`)

**Schedule**: Daily at 8 AM

**What it does**:
- Queries all tasks with "In Progress" status
- For each task, reads the full content
- Uses LLM to provide:
  - Complexity estimation
  - Potential blockers
  - Suggested subtasks
- Updates each task page with the analysis

**Use case**: AI-powered task planning and estimation

---

### 3. Content Summarization (`content-summarization.json`)

**Schedule**: Every 4 hours

**What it does**:
- Finds draft content without summaries
- For each page, reads the full content
- Generates a concise 2-3 sentence summary
- Updates the page's Summary property

**Use case**: Automated content summarization for content management

---

## How to Use These Examples

1. **Copy an example**:
```bash
cp examples/task-analysis.json my-workflow.json
```

2. **Edit the configuration**:
   - Replace `YOUR_DATABASE_ID` with your actual Notion database ID
   - Replace `YOUR_TASKS_DATABASE_ID` with your tasks database ID
   - Adjust the cron schedule if needed
   - Customize the LLM prompts

3. **Test the workflow**:
```bash
npm start run my-workflow.json
```

4. **Run on a schedule**:
```bash
npm start start my-workflow.json
```

## Finding Your Database ID

1. Open your database in Notion
2. Copy the URL (e.g., `https://www.notion.so/xxxxx?v=yyyyy`)
3. The database ID is `xxxxx` (the part before `?v=`)

## Customizing Prompts

The LLM prompts in these examples are starting points. You can customize them based on your needs:

- Be specific about the format you want
- Ask for structured output (bullet points, sections, etc.)
- Include examples in the prompt for better results
- Use clear, concise language

## Creating Your Own Workflows

Workflows support:
- **Actions**: read, write, update, query, llm
- **Conditions**: Filter actions based on context
- **Loops**: Process multiple items
- **Sequences**: Chain multiple actions together

Example structure:
```json
{
  "cronSchedule": "0 9 * * *",
  "enabled": true,
  "workflows": [
    {
      "name": "my-workflow",
      "description": "What this workflow does",
      "actions": [
        {
          "type": "query",
          "params": { "databaseId": "..." }
        },
        {
          "type": "llm",
          "prompt": "Your prompt here"
        }
      ]
    }
  ]
}
```

## Tips

- Start with simple workflows and gradually add complexity
- Test workflows manually before scheduling
- Use descriptive names for workflows
- Keep LLM prompts focused and specific
- Monitor API usage and costs
- Set `enabled: false` while testing

## Need Help?

- Check the main [README.md](../README.md) for full documentation
- See [QUICKSTART.md](../QUICKSTART.md) for step-by-step setup
- Open an issue on GitHub for questions
