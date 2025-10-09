#!/usr/bin/env bun

import { McpServer, ResourceTemplate } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';

// Environment variables for PostgreSQL connection
const DB_HOST = process.env.POSTGRES_HOST || 'localhost';
const DB_PORT = parseInt(process.env.POSTGRES_PORT || '5432');
const DB_NAME = process.env.POSTGRES_DB || 'postgres';
const DB_USER = process.env.POSTGRES_USER || 'postgres';
const DB_PASSWORD = process.env.POSTGRES_PASSWORD || '';

// PostgreSQL connection string
const connectionString = `postgres://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}`;

// Create MCP server
const server = new McpServer({
    name: 'postgresql-mcp-server',
    version: '1.0.0'
});

// Helper function to execute queries safely
async function executeQuery(sql: string, params?: any[]): Promise<any> {
    try {
        const db = Bun.sql(connectionString);
        const result = params ? await db.query(sql, params) : await db.query(sql);
        return { success: true, data: result };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error occurred'
        };
    }
}

// Register Resource: Database Schema
server.registerResource(
    'schema',
    'postgres://schema',
    {
        title: 'Database Schema',
        description: 'Complete PostgreSQL database schema including all tables, views, and indexes',
        mimeType: 'application/json'
    },
    async (uri) => {
        const result = await executeQuery(`
            SELECT
                table_schema,
                table_name,
                column_name,
                data_type,
                is_nullable,
                column_default
            FROM information_schema.columns
            WHERE table_schema NOT IN ('pg_catalog', 'information_schema')
            ORDER BY table_schema, table_name, ordinal_position;
        `);

        if (!result.success) {
            return {
                contents: [{
                    uri: uri.href,
                    text: `Error fetching schema: ${result.error}`,
                    mimeType: 'text/plain'
                }]
            };
        }

        return {
            contents: [{
                uri: uri.href,
                text: JSON.stringify(result.data, null, 2),
                mimeType: 'application/json'
            }]
        };
    }
);

// Register Resource: Table Data (Dynamic)
server.registerResource(
    'table-data',
    new ResourceTemplate('postgres://tables/{schema}/{table}', { list: undefined }),
    {
        title: 'Table Data',
        description: 'Retrieve data from a specific table'
    },
    async (uri, { schema, table }) => {
        // Validate table exists first
        const checkTable = await executeQuery(
            `SELECT EXISTS (
                SELECT FROM information_schema.tables
                WHERE table_schema = $1 AND table_name = $2
            )`,
            [schema, table]
        );

        if (!checkTable.success || !checkTable.data[0]?.exists) {
            return {
                contents: [{
                    uri: uri.href,
                    text: `Table ${schema}.${table} does not exist`,
                    mimeType: 'text/plain'
                }]
            };
        }

        // Fetch table data (limit to 100 rows for safety)
        const result = await executeQuery(
            `SELECT * FROM "${schema}"."${table}" LIMIT 100`
        );

        if (!result.success) {
            return {
                contents: [{
                    uri: uri.href,
                    text: `Error fetching data: ${result.error}`,
                    mimeType: 'text/plain'
                }]
            };
        }

        return {
            contents: [{
                uri: uri.href,
                text: JSON.stringify(result.data, null, 2),
                mimeType: 'application/json'
            }]
        };
    }
);

// Register Tool: Execute SQL Query
server.registerTool(
    'execute-query',
    {
        title: 'Execute SQL Query',
        description: 'Execute a read-only SQL query against the PostgreSQL database',
        inputSchema: {
            query: z.string().describe('SQL query to execute (SELECT statements only)'),
            params: z.array(z.any()).optional().describe('Optional query parameters for prepared statements')
        }
    },
    async ({ query, params }) => {
        // Basic security check - only allow SELECT queries
        const trimmedQuery = query.trim().toUpperCase();
        if (!trimmedQuery.startsWith('SELECT') &&
            !trimmedQuery.startsWith('EXPLAIN') &&
            !trimmedQuery.startsWith('WITH')) {
            return {
                content: [{
                    type: 'text',
                    text: 'Only SELECT, EXPLAIN, and WITH queries are allowed for security reasons'
                }],
                isError: true
            };
        }

        const result = await executeQuery(query, params);

        if (!result.success) {
            return {
                content: [{
                    type: 'text',
                    text: `Query error: ${result.error}`
                }],
                isError: true
            };
        }

        return {
            content: [{
                type: 'text',
                text: JSON.stringify(result.data, null, 2)
            }]
        };
    }
);

// Register Tool: List Tables
server.registerTool(
    'list-tables',
    {
        title: 'List Tables',
        description: 'List all tables in the database with their schemas and row counts',
        inputSchema: {
            schema: z.string().optional().describe('Filter by schema name (optional)')
        }
    },
    async ({ schema }) => {
        let query = `
            SELECT
                schemaname as schema,
                tablename as table,
                hasindexes as has_indexes,
                hastriggers as has_triggers
            FROM pg_tables
            WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
        `;

        const params: string[] = [];
        if (schema) {
            query += ` AND schemaname = $1`;
            params.push(schema);
        }

        query += ` ORDER BY schemaname, tablename;`;

        const result = await executeQuery(query, params.length > 0 ? params : undefined);

        if (!result.success) {
            return {
                content: [{
                    type: 'text',
                    text: `Error listing tables: ${result.error}`
                }],
                isError: true
            };
        }

        return {
            content: [{
                type: 'text',
                text: JSON.stringify(result.data, null, 2)
            }]
        };
    }
);

// Register Tool: Describe Table
server.registerTool(
    'describe-table',
    {
        title: 'Describe Table',
        description: 'Get detailed information about a table structure including columns, types, and constraints',
        inputSchema: {
            schema: z.string().describe('Schema name'),
            table: z.string().describe('Table name')
        }
    },
    async ({ schema, table }) => {
        const result = await executeQuery(`
            SELECT
                c.column_name,
                c.data_type,
                c.character_maximum_length,
                c.is_nullable,
                c.column_default,
                tc.constraint_type
            FROM information_schema.columns c
            LEFT JOIN information_schema.key_column_usage kcu
                ON c.table_schema = kcu.table_schema
                AND c.table_name = kcu.table_name
                AND c.column_name = kcu.column_name
            LEFT JOIN information_schema.table_constraints tc
                ON kcu.constraint_name = tc.constraint_name
                AND kcu.table_schema = tc.table_schema
            WHERE c.table_schema = $1 AND c.table_name = $2
            ORDER BY c.ordinal_position;
        `, [schema, table]);

        if (!result.success) {
            return {
                content: [{
                    type: 'text',
                    text: `Error describing table: ${result.error}`
                }],
                isError: true
            };
        }

        return {
            content: [{
                type: 'text',
                text: JSON.stringify(result.data, null, 2)
            }]
        };
    }
);

// Register Prompt: Generate Query
server.registerPrompt(
    'generate-query',
    {
        title: 'Generate SQL Query',
        description: 'Help generate SQL queries based on natural language descriptions',
        argsSchema: {
            request: z.string().describe('What you want to query or retrieve from the database')
        }
    },
    ({ request }) => ({
        messages: [
            {
                role: 'user',
                content: {
                    type: 'text',
                    text: `Given this PostgreSQL database request: "${request}"\n\nPlease generate an appropriate SQL query. Consider:\n1. Use proper PostgreSQL syntax\n2. Include relevant JOINs if multiple tables are needed\n3. Add appropriate WHERE clauses for filtering\n4. Use LIMIT for large result sets\n5. Follow best practices for query performance`
                }
            }
        ]
    })
);

// Register Prompt: Optimize Query
server.registerPrompt(
    'optimize-query',
    {
        title: 'Optimize SQL Query',
        description: 'Get suggestions for optimizing a SQL query',
        argsSchema: {
            query: z.string().describe('The SQL query to optimize')
        }
    },
    ({ query }) => ({
        messages: [
            {
                role: 'user',
                content: {
                    type: 'text',
                    text: `Please analyze and suggest optimizations for this PostgreSQL query:\n\n${query}\n\nConsider:\n1. Index usage\n2. JOIN optimization\n3. Query structure\n4. Performance implications\n5. Alternative approaches`
                }
            }
        ]
    })
);

// Start the server
async function main() {
    const transport = new StdioServerTransport();

    await server.connect(transport);

    // Log to stderr so it doesn't interfere with MCP communication
    console.error('PostgreSQL MCP Server running');
    console.error(`Connected to: ${DB_HOST}:${DB_PORT}/${DB_NAME}`);
    console.error('Waiting for MCP client connection...');
}

main().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
});
