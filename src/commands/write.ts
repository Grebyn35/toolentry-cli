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
    .argument('<args...>', 'Arguments: either "<client> <config>" or "<config>" when using --path')
    .option('-p, --path <path>', 'Custom configuration file path')
    .option('-f, --force', 'Create directories if they don\'t exist')
    .action(async (args: string[], options) => {
      try {
        let client: string | undefined
        let configContent: string

        // Parse arguments based on whether --path is provided
        if (options.path) {
          // With --path: only config needed
          if (args.length !== 1) {
            logger.error('When using --path, provide only the config JSON')
            logger.info('Usage: write <config> --path <file>')
            logger.info('Example: write \'{"servers": {}}\' --path ~/.config/claude/config.json')
            process.exit(1)
          }
          configContent = args[0]
          client = undefined
        } else {
          // Without --path: client + config needed
          if (args.length !== 2) {
            logger.error('Without --path, provide both client name and config JSON')
            logger.info('Usage: write <client> <config>')
            logger.info(`Supported clients: ${SUPPORTED_CLIENTS.join(', ')}`)
            logger.info('Example: write claude-desktop \'{"servers": {}}\'')
            process.exit(1)
          }
          client = args[0]
          configContent = args[1]
          
          // Validate client
          if (!SUPPORTED_CLIENTS.includes(client as SupportedClient)) {
            logger.error(`Unsupported client: ${client}`)
            logger.info(`Supported clients: ${SUPPORTED_CLIENTS.join(', ')}`)
            process.exit(1)
          }
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
        } else {
          // Client is guaranteed to be valid at this point
          configPath = getClientConfigPath(client as SupportedClient)
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