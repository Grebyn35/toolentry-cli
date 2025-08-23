import { Command } from 'commander'
import { getClientConfigPath } from '../config/clients.js'
import { readJsonFile, writeJsonFile, fileExists, ensureDir } from '../utils/file.js'
import { logger } from '../utils/logger.js'
import { SupportedClient } from '../types/index.js'
import { SUPPORTED_CLIENTS } from '../constants/index.js'
import { getTemplate, listTemplates, getTemplateHelp } from '../templates/servers.js'

function decodeBase64Json(encoded: string): any {
  try {
    const decoded = Buffer.from(encoded, 'base64').toString('utf-8')
    return JSON.parse(decoded)
  } catch (error) {
    logger.error('Invalid base64 encoding or JSON structure')
    logger.debug(`Error: ${(error as Error).message}`)
    throw error
  }
}

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
    .option('-t, --template <name>', 'Use a built-in server template (use --list-templates to see available)')
    .option('-j, --json-base64 <encoded>', 'Base64-encoded JSON configuration for cross-platform compatibility')
    .option('-l, --list-templates', 'List available server templates')
    .option('-p, --path <path>', 'Custom configuration file path')
    .option('-f, --force', 'Create directories if they don\'t exist')
    .action(async (client: string | undefined, options) => {
      try {
        // Handle --list-templates option
        if (options.listTemplates) {
          console.log('Available server templates:\n')
          console.log(getTemplateHelp())
          console.log('\nUsage: toolentry autoinstall <client> --template <name>')
          console.log('Example: toolentry autoinstall claude-desktop --template toolentry')
          return
        }

        // Validate that either client or path is provided
        if (!client && !options.path) {
          logger.error('Either <client> or --path must be provided')
          logger.info(`Supported clients: ${SUPPORTED_CLIENTS.join(', ')}`)
          process.exit(1)
        }

        // Validate that either template or json-base64 is provided
        if (!options.template && !options.jsonBase64) {
          logger.error('Either --template <name> or --json-base64 <encoded> must be provided')
          logger.info('Use --list-templates to see available templates')
          logger.info('Example: toolentry autoinstall claude-desktop --template toolentry')
          process.exit(1)
        }

        // Validate that both template and json-base64 are not provided
        if (options.template && options.jsonBase64) {
          logger.error('Cannot use both --template and --json-base64')
          logger.info('Use either --template <name> OR --json-base64 <encoded>')
          process.exit(1)
        }

        // Warn if both client and path are provided
        if (client && options.path) {
          logger.warn('Both client and --path provided, using custom path')
        }

        // Generate server configuration
        let newServers: Record<string, any>
        
        if (options.template) {
          // Use template
          const template = getTemplate(options.template)
          if (!template) {
            logger.error(`Template '${options.template}' not found`)
            logger.info(`Available templates: ${listTemplates().join(', ')}`)
            logger.info('Use --list-templates for detailed information')
            process.exit(1)
          }
          
          const targetClient = client as SupportedClient | undefined
          newServers = template.generateConfig(targetClient, options.path)
          logger.verbose(`Using template '${options.template}': ${template.description}`)
          
        } else if (options.jsonBase64) {
          // Decode base64 JSON
          try {
            newServers = decodeBase64Json(options.jsonBase64)
            
            // Check if it's a single server config or multiple
            if (newServers.command) {
              logger.error('Single server config must be wrapped with a server name')
              logger.info('Example: {"my-server": {"command": "npx", "args": [...]}}')
              process.exit(1)
            }
            
            logger.verbose('Using base64-encoded JSON configuration')
          } catch (error) {
            process.exit(1)
          }
        } else {
          // This should never happen due to validation above
          logger.error('No configuration source provided')
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
            
            // Always create backup of existing config
            const backupPath = `${configPath}.backup.${Date.now()}`
            writeJsonFile(backupPath, existingConfig)
            logger.info(`Backup created: ${backupPath}`)
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