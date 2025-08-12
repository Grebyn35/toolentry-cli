import { Command } from 'commander'
import { name, version } from '../package.json'
import { setVerbose, setDebug } from './utils/logger.js'
import { createReadCommand } from './commands/read.js'
import { createWriteCommand } from './commands/write.js'
import { createExecCommand } from './commands/exec.js'
import { createTestCommand } from './commands/test.js'
import { createAutoinstallCommand } from './commands/autoinstall.js'

const program = new Command()

// Handle version manually before Commander.js processes arguments
if (process.argv.length === 3 && (process.argv[2] === '--version' || process.argv[2] === '-V')) {
  console.log(version)
  process.exit(0)
}

program
  .name(name)
  .description('Toolentry CLI - MCP server configuration management')
  .option('-v, --verbose', 'enable verbose logging')
  .option('-d, --debug', 'enable debug logging')
  .configureHelp({
    // Override the version command to prevent conflicts
    showGlobalOptions: true
  })
  .hook('preAction', (thisCommand) => {
    const options = thisCommand.opts()
    if (options.verbose) setVerbose(true)
    if (options.debug) setDebug(true)
  })

// Disable the automatic --version and -V options that Commander.js adds
program.allowUnknownOption(false)

// Add commands
program.addCommand(createReadCommand())
program.addCommand(createWriteCommand())
program.addCommand(createExecCommand())
program.addCommand(createTestCommand())
program.addCommand(createAutoinstallCommand())

program.parse()
