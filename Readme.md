# ToolFlow CLI - MCP Server Configuration Manager

A powerful CLI for installing and managing Model Context Protocol (MCP) server configurations across 14+ AI clients.

## Features

- 🚀 **Autoinstall** - Smart installation that preserves existing configs
- 📖 **Read** - View current MCP configurations 
- ✏️ **Write** - Manual configuration management
- ⚡ **Execute** - Run system commands for dependencies
- 🧪 **Test** - Validate server configs before installing

## Installation

```bash
npm install -g @grebyn/toolflow-cli
```

Or use with npx (no install needed):
```bash
npx @grebyn/toolflow-cli --version
```

## Quick Start

**1. Install ToolFlow server (simple):**
```bash
npx @grebyn/toolflow-cli autoinstall claude-desktop --template toolflow
```

**2. Check what's configured:**
```bash
toolflow read claude-desktop
```

**3. Restart Claude Desktop to activate the server!**

## Commands

### Autoinstall (Recommended)

Smart installation that merges new servers into existing configs without overwriting.

**Using Templates (Simple):**
```bash
toolflow autoinstall <client> --template <name>     # Use built-in template
toolflow autoinstall --list-templates               # Show available templates
```

**Using JSON (Advanced):**
```bash
toolflow autoinstall <client> '<servers-json>'      # Install custom config
toolflow autoinstall --path <file> '<servers-json>' # Install to custom path
```

**Template Examples:**
```bash
# Install ToolFlow server (easiest)
toolflow autoinstall claude-desktop --template toolflow

# Install filesystem server
toolflow autoinstall cline --template filesystem

# List all available templates
toolflow autoinstall --list-templates
```

**JSON Examples:**
```bash
# Custom single server
toolflow autoinstall claude-desktop '{"my-server": {"command": "node", "args": ["server.js"]}}'

# Multiple servers at once
toolflow autoinstall cline '{"server1": {"command": "node", "args": ["s1.js"]}, "server2": {"command": "python", "args": ["s2.py"]}}'
```

**Options:**
- `--backup` - Create backup before modifying
- `--force` - Create directories if needed
- `--path` - Use custom config file path

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

**⚠️ Warning:** Overwrites entire config file. Use `autoinstall` instead to preserve existing servers.

```bash
toolflow write <client> '<json>'        # Overwrite known client config
toolflow write '<json>' --path <file>   # Overwrite custom path
```

### Execute System Commands

```bash
toolflow exec <command> [args...]
```

**Examples:**
```bash
toolflow exec npm install @grebyn/toolflow-mcp-server
toolflow exec python -m pip install some-package
```

### Test MCP Server Configuration

Test if an MCP server configuration works before installing:

```bash
toolflow test '<config-json>' [--type startup|protocol|full] [--timeout ms]
```

**Examples:**
```bash
# Basic test
toolflow test '{"command": "npx", "args": ["@grebyn/toolflow-mcp-server"]}'

# Full protocol test
toolflow test '{"command": "python", "args": ["server.py"]}' --type protocol
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

**Install servers (preserves existing config):**
```bash
# Using templates (recommended)
toolflow autoinstall claude-desktop --template toolflow
toolflow autoinstall cline --template filesystem

# Using JSON (advanced)
toolflow autoinstall claude-desktop '{"toolflow": {"command": "npx", "args": ["@grebyn/toolflow-mcp-server"]}}'
```

**Check configurations:**
```bash
toolflow read claude-desktop
toolflow read --path ~/.config/my-client/config.json
```

## Troubleshooting

**MCP server not appearing?**
1. Test first: `toolflow test '{"command": "npx", "args": ["your-server"]}'`
2. Restart your AI client completely
3. Check config: `toolflow read claude-desktop`

**Common fixes:**
- Use `--path` for unsupported clients
- Use `--force` to create missing directories  
- Use `--verbose` or `--debug` for detailed logging

## Keywords

*MCP server manager, Model Context Protocol CLI, Claude Desktop configuration, VS Code MCP setup, AI assistant tools, MCP server installation, Claude MCP config, AI client configuration, MCP JSON config, command line MCP tool, MCP server testing, MCP protocol validation*