import { ClientConfig, SupportedClient } from '../types/index.js'
import { join } from 'path'
import { 
  getHomeDir, 
  getBaseConfigDir, 
  getVSCodeStorageDir, 
  getVSCodeInsidersStorageDir,
  getPlatform 
} from '../utils/platform.js'
import { ClientNotFoundError } from '../types/errors.js'

function getClientConfigs(): ClientConfig[] {
  return [
    {
      name: 'claude-desktop',
      configType: 'json',
      configPath: {
        win32: join(getBaseConfigDir(), 'Claude', 'claude_desktop_config.json'),
        darwin: join(getBaseConfigDir(), 'Claude', 'claude_desktop_config.json'),
        linux: join(getBaseConfigDir(), 'Claude', 'claude_desktop_config.json')
      }
    },
    {
      name: 'cline',
      configType: 'json',
      configPath: {
        win32: join(getVSCodeStorageDir(), 'saoudrizwan.claude-dev', 'settings', 'cline_mcp_settings.json'),
        darwin: join(getVSCodeStorageDir(), 'saoudrizwan.claude-dev', 'settings', 'cline_mcp_settings.json'),
        linux: join(getVSCodeStorageDir(), 'saoudrizwan.claude-dev', 'settings', 'cline_mcp_settings.json')
      }
    },
    {
      name: 'windsurf',
      configType: 'json',
      configPath: {
        win32: join(getHomeDir(), '.codeium', 'windsurf', 'mcp_config.json'),
        darwin: join(getHomeDir(), '.codeium', 'windsurf', 'mcp_config.json'),
        linux: join(getHomeDir(), '.codeium', 'windsurf', 'mcp_config.json')
      }
    },
    {
      name: 'roocode',
      configType: 'json',
      configPath: {
        win32: join(getVSCodeStorageDir(), 'rooveterinaryinc.roo-cline', 'settings', 'cline_mcp_settings.json'),
        darwin: join(getVSCodeStorageDir(), 'rooveterinaryinc.roo-cline', 'settings', 'cline_mcp_settings.json'),
        linux: join(getVSCodeStorageDir(), 'rooveterinaryinc.roo-cline', 'settings', 'cline_mcp_settings.json')
      }
    },
    {
      name: 'witsy',
      configType: 'json',
      configPath: {
        win32: join(getBaseConfigDir(), 'witsy', 'config.json'),
        darwin: join(getBaseConfigDir(), 'witsy', 'config.json'),
        linux: join(getBaseConfigDir(), 'witsy', 'config.json')
      }
    },
    {
      name: 'enconvo',
      configType: 'json',
      configPath: {
        win32: join(getBaseConfigDir(), 'enconvo', 'config.json'),
        darwin: join(getBaseConfigDir(), 'enconvo', 'config.json'),
        linux: join(getBaseConfigDir(), 'enconvo', 'config.json')
      }
    },
    {
      name: 'cursor',
      configType: 'json',
      configPath: {
        win32: join(getBaseConfigDir(), 'Cursor', 'User', 'globalStorage', 'mcp-servers', 'config.json'),
        darwin: join(getBaseConfigDir(), 'Cursor', 'User', 'globalStorage', 'mcp-servers', 'config.json'),
        linux: join(getBaseConfigDir(), 'Cursor', 'User', 'globalStorage', 'mcp-servers', 'config.json')
      }
    },
    {
      name: 'vscode',
      configType: 'json',
      configPath: {
        win32: join(getVSCodeStorageDir(), 'mcp', 'mcp.json'),
        darwin: join(getVSCodeStorageDir(), 'mcp', 'mcp.json'),
        linux: join(getVSCodeStorageDir(), 'mcp', 'mcp.json')
      }
    },
    {
      name: 'vscode-insiders',
      configType: 'json',
      configPath: {
        win32: join(getVSCodeInsidersStorageDir(), 'mcp', 'mcp.json'),
        darwin: join(getVSCodeInsidersStorageDir(), 'mcp', 'mcp.json'),
        linux: join(getVSCodeInsidersStorageDir(), 'mcp', 'mcp.json')
      }
    },
    {
      name: 'boltai',
      configType: 'json',
      configPath: {
        win32: join(getBaseConfigDir(), 'boltai', 'config.json'),
        darwin: join(getBaseConfigDir(), 'boltai', 'config.json'),
        linux: join(getBaseConfigDir(), 'boltai', 'config.json')
      }
    },
    {
      name: 'amazon-bedrock',
      configType: 'json',
      configPath: {
        win32: join(getHomeDir(), '.aws', 'mcp', 'bedrock-config.json'),
        darwin: join(getHomeDir(), '.aws', 'mcp', 'bedrock-config.json'),
        linux: join(getHomeDir(), '.aws', 'mcp', 'bedrock-config.json')
      }
    },
    {
      name: 'amazonq',
      configType: 'json',
      configPath: {
        win32: join(getVSCodeStorageDir(), 'amazonq', 'mcp-config.json'),
        darwin: join(getVSCodeStorageDir(), 'amazonq', 'mcp-config.json'),
        linux: join(getVSCodeStorageDir(), 'amazonq', 'mcp-config.json')
      }
    },
    {
      name: 'librechat',
      configType: 'json',
      configPath: {
        win32: join(getBaseConfigDir(), 'librechat', 'mcp-config.json'),
        darwin: join(getBaseConfigDir(), 'librechat', 'mcp-config.json'),
        linux: join(getBaseConfigDir(), 'librechat', 'mcp-config.json')
      }
    },
    {
      name: 'gemini-cli',
      configType: 'json',
      configPath: {
        win32: join(getHomeDir(), '.gemini', 'mcp-config.json'),
        darwin: join(getHomeDir(), '.gemini', 'mcp-config.json'),
        linux: join(getHomeDir(), '.gemini', 'mcp-config.json')
      }
    }
  ]
}

export function getClientConfig(client: SupportedClient): ClientConfig {
  const configs = getClientConfigs()
  const config = configs.find(c => c.name === client)
  if (!config) {
    throw new ClientNotFoundError(client)
  }
  return config
}

export function getClientConfigPath(client: SupportedClient): string {
  const config = getClientConfig(client)
  const platform = getPlatform()
  const path = config.configPath[platform]
  
  if (!path) {
    throw new Error(`No configuration path defined for ${client} on ${platform}`)
  }
  
  return path
}

export function getAllClients(): SupportedClient[] {
  const configs = getClientConfigs()
  return configs.map(c => c.name)
}