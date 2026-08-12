# Matt Pocock Skills AGY Plugin Converter

CLI tool and `mise` workflow to convert Matt Pocock's skills repository ([github.com/mattpocock/skills](https://github.com/mattpocock/skills)) into an Antigravity (`agy`) plugin.

## Usage

### Setup Pipeline (0-to-installed)
Run the full 0-to-installed setup pipeline using `mise` or `npm`:
```bash
mise run setup
# or
npm run setup
```

This single command:
1. Compiles the TypeScript codebase (`npm run build`).
2. Clones or pulls the latest `mattpocock/skills` repository into `.cache/`.
3. Converts and flattens all 35 skills into `./dist/matt`.
4. Installs the plugin globally into `~/.gemini/config/plugins/matt` and refreshes AGY's plugin registry.
5. Verifies the installation with `agy --print "/matt:ask-matt"`.

### Individual `mise` Tasks
```bash
mise run build      # Compile TypeScript to dist/
mise run convert    # Convert skills into dist/matt
mise run install    # Install plugin to ~/.gemini/config/plugins/matt
mise run verify     # Verify installation via agy --print "/matt:ask-matt"
```

### CLI Arguments
- `--source <path_or_url>`: Custom local directory or Git repository URL.
- `--name <plugin_name>`: Override plugin name (default: `matt`).
- `--output <dir>`: Custom output directory for converted plugin.
- `--local`: Install into local project `.agents/plugins/<name>` instead of global plugins directory.

## Invoking Installed Skills in AGY
Once installed, skills bundled in the `matt` plugin are invoked using the `<plugin>:<skill>` namespace format:
- `/matt:ask-matt`
- `/matt:grill-with-docs`
- `/matt:tdd`
- `/matt:diagnosing-bugs`
