export type Platform = 'win32' | 'darwin' | 'linux'

export type SupportedClient = 
  | 'claude-desktop'
  | 'cline'
  | 'windsurf'
  | 'roocode'
  | 'witsy'
  | 'enconvo'
  | 'cursor'
  | 'vscode'
  | 'vscode-insiders'
  | 'boltai'
  | 'amazon-bedrock'
  | 'amazonq'
  | 'librechat'
  | 'gemini-cli'

export type ConfigType = 'json' | 'yaml'

export interface ClientConfig {
  name: SupportedClient
  configType: ConfigType
  configPath: {
    win32?: string
    darwin?: string
    linux?: string
  }
}

export interface MCPServerConfig {
  command: string
  args: string[]
  env?: Record<string, string>
}

export interface MCPServersConfig {
  mcpServers: {
    [serverName: string]: MCPServerConfig
  }
}