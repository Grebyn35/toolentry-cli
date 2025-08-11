import chalk from 'chalk'

let verboseMode = false
let debugMode = false

// Handle both ES module and CommonJS chalk import
const chalkInstance = (chalk as any).default || chalk

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
    console.log(chalkInstance.green('✓'), message)
  },
  
  error: (message: string) => {
    console.error(chalkInstance.red('✗'), message)
  },
  
  warn: (message: string) => {
    console.warn(chalkInstance.yellow('⚠'), message)
  },
  
  verbose: (message: string) => {
    if (verboseMode) {
      console.log(chalkInstance.gray('[verbose]'), message)
    }
  },
  
  debug: (message: string) => {
    if (debugMode) {
      console.log(chalkInstance.blue('[debug]'), message)
    }
  },
  
  dim: (message: string) => {
    console.log(chalkInstance.dim(message))
  }
}