import { SupportedClient } from '../types/index.js'

export const SUPPORTED_CLIENTS: SupportedClient[] = [
  'claude-desktop',
  'cline',
  'windsurf',
  'roocode',
  'witsy',
  'enconvo',
  'cursor',
  'vscode',
  'vscode-insiders',
  'boltai',
  'amazon-bedrock',
  'amazonq',
  'librechat',
  'gemini-cli'
]

export const TOOLENTRY_MCP_CONFIG = {
  command: 'npx',
  args: ['@toolentry.io/toolentry-mcp-server'],
  env: {
    CLIENT: 'AI-CLIENT'
  }
}

export const TOOLENTRY_SERVER_NAME = 'toolentry'