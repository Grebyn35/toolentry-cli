# ToolFlow CLI - MCP Server Configuration Manager

A simple, powerful command-line tool for managing Model Context Protocol (MCP) server configurations across different AI clients like Claude Desktop, VS Code, Cursor, and more.

## What is ToolFlow CLI?

ToolFlow CLI simplifies the installation and management of **Model Context Protocol (MCP) servers** - extensions that give AI assistants access to external tools, databases, APIs, and data sources. Instead of manually editing complex JSON configuration files, use simple commands to:

- 📖 **Read** existing MCP configurations 
- ✏️ **Write** new server configurations
- ⚡ **Execute** system commands for dependencies
- 🔧 **Manage** 14+ AI clients automatically

**Perfect for developers, AI enthusiasts, and anyone working with MCP servers.**

## Installation

### Option 1: Global Install (Recommended)
Install once, use everywhere with short commands:

```bash
npm install -g @grebyn/toolflow-cli
```

Verify installation:
```bash
toolflow --version
```

### Option 2: Use with NPX (Always Latest)
No installation needed, always uses the latest version:

```bash
npx @grebyn/toolflow-cli --version
```

**Which to choose?**
- **Global Install**: Faster execution, works offline, better for frequent use and automation
- **NPX**: Always latest version, no global packages, good for occasional use

> **Note**: All examples below use `toolflow` commands, but you can replace with `npx @grebyn/toolflow-cli` if using the NPX approach.

## Quick Start

**1. Check what's currently configured:**
```bash
toolflow read claude-desktop
```

**Sample output:**
```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["@modelcontextprotocol/server-filesystem", "/path/to/allowed/files"],
      "env": {}
    }
  }
}
```

**2. Install ToolFlow MCP server:**
```bash
# First, install the package
toolflow exec npm install -g @grebyn/toolflow-mcp-server

# Then add it to Claude Desktop
toolflow write claude-desktop '{
  "mcpServers": {
    "toolflow": {
      "command": "npx",
      "args": ["@grebyn/toolflow-mcp-server"],
      "env": {
        "CLIENT": "claude-desktop"
      }
    }
  }
}'
```

**3. Test the server configuration first:**
```bash
toolflow test '{"command": "npx", "args": ["@grebyn/toolflow-mcp-server"], "env": {"CLIENT": "claude-desktop"}}'
```

**4. Restart your AI client to see the new server!**

## Commands

### Read Configuration

Read the current configuration from an AI client or custom path:

```bash
toolflow read <client>          # Use known client (auto-detect path)
toolflow read --path <file>     # Use custom path
```

**Examples:**
```bash
# Read from known clients (auto-detect config path)
toolflow read claude-desktop
toolflow read cline
toolflow read windsurf

# Read from custom paths
toolflow read --path /custom/path/config.json
toolflow read --path ~/.config/my-ai/settings.json
```

### Write Configuration

Write a new configuration to an AI client or custom path:

```bash
toolflow write <client> '<json>'        # Use known client (auto-detect path)  
toolflow write '<json>' --path <file>   # Use custom path
```

**⚠️ Warning:** This command **overwrites** the entire configuration file. Always read existing config first to preserve other servers.

**Examples:**
```bash
# Write to known clients (auto-detect config path)
toolflow write claude-desktop '{"mcpServers": {"toolflow": {"command": "npx", "args": ["@grebyn/toolflow-mcp-server"]}}}'
toolflow write cline '{"mcpServers": {}}'

# Write to custom paths
toolflow write '{"servers": {}}' --path /custom/path/config.json
toolflow write '{"config": {}}' --path ~/.config/my-ai/settings.json

# Create directories if needed
toolflow write claude-desktop '{"mcpServers": {}}' --force
```

### Execute System Commands

Run system commands for package installation or other tasks:

```bash
toolflow exec <command> [args...]
```

**Examples:**
```bash
toolflow exec npm install @grebyn/toolflow-mcp-server
toolflow exec python -m pip install some-package
toolflow exec node --version
```

**With options:**
```bash
toolflow exec npm install package-name --cwd /path/to/project --timeout 60000
```

### Test MCP Server Configuration

Test if an MCP server configuration works before installing it:

```bash
toolflow test '<config-json>' [options]
```

**Test Types:**
- `startup` - Quick test if server command can execute (default)
- `protocol` - Full MCP protocol validation with JSON-RPC
- `full` - Complete test including startup + protocol

**Examples:**
```bash
# Basic startup test
toolflow test '{"command": "npx", "args": ["@grebyn/toolflow-mcp-server"]}'

# Full protocol test with environment variables
toolflow test '{"command": "python", "args": ["-m", "mcp_server"], "env": {"API_KEY": "test"}}' --type protocol

# Custom timeout
toolflow test '{"command": "node", "args": ["server.js"]}' --timeout 30000 --type full
```

**Sample output:**
```json
{
  "success": true,
  "test_type": "startup",
  "startup_time": 1250,
  "command_output": "MCP Server started successfully",
  "recommendations": [
    "Server command executed successfully",
    "Consider running a protocol test for thorough validation"
  ]
}
```

## Supported AI Clients & Platforms

ToolFlow CLI automatically detects config paths for these popular AI clients:

| Client | Description | Platform Support |
|--------|-------------|------------------|
| `claude-desktop` | Claude Desktop app | Windows, macOS, Linux |
| `cline` | Cline VS Code extension | Cross-platform |
| `windsurf` | Windsurf AI code editor | Cross-platform |
| `cursor` | Cursor AI code editor | Windows, macOS, Linux |
| `vscode` | VS Code with MCP | Cross-platform |
| `vscode-insiders` | VS Code Insiders | Cross-platform |
| `roocode` | Roo Code extension | Cross-platform |
| `witsy` | Witsy AI assistant | Cross-platform |
| `enconvo` | Enconvo application | Cross-platform |
| `boltai` | Bolt AI | Cross-platform |
| `amazon-bedrock` | Amazon Bedrock | Cross-platform |
| `amazonq` | Amazon Q | Cross-platform |
| `librechat` | LibreChat | Cross-platform |
| `gemini-cli` | Gemini CLI | Cross-platform |

**Don't see your client?** Use the `--path` option to specify custom configuration paths.

## Global Options

- `-v, --verbose` - Enable verbose logging
- `-d, --debug` - Enable debug logging
- `--version` - Show version number
- `--help` - Show help information

## Examples

**Check what's currently configured:**
```bash
# Read from known client
toolflow read claude-desktop

# Read from custom path
toolflow read --path ~/.config/my-ai/config.json
```

**Install ToolFlow MCP server:**
```bash
# Install to known client
toolflow write claude-desktop '{
  "mcpServers": {
    "toolflow": {
      "command": "npx",
      "args": ["@grebyn/toolflow-mcp-server"],
      "env": {
        "CLIENT": "claude-desktop"
      }
    }
  }
}'

# Install to custom path
toolflow write '{"servers": {"toolflow": {...}}}' --path ~/.config/my-client/config.json
```

**Install dependencies first:**
```bash
# With global install
toolflow exec npm install -g @grebyn/toolflow-mcp-server

# With NPX
npx @grebyn/toolflow-cli exec npm install -g @grebyn/toolflow-mcp-server
```

**Read with verbose output:**
```bash
# With global install
toolflow read claude-desktop --verbose

# With NPX
npx @grebyn/toolflow-cli read claude-desktop --verbose
```

## Troubleshooting

### Common Issues

**❓ "Client not supported" error**
```bash
# Use --path instead of client name
toolflow read --path ~/.config/your-client/config.json
```

**❓ "Configuration file not found"**
```bash
# The AI client might not be installed or configured yet
# Create an empty config first
toolflow write claude-desktop '{"mcpServers": {}}' --force
```

**❓ "Permission denied" errors**
```bash
# Try with elevated permissions (admin/sudo)
sudo toolflow write claude-desktop '{"mcpServers": {}}'
```

**❓ "Invalid JSON" errors**
```bash
# Validate your JSON first at jsonlint.com
# Or use single quotes around the JSON and double quotes inside
toolflow write claude-desktop '{"mcpServers": {"test": {}}}'
```

**❓ MCP server not appearing in AI client**
- Test the server first: `toolflow test '{"command": "npx", "args": ["your-server"]}'`
- Restart your AI client completely
- Check the config was written correctly: `toolflow read claude-desktop`
- Verify the MCP server package is installed globally

### Getting Help

- Use `--verbose` flag for detailed logging
- Use `--debug` flag for troubleshooting
- Check [MCP Documentation](https://modelcontextprotocol.io) for server-specific help

## Keywords

*MCP server manager, Model Context Protocol CLI, Claude Desktop configuration, VS Code MCP setup, AI assistant tools, MCP server installation, Claude MCP config, AI client configuration, MCP JSON config, command line MCP tool, MCP server testing, MCP protocol validation*