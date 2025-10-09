# Contributing to PostgreSQL MCP Server

Thank you for your interest in contributing to the PostgreSQL MCP Server! This document provides guidelines and instructions for contributing to this project.

## Code of Conduct

This project adheres to a Code of Conduct. By participating, you are expected to uphold this code. Please read [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) before contributing.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check existing issues to avoid duplicates. When creating a bug report, include as many details as possible:

- Use a clear and descriptive title
- Describe the exact steps to reproduce the problem
- Provide specific examples
- Describe the behavior you observed and what you expected
- Include logs and error messages
- Specify your environment (Bun version, PostgreSQL version, OS)

### Suggesting Enhancements

Enhancement suggestions are welcome! When creating an enhancement suggestion:

- Use a clear and descriptive title
- Provide a detailed description of the proposed feature
- Explain why this enhancement would be useful
- Include examples of how it would be used
- List any alternatives you've considered

### Pull Requests

1. **Fork the Repository**
   ```bash
   gh repo fork nicotordev/postgresql-mcp-js --clone
   cd postgresql-mcp-js
   ```

2. **Create a Branch**
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/your-bug-fix
   ```

3. **Make Your Changes**
   - Write clear, concise commit messages
   - Follow the existing code style
   - Add tests for new features
   - Update documentation as needed

4. **Test Your Changes**
   ```bash
   # Install dependencies
   bun install

   # Run tests
   bun test

   # Test with MCP Inspector
   npx @modelcontextprotocol/inspector bun run server.ts
   ```

5. **Commit Your Changes**
   ```bash
   git add .
   git commit -m "feat: add amazing feature"
   ```

   Use conventional commit messages:
   - `feat:` - New feature
   - `fix:` - Bug fix
   - `docs:` - Documentation changes
   - `style:` - Code style changes (formatting, etc.)
   - `refactor:` - Code refactoring
   - `test:` - Adding or updating tests
   - `chore:` - Maintenance tasks

6. **Push to Your Fork**
   ```bash
   git push origin feature/your-feature-name
   ```

7. **Open a Pull Request**
   - Go to the original repository
   - Click "New Pull Request"
   - Select your fork and branch
   - Fill out the PR template
   - Wait for review

## Development Setup

### Prerequisites

- [Bun](https://bun.sh) v1.0.0 or higher
- PostgreSQL database (for testing)
- Git

### Installation

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/postgresql-mcp-js.git
cd postgresql-mcp-js

# Install dependencies
bun install

# Create .env file
cp .env.example .env
# Edit .env with your database credentials
```

### Running Locally

```bash
# Development mode with hot reload
bun run dev

# Production mode
bun start
```

### Testing

```bash
# Run tests
bun test

# Test with MCP Inspector
npx @modelcontextprotocol/inspector bun run server.ts
```

## Code Style

This project uses TypeScript and follows these conventions:

- **Indentation**: 4 spaces
- **Quotes**: Single quotes for strings
- **Semicolons**: Required
- **Line Length**: Maximum 120 characters
- **Naming**:
  - `camelCase` for variables and functions
  - `PascalCase` for types and interfaces
  - `UPPER_CASE` for constants

### Example

```typescript
const DB_HOST = process.env.POSTGRES_HOST || 'localhost';

async function executeQuery(sql: string, params?: any[]): Promise<any> {
    try {
        const db = Bun.sql(connectionString);
        const result = params ? await db.query(sql, params) : await db.query(sql);
        return { success: true, data: result };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        };
    }
}
```

## Project Structure

```
postgresql-mcp-js/
├── .github/              # GitHub configuration
│   ├── ISSUE_TEMPLATE/   # Issue templates
│   └── workflows/        # GitHub Actions
├── server.ts             # Main server implementation
├── package.json          # Project metadata
├── tsconfig.json         # TypeScript config
├── .env.example          # Environment example
├── README.md             # Main documentation
├── CONTRIBUTING.md       # This file
├── CODE_OF_CONDUCT.md    # Code of conduct
├── SECURITY.md           # Security policy
└── LICENSE               # MIT License
```

## Adding Features

### Adding a New Tool

Tools are functions that LLMs can call to perform actions:

```typescript
server.registerTool(
    'tool-name',
    {
        title: 'Tool Title',
        description: 'What this tool does',
        inputSchema: {
            param1: z.string().describe('Parameter description'),
            param2: z.number().optional()
        }
    },
    async ({ param1, param2 }) => {
        // Implementation
        return {
            content: [{
                type: 'text',
                text: 'Result'
            }]
        };
    }
);
```

### Adding a New Resource

Resources provide data to LLMs:

```typescript
server.registerResource(
    'resource-name',
    'uri://pattern',
    {
        title: 'Resource Title',
        description: 'What this resource provides',
        mimeType: 'application/json'
    },
    async (uri) => {
        // Implementation
        return {
            contents: [{
                uri: uri.href,
                text: 'Resource data',
                mimeType: 'application/json'
            }]
        };
    }
);
```

### Adding a New Prompt

Prompts are reusable templates:

```typescript
server.registerPrompt(
    'prompt-name',
    {
        title: 'Prompt Title',
        description: 'What this prompt helps with',
        argsSchema: {
            arg1: z.string()
        }
    },
    ({ arg1 }) => ({
        messages: [
            {
                role: 'user',
                content: {
                    type: 'text',
                    text: `Prompt template with ${arg1}`
                }
            }
        ]
    })
);
```

## Documentation

When adding features, update the documentation:

1. **README.md** - Add to API Reference section
2. **Code Comments** - Explain complex logic
3. **JSDoc** - Document functions and types
4. **Examples** - Provide usage examples

## Testing Guidelines

- Write tests for all new features
- Ensure existing tests still pass
- Test with different PostgreSQL versions
- Test error handling
- Test edge cases

## Security

- Never commit sensitive data (passwords, API keys)
- Use environment variables for configuration
- Validate all user inputs
- Sanitize SQL queries
- Report security vulnerabilities privately (see [SECURITY.md](SECURITY.md))

## Getting Help

- 💬 [GitHub Discussions](https://github.com/nicotordev/postgresql-mcp-js/discussions)
- 🐛 [Issue Tracker](https://github.com/nicotordev/postgresql-mcp-js/issues)
- 📖 [MCP Documentation](https://modelcontextprotocol.io/docs)

## Recognition

Contributors will be recognized in:
- README.md acknowledgments section
- GitHub contributors page
- Release notes

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to PostgreSQL MCP Server! 🎉
