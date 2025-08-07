import { homedir } from 'os'
import { join } from 'path'
import { Platform } from '../types/index.js'

export function getPlatform(): Platform {
  const platform = process.platform
  if (platform !== 'win32' && platform !== 'darwin' && platform !== 'linux') {
    throw new Error(`Unsupported platform: ${platform}`)
  }
  return platform as Platform
}

export function getHomeDir(): string {
  return homedir()
}

export function getBaseConfigDir(): string {
  const platform = getPlatform()
  const home = getHomeDir()
  
  switch (platform) {
    case 'win32':
      return process.env.APPDATA || join(home, 'AppData', 'Roaming')
    case 'darwin':
      return join(home, 'Library', 'Application Support')
    case 'linux':
      return process.env.XDG_CONFIG_HOME || join(home, '.config')
  }
}

export function getVSCodeStorageDir(): string {
  const platform = getPlatform()
  const baseDir = getBaseConfigDir()
  
  switch (platform) {
    case 'win32':
    case 'darwin':
      return join(baseDir, 'Code', 'User', 'globalStorage')
    case 'linux':
      return join(baseDir, 'Code', 'User', 'globalStorage')
  }
}

export function getVSCodeInsidersStorageDir(): string {
  const platform = getPlatform()
  const baseDir = getBaseConfigDir()
  
  switch (platform) {
    case 'win32':
    case 'darwin':
      return join(baseDir, 'Code - Insiders', 'User', 'globalStorage')
    case 'linux':
      return join(baseDir, 'Code - Insiders', 'User', 'globalStorage')
  }
}