# Toolentry CLI - MCP Server Configuration Manager

A powerful CLI for installing and managing Model Context Protocol (MCP) server configurations across 17+ AI clients.

## Features

- **Autoinstall** - Smart installation that preserves existing configs
- **Read** - View current MCP configurations 
- **Write** - Manual configuration management
- **Test** - Validate server configs before installing
- **Flexible** - Works with 17+ predefined clients OR custom config paths

## Installation

```bash
npm install -g @toolentry.io/cli
```

Or use with npx (no install needed):
```bash
npx @toolentry.io/cli@latest --version
```

## Quick Start

**1. Install an MCP server using base64 JSON:**
```bash
# Generate base64 from your MCP server config JSON
echo '{"your-server":{"command":"npx","args":["your-mcp-server"]}}' | base64

# Install using the generated base64
npx @toolentry.io/cli@latest autoinstall claude-desktop --json-base64 <your-base64-here>
```

**2. Check what's configured:**
```bash
npx @toolentry.io/cli@latest read claude-desktop
```

**3. Restart your AI client to activate the server.**

## Commands

### Autoinstall (Recommended)

Smart installation that merges new servers into existing configs without overwriting. Automatically creates backups.

**Using Base64 JSON (Primary Method):**
```bash
npx @toolentry.io/cli@latest autoinstall <client> --json-base64 <encoded>         # Use with known client
npx @toolentry.io/cli@latest autoinstall --json-base64 <encoded> --path <file>    # Use with custom path
```

**Easy CLI Command Generation:**
Visit [toolentry.io/json-to-cli](https://www.toolentry.io/json-to-cli) to convert your MCP server JSON configuration into a ready-to-use CLI command with base64 encoding automatically handled.

**Using Templates (Alternative Method):**
```bash
npx @toolentry.io/cli@latest autoinstall <client> --template <name>     # Use built-in template
npx @toolentry.io/cli@latest autoinstall --template <name> --path <file> # Use template with custom path
npx @toolentry.io/cli@latest autoinstall --list-templates               # Show available templates
```

**Base64 JSON Examples:**
```bash
# Install with known client
npx @toolentry.io/cli@latest autoinstall claude-desktop --json-base64 eyJzZXJ2ZXIiOnsiY29tbWFuZCI6Im5weCIsImFyZ3MiOlsieW91ci1tY3Atc2VydmVyIl19fQ==

# Install to custom path with base64 JSON
npx @toolentry.io/cli@latest autoinstall --json-base64 eyJzZXJ2ZXIiOnsiY29tbWFuZCI6Im5weCIsImFyZ3MiOlsieW91ci1zZXJ2ZXIiXX19 --path ./config.json

# How to generate base64 in JavaScript:
# const config = {"server-name": {"command": "npx", "args": ["your-mcp-server"]}}
# const base64 = btoa(JSON.stringify(config))

# How to generate base64 in bash:
# echo '{"server":{"command":"python","args":["server.py"]}}' | base64

# Use the online converter for easy CLI command generation:
# Visit https://www.toolentry.io/json-to-cli
# Paste your MCP server JSON config
# Get a ready-to-use CLI command with base64 encoding
```

**Template Examples:**
```bash
# Install filesystem server
npx @toolentry.io/cli@latest autoinstall cline --template filesystem

# Install git server
npx @toolentry.io/cli@latest autoinstall claude-desktop --template git

# Install to custom path (no client needed)
npx @toolentry.io/cli@latest autoinstall --template filesystem --path ~/.config/my-client/config.json

# List all available templates
npx @toolentry.io/cli@latest autoinstall --list-templates
```

**Options:**
- `--force` - Create directories if needed
- `--path` - Use custom config file path (makes client optional)

### Read Configuration

Read the current configuration from an AI client or custom path:

```bash
npx @toolentry.io/cli@latest read <client>          # Use known client (auto-detect path)
npx @toolentry.io/cli@latest read --path <file>     # Use custom path
```

**Examples:**
```bash
# Read from known clients (auto-detect config path)
npx @toolentry.io/cli@latest read claude-desktop
npx @toolentry.io/cli@latest read cline
npx @toolentry.io/cli@latest read windsurf

# Read from custom paths
npx @toolentry.io/cli@latest read --path /custom/path/config.json
npx @toolentry.io/cli@latest read --path ~/.config/my-ai/settings.json
```

### Write Configuration

**Warning:** Overwrites entire config file. Use `autoinstall` instead to preserve existing servers.

```bash
npx @toolentry.io/cli@latest write <client> '<json>'        # Overwrite known client config
npx @toolentry.io/cli@latest write '<json>' --path <file>   # Overwrite custom path
```

### Test MCP Server Configuration

Test if an MCP server configuration works before installing:

```bash
npx @toolentry.io/cli@latest test '<config-json>' [--type startup|protocol|full] [--timeout ms]
```

**Examples:**
```bash
# Basic test
npx @toolentry.io/cli@latest test '{"command": "npx", "args": ["your-mcp-server"]}'

# Full protocol test
npx @toolentry.io/cli@latest test '{"command": "python", "args": ["server.py"]}' --type protocol
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

## Global Options

- `-v, --verbose` - Enable verbose logging
- `-d, --debug` - Enable debug logging
- `--version` - Show version number
- `--help` - Show help information

## Examples

**Install servers (preserves existing config):**
```bash
# Using base64 JSON (recommended for automation and scripting)
npx @toolentry.io/cli@latest autoinstall claude-desktop --json-base64 eyJzZXJ2ZXIiOnsiY29tbWFuZCI6Im5weCIsImFyZ3MiOlsieW91ci1zZXJ2ZXIiXX19

# Using templates (convenient for common servers)
npx @toolentry.io/cli@latest autoinstall cline --template filesystem
npx @toolentry.io/cli@latest autoinstall windsurf --template git

# Using custom paths (no client needed)
npx @toolentry.io/cli@latest autoinstall --json-base64 <base64> --path ~/.config/my-app/config.json
```

**Check configurations:**
```bash
npx @toolentry.io/cli@latest read claude-desktop
npx @toolentry.io/cli@latest read --path ~/.config/my-client/config.json
```

## Troubleshooting

**MCP server not appearing?**
1. Test first: `npx @toolentry.io/cli@latest test '{"command": "npx", "args": ["your-server"]}'`
2. Restart your AI client completely
3. Check config: `npx @toolentry.io/cli@latest read claude-desktop`

**Common fixes:**
- Use `--path` for unsupported clients
- Use `--force` to create missing directories  
- Use `--verbose` or `--debug` for detailed logging

## Keywords

*MCP server manager, Model Context Protocol CLI, Claude Desktop configuration, VS Code MCP setup, AI assistant tools, MCP server installation, Claude MCP config, AI client configuration, MCP JSON config, command line MCP tool, MCP server testing, MCP protocol validation*