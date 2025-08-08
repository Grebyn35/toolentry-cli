import { Command } from 'commander'
import { getClientConfigPath } from '../config/clients.js'
import { readJsonFile, writeJsonFile, fileExists, ensureDir } from '../utils/file.js'
import { logger } from '../utils/logger.js'
import { SupportedClient } from '../types/index.js'
import { SUPPORTED_CLIENTS } from '../constants/index.js'

interface FlexibleMCPConfig {
  mcpServers?: Record<string, any>
  servers?: Record<string, any>
  [key: string]: any
}

function normalizeConfig(existingConfig: any): FlexibleMCPConfig {
  // Handle empty or malformed configs
  if (!existingConfig || typeof existingConfig !== 'object') {
    return { mcpServers: {} }
  }

  // If it's already properly formatted, return as-is
  if ('mcpServers' in existingConfig || 'servers' in existingConfig) {
    return existingConfig
  }

  // If it's an empty object, initialize with mcpServers
  if (Object.keys(existingConfig).length === 0) {
    return { mcpServers: {} }
  }

  // Otherwise, preserve existing structure
  return existingConfig
}

function getServersKey(config: FlexibleMCPConfig): 'mcpServers' | 'servers' {
  // Check which key exists in the config
  if ('mcpServers' in config) return 'mcpServers'
  if ('servers' in config) return 'servers'
  
  // Default to mcpServers for new configs
  return 'mcpServers'
}

function mergeServers(existingConfig: FlexibleMCPConfig, newServers: Record<string, any>): FlexibleMCPConfig {
  const normalized = normalizeConfig(existingConfig)
  const serversKey = getServersKey(normalized)
  
  // Ensure the servers object exists
  if (!normalized[serversKey]) {
    normalized[serversKey] = {}
  }
  
  // Merge new servers into existing ones (new servers override existing ones with same name)
  normalized[serversKey] = {
    ...normalized[serversKey],
    ...newServers
  }
  
  return normalized
}

export function createAutoinstallCommand(): Command {
  const command = new Command('autoinstall')
  command
    .description('Auto-install MCP server configurations to client config files')
    .argument('[client]', `Client name (${SUPPORTED_CLIENTS.join(', ')}) - optional if --path is provided`)
    .argument('<servers>', 'MCP server configuration(s) as JSON')
    .option('-p, --path <path>', 'Custom configuration file path')
    .option('-f, --force', 'Create directories if they don\'t exist')
    .option('-b, --backup', 'Create a backup of existing config before modifying')
    .action(async (client: string | undefined, serversJson: string, options) => {
      try {
        // Validate that either client or path is provided
        if (!client && !options.path) {
          logger.error('Either <client> or --path must be provided')
          logger.info(`Supported clients: ${SUPPORTED_CLIENTS.join(', ')}`)
          process.exit(1)
        }

        // Warn if both are provided
        if (client && options.path) {
          logger.warn('Both client and --path provided, using custom path')
        }

        // Parse the servers JSON
        let newServers: Record<string, any>
        try {
          const parsed = JSON.parse(serversJson)
          
          // Check if it's a single server config or multiple
          // If it has 'command' property at root, it's a single server that needs a name
          if (parsed.command) {
            logger.error('Single server config must be wrapped with a server name')
            logger.info('Example: {"my-server": {"command": "npx", "args": [...]}}')
            process.exit(1)
          }
          
          newServers = parsed
        } catch (error) {
          logger.error('Invalid JSON configuration provided')
          logger.debug(`JSON parse error: ${(error as Error).message}`)
          process.exit(1)
        }

        // Validate that we have at least one server to install
        if (Object.keys(newServers).length === 0) {
          logger.error('No servers provided in configuration')
          process.exit(1)
        }

        // Determine config path
        let configPath: string
        if (options.path) {
          configPath = options.path
        } else if (client) {
          // Validate client only if we're using it
          if (!SUPPORTED_CLIENTS.includes(client as SupportedClient)) {
            logger.error(`Unsupported client: ${client}`)
            logger.info(`Supported clients: ${SUPPORTED_CLIENTS.join(', ')}`)
            process.exit(1)
          }
          configPath = getClientConfigPath(client as SupportedClient)
        } else {
          // This should never happen due to validation above
          process.exit(1)
        }

        logger.verbose(`Target config path: ${configPath}`)

        // Read existing config if it exists
        let existingConfig: any = {}
        if (fileExists(configPath)) {
          const content = readJsonFile(configPath)
          if (content !== null) {
            existingConfig = content
            logger.verbose('Existing configuration found, will merge')
            
            // Create backup if requested
            if (options.backup) {
              const backupPath = `${configPath}.backup.${Date.now()}`
              writeJsonFile(backupPath, existingConfig)
              logger.info(`Backup created: ${backupPath}`)
            }
          }
        } else {
          logger.verbose('No existing configuration found, will create new')
          
          // Ensure directory exists if --force is specified
          if (options.force) {
            ensureDir(configPath)
          }
        }

        // Merge configurations
        const mergedConfig = mergeServers(existingConfig, newServers)
        
        // Write the merged configuration
        const success = writeJsonFile(configPath, mergedConfig)
        if (!success) {
          logger.error(`Failed to write configuration to: ${configPath}`)
          process.exit(1)
        }

        // Report what was installed
        const serverNames = Object.keys(newServers)
        const serversKey = getServersKey(mergedConfig)
        logger.success(`Successfully installed ${serverNames.length} server(s) to ${configPath}`)
        logger.info(`Installed servers: ${serverNames.join(', ')}`)
        logger.verbose(`Total servers in config: ${Object.keys(mergedConfig[serversKey] || {}).length}`)

      } catch (error) {
        logger.error(`Failed to auto-install: ${(error as Error).message}`)
        logger.debug(`Stack trace: ${(error as Error).stack}`)
        process.exit(1)
      }
    })

  return command
}