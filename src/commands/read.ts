import { Command } from 'commander'
import { getClientConfigPath } from '../config/clients.js'
import { readJsonFile, fileExists } from '../utils/file.js'
import { logger } from '../utils/logger.js'
import { SupportedClient } from '../types/index.js'
import { SUPPORTED_CLIENTS } from '../constants/index.js'

export function createReadCommand(): Command {
  const command = new Command('read')
  command
    .description('Read configuration file for specified client or custom path')
    .argument('[client]', `Client name (${SUPPORTED_CLIENTS.join(', ')}) - optional if --path is provided`)
    .option('-p, --path <path>', 'Custom configuration file path')
    .action(async (client: string | undefined, options) => {
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
        
        logger.verbose(`Reading config from: ${configPath}`)

        // Check if file exists
        if (!fileExists(configPath)) {
          logger.error(`Configuration file not found: ${configPath}`)
          process.exit(1)
        }

        // Read and output the config
        const config = readJsonFile(configPath)
        if (config === null) {
          logger.error(`Failed to read configuration file: ${configPath}`)
          process.exit(1)
        }

        // Output as JSON to stdout
        console.log(JSON.stringify(config, null, 2))
        
      } catch (error) {
        logger.error(`Failed to read config: ${(error as Error).message}`)
        logger.debug(`Stack trace: ${(error as Error).stack}`)
        process.exit(1)
      }
    })

  return command
}