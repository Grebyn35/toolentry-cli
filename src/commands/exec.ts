import { Command } from 'commander'
import { exec } from 'child_process'
import { logger } from '../utils/logger.js'

export function createExecCommand(): Command {
  const command = new Command('exec')
  command
    .description('Execute system commands')
    .argument('<command...>', 'Command and arguments to execute')
    .option('-c, --cwd <dir>', 'Working directory')
    .option('-t, --timeout <ms>', 'Timeout in milliseconds', '30000')
    .allowUnknownOption(true) // Allow options like --version to pass through to executed commands
    .action(async (cmdArgs: string[], options) => {
      try {
        const timeout = parseInt(options.timeout)
        const cwd = options.cwd || process.cwd()
        
        // Simple: just join the arguments to create the shell command
        const cmd = cmdArgs.join(' ')

        logger.verbose(`Executing: ${cmd}`)
        logger.verbose(`Working directory: ${cwd}`)
        logger.verbose(`Timeout: ${timeout}ms`)

        const startTime = Date.now()
        
        // Use Node.js exec - much simpler and cross-platform
        exec(cmd, {
          cwd,
          timeout,
          maxBuffer: 1024 * 1024, // 1MB buffer
          killSignal: 'SIGTERM'
        }, (error, stdout, stderr) => {
          const executionTime = Date.now() - startTime
          const timedOut = error?.signal === 'SIGTERM' && error?.code === null
          
          const result = {
            success: !error,
            exit_code: error?.code || 0,
            stdout: stdout.trim(),
            stderr: stderr.trim(),
            command_line: cmd,
            execution_time: executionTime,
            timed_out: timedOut
          }

          console.log(JSON.stringify(result, null, 2))

          // Exit with same code as child process
          process.exit(error?.code || 0)
        })
        
      } catch (error) {
        const cmd = cmdArgs.join(' ')
        const result = {
          success: false,
          exit_code: 1,
          stdout: '',
          stderr: (error as Error).message,
          command_line: cmd,
          execution_time: 0,
          timed_out: false
        }

        console.log(JSON.stringify(result, null, 2))
        logger.error(`Failed to execute command: ${(error as Error).message}`)
        logger.debug(`Stack trace: ${(error as Error).stack}`)
        process.exit(1)
      }
    })

  return command
}