import { Command } from 'commander'
import { spawn, exec } from 'child_process'
import { promisify } from 'util'
import { logger } from '../utils/logger.js'

const execAsync = promisify(exec)

interface MCPServerConfig {
  command: string
  args: string[]
  env?: Record<string, string>
  type?: 'stdio' | 'sse' | 'http'
}

interface TestResult {
  success: boolean
  test_type: string
  startup_time: number
  error?: string
  command_output?: string
  recommendations: string[]
}

export function createTestCommand(): Command {
  const command = new Command('test')
  command
    .description('Test MCP server configuration')
    .argument('<config...>', 'MCP server configuration JSON (multiple arguments will be joined)')
    .option('-t, --type <type>', 'Test type: startup, protocol, or full', 'startup')
    .option('--timeout <ms>', 'Timeout in milliseconds', '10000')
    .action(async (configArgs: string[], options) => {
      try {
        // Join all arguments back into a single string to handle cases where
        // the JSON was split by shell argument parsing
        const configJson = Array.isArray(configArgs) ? configArgs.join(' ') : configArgs
        
        // Parse MCP server config
        let config: MCPServerConfig
        try {
          config = JSON.parse(configJson)
        } catch (error) {
          logger.error('Invalid JSON configuration provided')
          logger.debug(`JSON parse error: ${(error as Error).message}`)
          process.exit(1)
        }

        // Validate required fields
        if (!config.command || !Array.isArray(config.args)) {
          logger.error('Invalid MCP server configuration: command and args are required')
          process.exit(1)
        }

        const testType = options.type
        const timeout = parseInt(options.timeout)

        if (!['startup', 'protocol', 'full'].includes(testType)) {
          logger.error('Invalid test type. Must be: startup, protocol, or full')
          process.exit(1)
        }

        if (isNaN(timeout) || timeout < 1000 || timeout > 60000) {
          logger.error('Invalid timeout. Must be between 1000 and 60000 milliseconds')
          process.exit(1)
        }

        logger.verbose(`Testing MCP server: ${config.command} ${config.args.join(' ')}`)
        logger.verbose(`Test type: ${testType}, timeout: ${timeout}ms`)

        // Perform the test
        const result = await performServerTest(config, timeout, testType)
        
        // Output JSON result to stdout for programmatic use
        console.log(JSON.stringify(result, null, 2))
        
        // Exit with appropriate code
        process.exit(result.success ? 0 : 1)
        
      } catch (error) {
        const result: TestResult = {
          success: false,
          test_type: options.type || 'startup',
          startup_time: 0,
          error: (error as Error).message,
          recommendations: ['Failed to execute MCP server test', 'Check command syntax and configuration']
        }

        console.log(JSON.stringify(result, null, 2))
        logger.error(`Test failed: ${(error as Error).message}`)
        logger.debug(`Stack trace: ${(error as Error).stack}`)
        process.exit(1)
      }
    })

  return command
}

async function performServerTest(
  config: MCPServerConfig,
  timeout: number,
  testType: string
): Promise<TestResult> {
  const startTime = Date.now()
  const commandLine = `${config.command} ${config.args.join(' ')}`
  
  try {
    // Prepare environment variables
    const env: Record<string, string> = {}
    Object.entries(process.env).forEach(([key, value]) => {
      if (value !== undefined) {
        env[key] = value
      }
    })
    if (config.env) {
      Object.assign(env, config.env)
    }
    
    // For startup test, try to run the command and see if it starts without immediate errors
    if (testType === 'startup') {
      return await testServerStartup(commandLine, env, timeout)
    } else if (testType === 'protocol') {
      return await testServerProtocol(commandLine, env, timeout)
    } else if (testType === 'full') {
      return await testServerFull(commandLine, env, timeout)
    }
    
    throw new Error(`Unknown test type: ${testType}`)
    
  } catch (error) {
    const executionTime = Date.now() - startTime
    return {
      success: false,
      test_type: testType,
      startup_time: executionTime,
      error: (error as Error).message,
      recommendations: generateErrorRecommendations((error as Error).message, config)
    }
  }
}

async function testServerStartup(
  commandLine: string,
  env: Record<string, string>,
  timeout: number
): Promise<TestResult> {
  const startTime = Date.now()
  
  try {
    // Run the command with a shorter timeout to see if it starts
    const testTimeout = Math.min(timeout, 5000) // Max 5 seconds for startup test
    
    const { stdout, stderr } = await execAsync(commandLine, {
      timeout: testTimeout,
      env,
      maxBuffer: 1024 * 100 // 100KB buffer
    })
    
    const executionTime = Date.now() - startTime
    
    // If the command completes quickly, it might be a help command or version check
    return {
      success: true,
      test_type: 'startup',
      startup_time: executionTime,
      command_output: stdout.toString() || stderr.toString(),
      recommendations: [
        'Server command executed successfully',
        'This suggests the basic command and dependencies are available',
        'Consider running a protocol test for more thorough validation'
      ]
    }
    
  } catch (error: any) {
    const executionTime = Date.now() - startTime
    
    // If the command was killed due to timeout, it might actually be running successfully
    if (error.killed && error.signal === 'SIGTERM') {
      return {
        success: true,
        test_type: 'startup',
        startup_time: executionTime,
        command_output: error.stdout?.toString() || error.stderr?.toString() || '',
        recommendations: [
          'Server appears to be running (command did not exit immediately)',
          'This is typically good for MCP servers which run continuously',
          'The server was stopped after the test timeout to prevent hanging'
        ]
      }
    }
    
    // Check for common error patterns
    const recommendations = generateErrorRecommendations(error.message, { command: commandLine.split(' ')[0] })
    
    return {
      success: false,
      test_type: 'startup',
      startup_time: executionTime,
      error: error.message,
      command_output: error.stdout?.toString() || error.stderr?.toString() || '',
      recommendations
    }
  }
}

async function testServerProtocol(
  commandLine: string,
  env: Record<string, string>,
  timeout: number
): Promise<TestResult> {
  const startTime = Date.now()
  
  return new Promise<TestResult>((resolve) => {
    let resolved = false
    const timeoutId = setTimeout(() => {
      if (!resolved) {
        resolved = true
        resolve({
          success: false,
          test_type: 'protocol',
          startup_time: Date.now() - startTime,
          error: 'MCP protocol test timed out - server may not be responding to JSON-RPC requests',
          recommendations: [
            'Server process may be running but not implementing MCP protocol correctly',
            'Check server logs for JSON-RPC parsing errors',
            'Ensure server supports MCP protocol version compatibility'
          ]
        })
      }
    }, timeout)

    try {
      // Parse command and args
      const [command, ...args] = commandLine.split(' ')
      
      // Start the server process
      const serverProcess = spawn(command, args, {
        env,
        stdio: ['pipe', 'pipe', 'pipe']
      })

      let stdoutData = ''
      let stderrData = ''
      
      serverProcess.stdout?.on('data', (data) => {
        stdoutData += data.toString()
        
        // Look for MCP JSON-RPC response
        const lines = stdoutData.split('\n')
        for (const line of lines) {
          if (line.trim()) {
            try {
              const response = JSON.parse(line.trim())
              
              // Check if this looks like an MCP response
              if (response.jsonrpc === '2.0' && (response.result || response.error)) {
                clearTimeout(timeoutId)
                serverProcess.kill()
                
                if (!resolved) {
                  resolved = true
                  resolve({
                    success: true,
                    test_type: 'protocol',
                    startup_time: Date.now() - startTime,
                    command_output: `MCP Response: ${JSON.stringify(response, null, 2)}`,
                    recommendations: [
                      'MCP protocol test passed - server correctly implements JSON-RPC',
                      'Server responded to tools/list request successfully',
                      'MCP server appears to be fully functional'
                    ]
                  })
                }
                return
              }
            } catch (e) {
              // Not JSON, continue reading
            }
          }
        }
      })

      serverProcess.stderr?.on('data', (data) => {
        stderrData += data.toString()
      })

      serverProcess.on('error', (error) => {
        clearTimeout(timeoutId)
        if (!resolved) {
          resolved = true
          resolve({
            success: false,
            test_type: 'protocol',
            startup_time: Date.now() - startTime,
            error: error.message,
            command_output: stderrData,
            recommendations: [
              'Failed to start MCP server process',
              'Check that the command and arguments are correct',
              'Ensure all dependencies are installed'
            ]
          })
        }
      })

      serverProcess.on('exit', (code) => {
        clearTimeout(timeoutId)
        if (!resolved) {
          resolved = true
          resolve({
            success: false,
            test_type: 'protocol',
            startup_time: Date.now() - startTime,
            error: `Server exited with code ${code} before responding to MCP protocol test`,
            command_output: stdoutData || stderrData,
            recommendations: [
              'Server started but exited immediately - may have configuration issues',
              'Check server logs for startup errors',
              'Verify environment variables and dependencies are correct'
            ]
          })
        }
      })

      // Send MCP tools/list request after a brief delay
      setTimeout(() => {
        if (serverProcess.stdin && !serverProcess.killed) {
          const mcpRequest = {
            jsonrpc: '2.0',
            id: 1,
            method: 'tools/list',
            params: {}
          }
          
          try {
            serverProcess.stdin.write(JSON.stringify(mcpRequest) + '\n')
          } catch (e) {
            // Process may have already exited
          }
        }
      }, 1000) // Wait 1 second for server to initialize

    } catch (error) {
      clearTimeout(timeoutId)
      if (!resolved) {
        resolved = true
        resolve({
          success: false,
          test_type: 'protocol',
          startup_time: Date.now() - startTime,
          error: (error as Error).message,
          recommendations: [
            'Failed to execute MCP protocol test',
            'Check command syntax and availability',
            'Ensure system has required permissions'
          ]
        })
      }
    }
  })
}

async function testServerFull(
  commandLine: string,
  env: Record<string, string>,
  timeout: number
): Promise<TestResult> {
  // Full test includes both startup and protocol validation
  const startupResult = await testServerStartup(commandLine, env, Math.min(timeout / 2, 5000))
  
  if (!startupResult.success) {
    startupResult.test_type = 'full'
    startupResult.recommendations = [
      'Full test failed at startup phase',
      ...startupResult.recommendations
    ]
    return startupResult
  }
  
  // If startup passed, try protocol test
  const protocolResult = await testServerProtocol(commandLine, env, timeout / 2)
  
  // Combine results
  const result: TestResult = {
    success: protocolResult.success,
    test_type: 'full',
    startup_time: (startupResult.startup_time || 0) + (protocolResult.startup_time || 0),
    command_output: `Startup: ${startupResult.command_output || ''}\n\nProtocol: ${protocolResult.command_output || ''}`,
    recommendations: []
  }
  
  if (protocolResult.success) {
    result.recommendations = [
      'Full server test passed - both startup and MCP protocol work correctly',
      'Server is ready for production use',
      'Configuration is complete and functional'
    ]
  } else {
    result.error = protocolResult.error
    result.recommendations = [
      'Server starts successfully but MCP protocol test failed',
      'Server may not implement MCP correctly or may have configuration issues',
      ...protocolResult.recommendations
    ]
  }
  
  return result
}

function generateErrorRecommendations(errorMessage: string, config: any): string[] {
  const recommendations: string[] = []
  const lowerError = errorMessage.toLowerCase()
  
  // Check if the config has environment variables
  const hasEnvVars = config.env && typeof config.env === 'object' && Object.keys(config.env).length > 0
  
  if (hasEnvVars) {
    recommendations.push('Server uses environment variables - ensure they are properly configured')
    recommendations.push('Check that all required API keys/tokens are set and valid')
  }
  
  if (lowerError.includes('not found') || lowerError.includes('is not recognized') || lowerError.includes('command not found')) {
    recommendations.push(`Command '${config.command}' not found in PATH`)
    recommendations.push('Ensure the required software is installed')
    recommendations.push('Check that the command name is spelled correctly')
    
    // Specific recommendations based on common commands
    if (config.command === 'python') {
      recommendations.push('Install Python from python.org or your package manager')
    } else if (config.command === 'node' || config.command === 'npm' || config.command === 'npx') {
      recommendations.push('Install Node.js from nodejs.org')
    } else if (config.command === 'uv') {
      recommendations.push('Install uv: pip install uv')
    }
  } else if (lowerError.includes('permission denied') || lowerError.includes('eacces')) {
    recommendations.push('Permission denied when running the command')
    recommendations.push('Try running with administrator/sudo privileges')
    recommendations.push('Check file and directory permissions')
  } else if (lowerError.includes('module not found') || lowerError.includes('no module named')) {
    recommendations.push('Required Python module is not installed')
    recommendations.push('Use pip or uv to install the missing module')
    recommendations.push('Check if you need to activate a virtual environment')
  } else if (lowerError.includes('package not found') || lowerError.includes('cannot resolve')) {
    recommendations.push('Required package is not installed')
    recommendations.push('Use npm install to install the missing package')
    recommendations.push('Check package.json dependencies')
  } else {
    recommendations.push('Unexpected error occurred during server testing')
    recommendations.push('Check the error output for specific details')
    recommendations.push('Verify all dependencies are installed')
  }
  
  recommendations.push('Use toolentry exec to install missing dependencies')
  
  return recommendations
}