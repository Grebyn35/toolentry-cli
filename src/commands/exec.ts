import { Command } from 'commander'
import { spawn } from 'child_process'
import { logger } from '../utils/logger.js'

export function createExecCommand(): Command {
  const command = new Command('exec')
  command
    .description('Execute system commands')
    .argument('<command>', 'Command to execute (as a single string)')
    .option('-c, --cwd <dir>', 'Working directory')
    .option('-t, --timeout <ms>', 'Timeout in milliseconds', '30000')
    .action(async (cmd: string, options) => {
      try {
        const timeout = parseInt(options.timeout)
        const cwd = options.cwd || process.cwd()

        logger.verbose(`Executing: ${cmd}`)
        logger.verbose(`Working directory: ${cwd}`)
        logger.verbose(`Timeout: ${timeout}ms`)

        const startTime = Date.now()
        
        const child = spawn(cmd, {
          shell: true,
          cwd,
          stdio: ['pipe', 'pipe', 'pipe']
        })

        let stdout = ''
        let stderr = ''
        let timedOut = false

        // Set up timeout
        const timeoutHandle = setTimeout(() => {
          timedOut = true
          if (process.platform === 'win32') {
            spawn('taskkill', ['/pid', child.pid!.toString(), '/f', '/t'])
          } else {
            child.kill('SIGTERM')
          }
        }, timeout)

        // Collect output
        child.stdout?.on('data', (data) => {
          stdout += data.toString()
        })

        child.stderr?.on('data', (data) => {
          stderr += data.toString()
        })

        // Wait for process to complete
        const exitCode = await new Promise<number>((resolve) => {
          child.on('close', (code) => {
            clearTimeout(timeoutHandle)
            resolve(code || 0)
          })
        })

        const executionTime = Date.now() - startTime

        // Output results
        const result = {
          success: !timedOut && exitCode === 0,
          exit_code: timedOut ? -1 : exitCode,
          stdout: stdout.trim(),
          stderr: stderr.trim(),
          command_line: cmd,
          execution_time: executionTime,
          timed_out: timedOut
        }

        console.log(JSON.stringify(result, null, 2))

        // Exit with same code as child process
        process.exit(timedOut ? 1 : exitCode)
        
      } catch (error) {
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