# Quick Start Guide

Get up and running with Scheduler for Notion in minutes!

## Prerequisites

- Node.js 16+ installed
- A Notion account with API access
- API key for at least one LLM provider (OpenAI, Anthropic, or LMStudio)

## Installation

1. **Clone the repository**
```bash
git clone https://github.com/targuy/Scheduler-for-Notion.git
cd Scheduler-for-Notion
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment**
```bash
cp .env.example .env
```

Edit `.env` and add your API keys:
```env
NOTION_API_KEY=secret_xxxxxxxxxxxxx
OPENAI_API_KEY=sk-xxxxxxxxxxxxx
DEFAULT_LLM_PROVIDER=openai
```

## Getting Your Notion API Key

1. Go to https://www.notion.so/my-integrations
2. Click "+ New integration"
3. Give it a name (e.g., "LLM Scheduler")
4. Select your workspace
5. Copy the "Internal Integration Token"
6. Share your database/pages with the integration:
   - Open your Notion page/database
   - Click "Share" in the top right
   - Invite your integration

## Your First Workflow

1. **Generate a sample configuration**
```bash
npm start generate-config my-workflow.json
```

2. **Edit the configuration**

Open `my-workflow.json` and replace `your-database-id` with your actual Notion database ID.

To find your database ID:
- Open your database in Notion
- Copy the URL (e.g., `https://www.notion.so/xxxxx?v=yyyyy`)
- The database ID is `xxxxx` (the part before `?v=`)

3. **Test your workflow**
```bash
npm start run my-workflow.json
```

## Example: Daily Task Summarization

Create a file `daily-summary.json`:

```json
{
  "cronSchedule": "0 9 * * *",
  "enabled": true,
  "workflows": [
    {
      "name": "daily-task-summary",
      "description": "Summarize today's tasks",
      "actions": [
        {
          "type": "query",
          "params": {
            "databaseId": "YOUR_DATABASE_ID",
            "filter": {
              "property": "Status",
              "select": {
                "equals": "In Progress"
              }
            }
          }
        },
        {
          "type": "llm",
          "prompt": "Create a brief summary of these tasks with priorities and estimated completion times."
        }
      ]
    }
  ]
}
```

Run it:
```bash
npm start run daily-summary.json
```

## Running on a Schedule

Start the scheduler to run workflows automatically:

```bash
npm start start my-workflow.json
```

The scheduler will run in the background based on your cron schedule. Press `Ctrl+C` to stop.

## Common Cron Schedules

- `0 9 * * *` - Every day at 9:00 AM
- `0 */6 * * *` - Every 6 hours
- `0 9 * * 1` - Every Monday at 9:00 AM
- `*/30 * * * *` - Every 30 minutes
- `0 0 * * 0` - Every Sunday at midnight

## Next Steps

- Explore the [examples/](examples/) directory for more workflow ideas
- Read the full [README.md](README.md) for detailed documentation
- Check [CONTRIBUTING.md](CONTRIBUTING.md) if you want to contribute

## Troubleshooting

### "Missing required environment variables"
- Make sure `.env` file exists
- Verify all required variables are set
- Check for typos in variable names

### "Failed to retrieve page"
- Verify the page/database ID is correct
- Ensure your integration has access to the page
- Check that you've shared the page with your integration

### "LLM API error"
- Verify your API key is correct
- Check you have credits/quota available
- For LMStudio, ensure the server is running

## Need Help?

- Open an issue on GitHub
- Check existing issues for solutions
- Review the full documentation in README.md
