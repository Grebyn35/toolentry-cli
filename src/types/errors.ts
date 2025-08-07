export class ToolflowError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ToolflowError'
  }
}

export class ClientNotFoundError extends ToolflowError {
  constructor(client: string) {
    super(`Client '${client}' is not supported. Run 'toolflow list clients' to see available clients.`)
    this.name = 'ClientNotFoundError'
  }
}

export class ConfigFileError extends ToolflowError {
  constructor(filePath: string, action: 'read' | 'write') {
    super(`Failed to ${action} configuration file: ${filePath}`)
    this.name = 'ConfigFileError'
  }
}

export class PlatformError extends ToolflowError {
  constructor(platform: string) {
    super(`Platform '${platform}' is not supported. Supported platforms: win32, darwin, linux`)
    this.name = 'PlatformError'
  }
}

export class PermissionError extends ToolflowError {
  constructor(filePath: string) {
    super(`Permission denied: Cannot access ${filePath}. Try running with administrator/sudo privileges.`)
    this.name = 'PermissionError'
  }
}

export class ClientNotInstalledError extends ToolflowError {
  constructor(client: string) {
    super(`${client} does not appear to be installed on this system.`)
    this.name = 'ClientNotInstalledError'
  }
}