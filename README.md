# Matt Pocock Skills AGY Plugin Converter

CLI tool and `mise` workflow to convert Matt Pocock's skills repository ([github.com/mattpocock/skills](https://github.com/mattpocock/skills)) into an Antigravity (`agy`) plugin.

## Usage

### Quickstart
Run the end-to-end pipeline (clones/pulls repo, converts skills, installs plugin, and verifies):
```bash
npx tsx src/index.ts all
```

### Using `mise` Tasks
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
