# PostgreSQL MCP Server

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Bun](https://img.shields.io/badge/Bun-%23000000.svg?style=flat&logo=bun&logoColor=white)](https://bun.sh)
[![TypeScript](https://img.shields.io/badge/TypeScript-%23007ACC.svg?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

A **Model Context Protocol (MCP)** server implementation for PostgreSQL database interactions, built with [Bun](https://bun.sh) runtime and the official [MCP TypeScript SDK](https://www.npmjs.com/package/@modelcontextprotocol/sdk).

This server enables LLMs (Large Language Models) to interact with PostgreSQL databases through a standardized protocol, providing secure read-only access to database schemas, tables, and query execution.

## Features

### 🔌 Resources
- **Database Schema** (`postgres://schema`) - Complete database schema with all tables, columns, and types
- **Table Data** (`postgres://tables/{schema}/{table}`) - Dynamic access to table data with automatic validation

### 🛠️ Tools
- **execute-query** - Execute read-only SQL queries (SELECT, EXPLAIN, WITH statements)
- **list-tables** - List all tables with schema information, indexes, and triggers
- **describe-table** - Get detailed table structure including columns, types, and constraints

### 💬 Prompts
- **generate-query** - Natural language to SQL query generation assistance
- **optimize-query** - SQL query optimization suggestions

### 🔒 Security
- Read-only query execution (only SELECT, EXPLAIN, and WITH statements allowed)
- SQL injection protection via parameterized queries
- Table existence validation before data access
- Row limits on data retrieval (100 rows max)

## Installation

### Prerequisites

- [Bun](https://bun.sh) v1.0.0 or higher
- PostgreSQL database (local or remote)
- Node.js v18.0.0 or higher (for compatibility)

### Install Dependencies

```bash
bun install
```

## Configuration

The server uses environment variables for PostgreSQL connection configuration:

```bash
# .env file (create this in your project root)
POSTGRES_HOST=localhost      # default: localhost
POSTGRES_PORT=5432          # default: 5432
POSTGRES_DB=postgres        # default: postgres
POSTGRES_USER=postgres      # default: postgres
POSTGRES_PASSWORD=          # default: empty string
```

> **Note:** Bun automatically loads `.env` files, so no need for `dotenv` package.

## Usage

### Running the Server

```bash
# Production mode
bun start

# Development mode with hot reload
bun run dev

# Direct execution
bun run server.ts
```

### Using with MCP Clients

This server implements the MCP protocol and can be used with any MCP-compatible client. Here's an example configuration for Claude Desktop:

#### Claude Desktop Configuration

Add this to your Claude Desktop config file:

**MacOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows:** `%APPDATA%/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "postgresql": {
      "command": "bun",
      "args": ["run", "/absolute/path/to/postgresql-mcp-js/server.ts"],
      "env": {
        "POSTGRES_HOST": "localhost",
        "POSTGRES_PORT": "5432",
        "POSTGRES_DB": "your_database",
        "POSTGRES_USER": "your_user",
        "POSTGRES_PASSWORD": "your_password"
      }
    }
  }
}
```

### MCP Inspector (Testing & Debugging)

Use the [MCP Inspector](https://github.com/modelcontextprotocol/inspector) to test and debug your server:

```bash
npx @modelcontextprotocol/inspector bun run server.ts
```

## API Reference

### Resources

#### Database Schema
```
URI: postgres://schema
Description: Retrieve complete database schema
Returns: JSON with all tables, columns, and data types
```

#### Table Data
```
URI: postgres://tables/{schema}/{table}
Parameters:
  - schema: Schema name (e.g., "public")
  - table: Table name (e.g., "users")
Returns: JSON array of up to 100 rows
```

### Tools

#### execute-query
Execute read-only SQL queries against the database.

**Input:**
```json
{
  "query": "SELECT * FROM users WHERE id = $1",
  "params": [1]
}
```

**Output:** JSON result set

#### list-tables
List all tables in the database.

**Input:**
```json
{
  "schema": "public"  // optional
}
```

**Output:** Array of tables with metadata

#### describe-table
Get detailed information about a table.

**Input:**
```json
{
  "schema": "public",
  "table": "users"
}
```

**Output:** Table structure with columns and constraints

### Prompts

#### generate-query
Help generate SQL queries from natural language.

**Arguments:**
```json
{
  "request": "Get all users who registered in the last 30 days"
}
```

#### optimize-query
Get optimization suggestions for SQL queries.

**Arguments:**
```json
{
  "query": "SELECT * FROM users JOIN orders ON users.id = orders.user_id"
}
```

## Development

### Project Structure

```
postgresql-mcp-js/
├── server.ts          # Main MCP server implementation
├── package.json       # Project metadata and dependencies
├── tsconfig.json      # TypeScript configuration
├── .gitignore        # Git ignore rules
├── CLAUDE.md         # Project-specific instructions
├── README.md         # This file
└── LICENSE           # MIT License
```

### Testing

```bash
bun test
```

### Building

No build step required! Bun executes TypeScript directly.

## Why Bun?

This project uses [Bun](https://bun.sh) as the runtime for several advantages:

- ⚡ **Fast startup** - Near-instant cold starts
- 🔋 **Built-in PostgreSQL** - Native `Bun.sql` support, no need for `pg` or `postgres.js`
- 📦 **No transpilation** - Direct TypeScript execution
- 🌐 **Modern APIs** - Built-in WebSocket, fetch, and more
- 🔄 **Auto .env loading** - No `dotenv` package needed

## MCP Protocol

This server implements the [Model Context Protocol](https://modelcontextprotocol.io/), a standardized protocol for communication between LLM applications and external data sources.

### Key Concepts

- **Resources**: Data sources that can be read (like REST GET endpoints)
- **Tools**: Functions that can be executed (like REST POST endpoints)
- **Prompts**: Reusable templates for LLM interactions
- **Transport**: Communication layer (stdio in this implementation)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### Development Guidelines

1. Follow the existing code style
2. Add tests for new features
3. Update documentation as needed
4. Ensure all tests pass before submitting PR

## Security Considerations

- This server is designed for **read-only** database access
- Only SELECT, EXPLAIN, and WITH queries are allowed
- Parameterized queries prevent SQL injection
- Row limits prevent excessive data retrieval
- Never expose write operations in production environments

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Model Context Protocol](https://modelcontextprotocol.io/) by Anthropic
- [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)
- [Bun Runtime](https://bun.sh)

## Support

- 🐛 [Report Issues](https://github.com/nicotordev/postgresql-mcp-js/issues)
- 💡 [Request Features](https://github.com/nicotordev/postgresql-mcp-js/issues/new)
- 📖 [MCP Documentation](https://modelcontextprotocol.io/docs)

## Related Projects

- [Official MCP Servers](https://github.com/modelcontextprotocol/servers)
- [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)
- [Claude Desktop](https://claude.ai/download)

---

## Author

**NicoTorDev** 🇨🇱

Full Stack Developer from Chile specializing in TypeScript, PostgreSQL, and AI-powered development.

- 🌐 Website: [nicotordev.com](https://nicotordev.com)
- 💼 GitHub: [@nicotordev](https://github.com/nicotordev)
- 🧠 Expertise: TypeScript · Next.js · React · Node.js · PostgreSQL · MySQL · MongoDB
- 🤖 AI & Modern Development Tools

---

**Built with ❤️ using Bun and the Model Context Protocol**
