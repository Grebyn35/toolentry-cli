import chalk from 'chalk'

let verboseMode = false
let debugMode = false

export function setVerbose(enabled: boolean): void {
  verboseMode = enabled
}

export function setDebug(enabled: boolean): void {
  debugMode = enabled
}

export const logger = {
  info: (message: string) => {
    console.log(message)
  },
  
  success: (message: string) => {
    console.log(chalk.green('✓'), message)
  },
  
  error: (message: string) => {
    console.error(chalk.red('✗'), message)
  },
  
  warn: (message: string) => {
    console.warn(chalk.yellow('⚠'), message)
  },
  
  verbose: (message: string) => {
    if (verboseMode) {
      console.log(chalk.gray('[verbose]'), message)
    }
  },
  
  debug: (message: string) => {
    if (debugMode) {
      console.log(chalk.blue('[debug]'), message)
    }
  },
  
  dim: (message: string) => {
    console.log(chalk.dim(message))
  }
}