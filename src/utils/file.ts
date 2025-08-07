import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs'
import { dirname } from 'path'
import { logger } from './logger.js'

export function ensureDir(filePath: string): void {
  const dir = dirname(filePath)
  if (!existsSync(dir)) {
    logger.verbose(`Creating directory: ${dir}`)
    mkdirSync(dir, { recursive: true })
  }
}

export function fileExists(filePath: string): boolean {
  return existsSync(filePath)
}

export function readJsonFile<T = any>(filePath: string): T | null {
  try {
    if (!fileExists(filePath)) {
      logger.verbose(`File does not exist: ${filePath}`)
      return null
    }
    
    const content = readFileSync(filePath, 'utf-8')
    return JSON.parse(content) as T
  } catch (error) {
    logger.error(`Failed to read JSON file: ${filePath}`)
    logger.debug(`Error: ${error}`)
    return null
  }
}

export function writeJsonFile(filePath: string, data: any): boolean {
  try {
    ensureDir(filePath)
    const content = JSON.stringify(data, null, 2)
    writeFileSync(filePath, content, 'utf-8')
    logger.verbose(`Successfully wrote to: ${filePath}`)
    return true
  } catch (error) {
    logger.error(`Failed to write JSON file: ${filePath}`)
    logger.debug(`Error: ${error}`)
    return false
  }
}

export function mergeJsonFile(filePath: string, newData: any): boolean {
  try {
    const existing = readJsonFile(filePath) || {}
    const merged = deepMerge(existing, newData)
    return writeJsonFile(filePath, merged)
  } catch (error) {
    logger.error(`Failed to merge JSON file: ${filePath}`)
    logger.debug(`Error: ${error}`)
    return false
  }
}

function deepMerge(target: any, source: any): any {
  const output = { ...target }
  
  for (const key in source) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      if (key in target && target[key] && typeof target[key] === 'object' && !Array.isArray(target[key])) {
        output[key] = deepMerge(target[key], source[key])
      } else {
        output[key] = source[key]
      }
    } else {
      output[key] = source[key]
    }
  }
  
  return output
}