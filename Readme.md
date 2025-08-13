# Toolentry CLI - MCP Server Configuration Manager

A powerful CLI for installing and managing Model Context Protocol (MCP) server configurations across 14+ AI clients.

## Features

- 🚀 **Autoinstall** - Smart installation that preserves existing configs
- 📖 **Read** - View current MCP configurations 
- ✏️ **Write** - Manual configuration management
- ⚡ **Execute** - Run system commands for dependencies
- 🧪 **Test** - Validate server configs before installing
- 🎯 **Flexible** - Works with 17+ predefined clients OR custom config paths

## Installation

```bash
npm install -g @grebyn/toolentry-cli
```

Or use with npx (no install needed):
```bash
npx @grebyn/toolentry-cli@latest --version
```

## Quick Start

**1. Install Toolentry server (simple):**
```bash
npx @grebyn/toolentry-cli@latest autoinstall claude-desktop --template toolentry
```

**2. Check what's configured:**
```bash
toolentry read claude-desktop
```

**3. Restart Claude Desktop to activate the server!**

## Commands

### Autoinstall (Recommended)

Smart installation that merges new servers into existing configs without overwriting. Automatically creates backups.

**Using Templates (For Humans):**
```bash
toolentry autoinstall <client> --template <name>     # Use built-in template
toolentry autoinstall --template <name> --path <file> # Use template with custom path
toolentry autoinstall --list-templates               # Show available templates
```

**Using Base64 JSON (For Automation):**
```bash
toolentry autoinstall <client> --json-base64 <encoded>         # Use with known client
toolentry autoinstall --json-base64 <encoded> --path <file>    # Use with custom path
```

**Template Examples:**
```bash
# Install Toolentry server (easiest)
toolentry autoinstall claude-desktop --template toolentry

# Install filesystem server
toolentry autoinstall cline --template filesystem

# Install to custom path (no client needed)
toolentry autoinstall --template toolentry --path ~/.config/my-client/config.json

# List all available templates
toolentry autoinstall --list-templates
```

**Base64 JSON Examples:**
```bash
# For computer-generated commands (no escaping issues!)
toolentry autoinstall claude-desktop --json-base64 eyJ0b29sZmxvdyI6eyJjb21tYW5kIjoibnB4IiwiYXJncyI6WyJAZ3JlYnluL3Rvb2xmbG93LW1jcC1zZXJ2ZXJAbGF0ZXN0Il0sImVudiI6eyJDTElFTlQiOiJjbGF1ZGUtZGVza3RvcCJ9fX0=

# Install to custom path with base64 JSON
toolentry autoinstall --json-base64 eyJ0b29sZW50cnkiOnsiY29tbWFuZCI6Im5weCIsImFyZ3MiOlsiQGdyZWJ5bi90b29sZW50cnktbWNwLXNlcnZlciJdfX0= --path ./config.json

# How to generate base64 in JavaScript:
# const config = {"toolentry": {"command": "npx", "args": ["..."]}}
# const base64 = btoa(JSON.stringify(config))
```

**Options:**
- `--force` - Create directories if needed
- `--path` - Use custom config file path (makes client optional)

### Read Configuration

Read the current configuration from an AI client or custom path:

```bash
toolentry read <client>          # Use known client (auto-detect path)
toolentry read --path <file>     # Use custom path
```

**Examples:**
```bash
# Read from known clients (auto-detect config path)
toolentry read claude-desktop
toolentry read cline
toolentry read windsurf

# Read from custom paths
toolentry read --path /custom/path/config.json
toolentry read --path ~/.config/my-ai/settings.json
```

### Write Configuration

**⚠️ Warning:** Overwrites entire config file. Use `autoinstall` instead to preserve existing servers.

```bash
toolentry write <client> '<json>'        # Overwrite known client config
toolentry write '<json>' --path <file>   # Overwrite custom path
```

### Execute System Commands

```bash
toolentry exec <command> [args...]
```

**Examples:**
```bash
toolentry exec npm install @grebyn/toolentry-mcp-server
toolentry exec python -m pip install some-package
```

### Test MCP Server Configuration

Test if an MCP server configuration works before installing:

```bash
toolentry test '<config-json>' [--type startup|protocol|full] [--timeout ms]
```

**Examples:**
```bash
# Basic test
toolentry test '{"command": "npx", "args": ["@grebyn/toolentry-mcp-server"]}'

# Full protocol test
toolentry test '{"command": "python", "args": ["server.py"]}' --type protocol
```

## Supported AI Clients & Platforms

Toolentry CLI automatically detects config paths for these popular AI clients:

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

### Template Behavior

**Important**: The `toolentry` template automatically adapts based on usage:
- **With client**: `toolentry autoinstall claude-desktop --template toolentry` → includes `CLIENT` environment variable
- **Without client**: `toolentry autoinstall --template toolentry --path ./config.json` → clean config without client-specific variables

Other templates (filesystem, git, sqlite, brave, postgres) work the same regardless of whether a client is specified.

## Global Options

- `-v, --verbose` - Enable verbose logging
- `-d, --debug` - Enable debug logging
- `--version` - Show version number
- `--help` - Show help information

## Examples

**Install servers (preserves existing config):**
```bash
# Using templates (recommended for humans)
toolentry autoinstall claude-desktop --template toolentry
toolentry autoinstall cline --template filesystem

# Using custom paths (no client needed)
toolentry autoinstall --template toolentry --path ~/.config/my-app/config.json

# Using base64 JSON (recommended for automation)
toolentry autoinstall claude-desktop --json-base64 eyJ0b29sZmxvdyI6ey...
```

**Check configurations:**
```bash
toolentry read claude-desktop
toolentry read --path ~/.config/my-client/config.json
```

## Troubleshooting

**MCP server not appearing?**
1. Test first: `toolentry test '{"command": "npx", "args": ["your-server"]}'`
2. Restart your AI client completely
3. Check config: `toolentry read claude-desktop`

**Common fixes:**
- Use `--path` for unsupported clients
- Use `--force` to create missing directories  
- Use `--verbose` or `--debug` for detailed logging

## Keywords

*MCP server manager, Model Context Protocol CLI, Claude Desktop configuration, VS Code MCP setup, AI assistant tools, MCP server installation, Claude MCP config, AI client configuration, MCP JSON config, command line MCP tool, MCP server testing, MCP protocol validation*