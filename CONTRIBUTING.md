# Contributing to Scheduler for Notion

Thank you for your interest in contributing to Scheduler for Notion! This document provides guidelines and instructions for contributing.

> **New to TypeScript?** This project uses TypeScript for all source code. If you're not familiar with TypeScript or `.ts` files, please read [TYPESCRIPT.md](TYPESCRIPT.md) first for a comprehensive introduction.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/Scheduler-for-Notion.git`
3. Create a new branch: `git checkout -b feature/your-feature-name`
4. Install dependencies: `npm install`
5. Make your changes
6. Build the project: `npm run build`
7. Test your changes
8. Commit your changes: `git commit -m "Description of changes"`
9. Push to your fork: `git push origin feature/your-feature-name`
10. Open a Pull Request

## Development Guidelines

### Code Style

- Use TypeScript for all new code
- Follow the existing code structure and patterns
- Use meaningful variable and function names
- Add comments for complex logic
- Keep functions focused and single-purpose

### Project Structure

```
src/
├── agent/          # Workflow execution engine
├── llm/            # LLM provider implementations
├── notion/         # Notion API integration
├── scheduler/      # Cron scheduler
├── types/          # TypeScript type definitions
├── utils/          # Utility functions
└── index.ts        # Main entry point
```

### Adding a New LLM Provider

To add support for a new LLM provider:

1. Create a new client class in `src/llm/` that extends `BaseLLMClient`
2. Implement the `sendPrompt` method
3. Add the provider to `LLMFactory`
4. Update the `.env.example` file with new environment variables
5. Update the README documentation

Example:
```typescript
import { BaseLLMClient } from './BaseLLMClient';
import { LLMProvider, LLMResponse } from '../types';

export class NewProviderClient extends BaseLLMClient {
  constructor(provider: LLMProvider) {
    super(provider);
  }

  async sendPrompt(prompt: string, context?: string): Promise<LLMResponse> {
    // Implementation
  }
}
```

### Adding a New Action Type

To add a new action type to the workflow engine:

1. Add the action type to the `AgentAction` interface in `src/types/index.ts`
2. Implement the action handler in `NotionAgent.ts`
3. Add documentation and examples

### Testing

- Test your changes manually before submitting
- Ensure the build succeeds: `npm run build`
- Test CLI commands work as expected
- Verify no TypeScript errors

### Commit Messages

Use clear and descriptive commit messages:

- `feat: add support for new LLM provider`
- `fix: resolve issue with database queries`
- `docs: update README with new examples`
- `refactor: improve error handling in NotionService`

## Pull Request Process

1. Update the README.md with details of changes if applicable
2. Update example configurations if needed
3. Ensure your code builds successfully
4. Provide a clear description of the changes in your PR
5. Link any related issues

## Feature Requests and Bug Reports

- Use GitHub Issues to report bugs or request features
- For bugs, include:
  - Description of the issue
  - Steps to reproduce
  - Expected behavior
  - Actual behavior
  - Environment details (OS, Node version, etc.)
- For features, include:
  - Description of the feature
  - Use case and benefits
  - Proposed implementation (if any)

## Code of Conduct

- Be respectful and inclusive
- Welcome newcomers and help them get started
- Focus on constructive feedback
- Assume positive intent

## Questions?

If you have questions, feel free to:
- Open an issue for discussion
- Reach out to maintainers

Thank you for contributing!
