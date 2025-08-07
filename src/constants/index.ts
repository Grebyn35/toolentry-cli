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

export const TOOLFLOW_MCP_CONFIG = {
  command: 'npx',
  args: ['@grebyn/toolflow-mcp-server'],
  env: {
    CLIENT: 'AI-CLIENT'
  }
}

export const TOOLFLOW_SERVER_NAME = 'toolflow'