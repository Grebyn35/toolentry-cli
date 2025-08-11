import { Command } from 'commander'
import { getClientConfigPath } from '../config/clients.js'
import { writeJsonFile, ensureDir, fileExists, readJsonFile } from '../utils/file.js'
import { logger } from '../utils/logger.js'
import { SupportedClient } from '../types/index.js'
import { SUPPORTED_CLIENTS } from '../constants/index.js'

export function createWriteCommand(): Command {
  const command = new Command('write')
  command
    .description('Write configuration file for specified client or custom path')
    .argument('[client]', `Client name (${SUPPORTED_CLIENTS.join(', ')}) - optional if --path is provided`)
    .argument('<config>', 'Configuration JSON content')
    .option('-p, --path <path>', 'Custom configuration file path')
    .option('-f, --force', 'Create directories if they don\'t exist')
    .action(async (client: string | undefined, configContent: string, options) => {
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

        // Parse JSON config
        let config
        try {
          config = JSON.parse(configContent)
        } catch (error) {
          logger.error('Invalid JSON configuration provided')
          logger.debug(`JSON parse error: ${(error as Error).message}`)
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
          // This should never happen due to validation above, but TypeScript needs it
          process.exit(1)
        }
        
        logger.verbose(`Writing config to: ${configPath}`)

        // Ensure directory exists if --force is specified
        if (options.force) {
          ensureDir(configPath)
        }

        // Create backup if config file already exists
        if (fileExists(configPath)) {
          const existingConfig = readJsonFile(configPath)
          if (existingConfig !== null) {
            const backupPath = `${configPath}.backup.${Date.now()}`
            writeJsonFile(backupPath, existingConfig)
            logger.info(`Backup created: ${backupPath}`)
          }
        }

        // Write the configuration
        const success = writeJsonFile(configPath, config)
        if (!success) {
          logger.error(`Failed to write configuration file: ${configPath}`)
          process.exit(1)
        }

        logger.success(`Configuration written successfully to: ${configPath}`)
        
      } catch (error) {
        logger.error(`Failed to write config: ${(error as Error).message}`)
        logger.debug(`Stack trace: ${(error as Error).stack}`)
        process.exit(1)
      }
    })

  return command
}