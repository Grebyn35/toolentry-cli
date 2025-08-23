import { SupportedClient } from '../types/index.js'

export interface ServerTemplate {
  name: string
  description: string
  generateConfig: (client?: SupportedClient, customPath?: string) => Record<string, any>
}

export const SERVER_TEMPLATES: Record<string, ServerTemplate> = {
  toolentry: {
    name: 'Toolentry MCP Server',
    description: 'Official Toolentry MCP server for AI agent tool management',
    generateConfig: (client?: SupportedClient, customPath?: string) => {
      const config: any = {
        toolentry: {
          command: 'npx',
          args: ['@toolentry.io/toolentry-mcp-server@latest'],
          env: {}
        }
      }
      
      // Set CLIENT env variable
      if (client) {
        config.toolentry.env.CLIENT = client
      } else {
        config.toolentry.env.CLIENT = 'unknown'
      }
      
      // Set CONFIG_PATH env variable if custom path is provided
      if (customPath) {
        config.toolentry.env.CONFIG_PATH = customPath
      }
      
      return config
    }
  },
  filesystem: {
    name: 'Filesystem MCP Server',
    description: 'Official MCP filesystem server for file operations',
    generateConfig: (client?: SupportedClient, customPath?: string) => ({
      filesystem: {
        command: 'npx',
        args: ['@modelcontextprotocol/server-filesystem', process.cwd()],
        env: {}
      }
    })
  },
  git: {
    name: 'Git MCP Server',
    description: 'Official MCP git server for repository operations',
    generateConfig: (client?: SupportedClient, customPath?: string) => ({
      git: {
        command: 'npx',
        args: ['@modelcontextprotocol/server-git', process.cwd()],
        env: {}
      }
    })
  },
  sqlite: {
    name: 'SQLite MCP Server',
    description: 'Official MCP SQLite server for database operations',
    generateConfig: (client?: SupportedClient, customPath?: string) => ({
      sqlite: {
        command: 'npx',
        args: ['@modelcontextprotocol/server-sqlite'],
        env: {}
      }
    })
  },
  brave: {
    name: 'Brave Search MCP Server',
    description: 'Official MCP server for Brave Search API',
    generateConfig: (client?: SupportedClient, customPath?: string) => ({
      'brave-search': {
        command: 'npx',
        args: ['@modelcontextprotocol/server-brave-search'],
        env: {
          BRAVE_API_KEY: 'your-api-key-here'
        }
      }
    })
  },
  postgres: {
    name: 'PostgreSQL MCP Server',
    description: 'Official MCP server for PostgreSQL database operations',
    generateConfig: (client?: SupportedClient, customPath?: string) => ({
      postgres: {
        command: 'npx',
        args: ['@modelcontextprotocol/server-postgres'],
        env: {
          POSTGRES_CONNECTION_STRING: 'postgresql://username:password@localhost:5432/database'
        }
      }
    })
  }
}

export function getTemplate(templateName: string): ServerTemplate | null {
  return SERVER_TEMPLATES[templateName] || null
}

export function listTemplates(): string[] {
  return Object.keys(SERVER_TEMPLATES)
}

export function getTemplateHelp(): string {
  const templates = Object.entries(SERVER_TEMPLATES)
  const maxNameLength = Math.max(...templates.map(([name]) => name.length))
  
  return templates
    .map(([name, template]) => 
      `  ${name.padEnd(maxNameLength)} - ${template.description}`
    )
    .join('\n')
}