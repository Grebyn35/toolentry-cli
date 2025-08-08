import { Command } from 'commander'
import { name, version } from '../package.json'
import { setVerbose, setDebug } from './utils/logger.js'
import { createReadCommand } from './commands/read.js'
import { createWriteCommand } from './commands/write.js'
import { createExecCommand } from './commands/exec.js'
import { createTestCommand } from './commands/test.js'
import { createAutoinstallCommand } from './commands/autoinstall.js'

const program = new Command()

program
  .name(name)
  .version(version)
  .description('ToolFlow CLI - MCP server configuration management')
  .option('-v, --verbose', 'enable verbose logging')
  .option('-d, --debug', 'enable debug logging')
  .hook('preAction', (thisCommand) => {
    const options = thisCommand.opts()
    if (options.verbose) setVerbose(true)
    if (options.debug) setDebug(true)
  })

// Add commands
program.addCommand(createReadCommand())
program.addCommand(createWriteCommand())
program.addCommand(createExecCommand())
program.addCommand(createTestCommand())
program.addCommand(createAutoinstallCommand())

program.parse()
