# What are TS Files?

## Introduction

**TS files** (`.ts` extension) are **TypeScript** source code files. TypeScript is a programming language developed by Microsoft that builds on JavaScript by adding static type definitions. This project is written entirely in TypeScript.

## Why TypeScript?

TypeScript provides several advantages over plain JavaScript:

1. **Type Safety**: Catch errors at compile-time rather than runtime
2. **Better IDE Support**: Enhanced autocomplete, refactoring, and navigation
3. **Self-Documenting Code**: Types serve as inline documentation
4. **Modern JavaScript Features**: Use latest ECMAScript features with confidence
5. **Easier Refactoring**: Types make it safer to change code structure

## TypeScript in This Project

### File Structure

All source code files in the `src/` directory are TypeScript files:

```
src/
├── agent/
│   └── NotionAgent.ts          # Workflow execution engine
├── llm/
│   ├── BaseLLMClient.ts        # Base class for LLM providers
│   ├── LLMFactory.ts           # Factory for creating LLM clients
│   ├── OpenAIClient.ts         # OpenAI integration
│   ├── AnthropicClient.ts      # Anthropic/Claude integration
│   └── LMStudioClient.ts       # LMStudio integration
├── notion/
│   └── NotionService.ts        # Notion API integration
├── scheduler/
│   └── WorkflowScheduler.ts    # Cron-based scheduler
├── types/
│   └── index.ts                # TypeScript type definitions
├── utils/
│   ├── ConfigLoader.ts         # Configuration management
│   └── MCPConnector.ts         # MCP protocol integration
└── index.ts                    # Main entry point
```

### TypeScript Configuration

The project uses `tsconfig.json` to configure the TypeScript compiler:

```json
{
  "compilerOptions": {
    "target": "ES2020",           // Target JavaScript version
    "module": "commonjs",          // Module system
    "outDir": "./dist",            // Compiled output directory
    "rootDir": "./src",            // Source files directory
    "strict": true,                // Enable strict type checking
    "esModuleInterop": true,       // Better ES module compatibility
    "skipLibCheck": true,          // Skip type checking of declaration files
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,     // Allow importing JSON files
    "moduleResolution": "node",    // Node.js module resolution
    "declaration": true,           // Generate .d.ts declaration files
    "sourceMap": true              // Generate source maps for debugging
  }
}
```

## Working with TypeScript Files

### Building TypeScript

TypeScript files must be compiled to JavaScript before they can be executed by Node.js:

```bash
# Compile TypeScript to JavaScript
npm run build
```

This command:
1. Reads all `.ts` files in `src/`
2. Compiles them to `.js` files
3. Outputs to `dist/` directory
4. Generates source maps for debugging

### Running TypeScript Directly

For development, you can run TypeScript files directly without building:

```bash
# Run with ts-node (development mode)
npm run dev

# Or directly:
ts-node src/index.ts
```

`ts-node` compiles and executes TypeScript on-the-fly, which is convenient for development but slower than running pre-compiled JavaScript.

### Example TypeScript Code

Here's a simple example from this project:

```typescript
// Type definitions
interface LLMProvider {
  name: string;
  apiKey: string;
  model: string;
}

// Class with typed properties
export class BaseLLMClient {
  protected provider: LLMProvider;

  constructor(provider: LLMProvider) {
    this.provider = provider;
  }

  // Method with typed parameters and return value
  async sendPrompt(prompt: string, context?: string): Promise<LLMResponse> {
    // Implementation
  }
}
```

Key TypeScript features used:
- **Interfaces**: Define the shape of objects
- **Type annotations**: Specify parameter and return types
- **Optional parameters**: Use `?` for optional properties
- **Async/await**: TypeScript provides excellent support for promises
- **Access modifiers**: `public`, `protected`, `private` for encapsulation

## Common TypeScript Concepts

### Type Annotations

```typescript
// Variable types
let count: number = 0;
let name: string = "Notion Scheduler";
let isEnabled: boolean = true;

// Function types
function greet(name: string): string {
  return `Hello, ${name}!`;
}

// Array types
let items: string[] = ["apple", "banana"];
let numbers: Array<number> = [1, 2, 3];
```

### Interfaces

```typescript
interface WorkflowConfig {
  name: string;
  description: string;
  enabled: boolean;
  actions: Action[];
}

interface Action {
  type: 'read' | 'write' | 'query' | 'llm';
  params?: Record<string, any>;
}
```

### Type Aliases

```typescript
type LLMResponse = {
  content: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
  };
};

type ProviderName = 'openai' | 'anthropic' | 'lmstudio';
```

### Generics

```typescript
// Generic function
function getFirst<T>(items: T[]): T | undefined {
  return items[0];
}

// Usage
const firstNumber = getFirst<number>([1, 2, 3]); // Type: number | undefined
const firstName = getFirst<string>(["a", "b"]);   // Type: string | undefined
```

### Union Types

```typescript
// Value can be one of several types
type Result = string | number | boolean;

// Discriminated unions
type ActionType = 
  | { type: 'read'; pageId: string }
  | { type: 'write'; content: string }
  | { type: 'query'; databaseId: string };
```

## Type Definitions

Type definitions are stored in `src/types/index.ts` and define the core data structures used throughout the application:

```typescript
export interface LLMProvider {
  name: string;
  apiKey: string;
  model: string;
  baseURL?: string;
}

export interface WorkflowConfig {
  cronSchedule: string;
  enabled: boolean;
  workflows: Workflow[];
}

export interface Workflow {
  name: string;
  description: string;
  actions: AgentAction[];
  loop?: LoopConfig;
}
```

## Benefits in This Project

1. **Type-Safe API Integration**: Notion and LLM API responses are properly typed
2. **Workflow Validation**: Catch configuration errors before runtime
3. **Refactoring Safety**: Change interfaces and get immediate feedback
4. **Documentation**: Types serve as documentation for functions and classes
5. **IDE Support**: Better autocomplete and inline documentation

## Learning Resources

### Official Documentation
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html) - Comprehensive guide
- [TypeScript Playground](https://www.typescriptlang.org/play) - Interactive learning environment
- [TypeScript Deep Dive](https://basarat.gitbook.io/typescript/) - In-depth free book

### Video Tutorials
- [TypeScript Tutorial by Net Ninja](https://www.youtube.com/watch?v=2pZmKW9-I_k&list=PL4cUxeGkcC9gUgr39Q_yD6v-bSyMwKPUI)
- [TypeScript Course by freeCodeCamp](https://www.youtube.com/watch?v=30LWjhZzg50)

### Quick References
- [TypeScript Cheat Sheet](https://www.typescriptlang.org/cheatsheets)
- [TypeScript Do's and Don'ts](https://www.typescriptlang.org/docs/handbook/declaration-files/do-s-and-don-ts.html)

## Common TypeScript Errors

### "Cannot find module" Error

```bash
error TS2307: Cannot find module './utils/ConfigLoader'
```

**Solution**: Check file path and ensure the file exists. TypeScript requires exact paths (case-sensitive).

### "Type 'X' is not assignable to type 'Y'" Error

```typescript
// Error: Type 'string' is not assignable to type 'number'
let count: number = "10";
```

**Solution**: Ensure types match. Convert if needed: `let count: number = parseInt("10");`

### "Property 'X' does not exist on type 'Y'" Error

```typescript
// Error: Property 'foo' does not exist on type '{}'
const obj = {};
obj.foo = "bar";
```

**Solution**: Define the type properly:
```typescript
interface MyObject {
  foo: string;
}
const obj: MyObject = { foo: "bar" };
```

## Development Workflow

1. **Write TypeScript**: Edit `.ts` files in `src/`
2. **Type Check**: Run `npm run build` to check for type errors
3. **Test**: Run the application with `npm run dev`
4. **Fix Errors**: Address any TypeScript compilation errors
5. **Build**: Generate production JavaScript with `npm run build`

## FAQ

**Q: Do I need to know TypeScript to use this project?**  
A: Not to use it, but knowledge of TypeScript is helpful if you want to modify or contribute to the code.

**Q: Can I convert this project to JavaScript?**  
A: Technically yes, but you'd lose the benefits of type safety and IDE support. Not recommended.

**Q: How do I add a new TypeScript file?**  
A: Simply create a `.ts` file in the appropriate directory under `src/`. The TypeScript compiler will automatically include it.

**Q: What's the difference between `.ts` and `.js` files?**  
A: `.ts` files contain TypeScript code with type annotations. They're compiled to `.js` files that can run in Node.js.

**Q: Why are there `.d.ts` files?**  
A: These are TypeScript declaration files that contain only type information, no implementation code. They're generated automatically when you build the project.

## Contributing TypeScript Code

When contributing to this project:

1. **Follow Existing Patterns**: Look at existing files for style and structure
2. **Add Type Annotations**: Always type function parameters and return values
3. **Use Interfaces**: Define interfaces for complex objects
4. **Avoid `any` Type**: Use specific types whenever possible
5. **Build Successfully**: Ensure `npm run build` completes without errors
6. **Check Your Types**: Let TypeScript help you catch errors early

For more details, see [CONTRIBUTING.md](CONTRIBUTING.md).

## Conclusion

TypeScript files (`.ts`) are the source code files that make this project type-safe, maintainable, and robust. They provide compile-time error checking and excellent IDE support, making development faster and safer. While there's a learning curve, TypeScript's benefits far outweigh the initial investment in learning it.
