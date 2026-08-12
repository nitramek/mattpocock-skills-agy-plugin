# Matt Pocock Skills AGY Converter Plugin

This project converts Matt Pocock's Claude Code skills repository ([github.com/mattpocock/skills](https://github.com/mattpocock/skills)) into an Antigravity (`agy`) plugin.

## Project Structure
- `src/repo.ts`: Clones/updates source skills repository.
- `src/converter.ts`: Converts Claude skills into flattened AGY plugin format and cleans frontmatter (`disable-model-invocation`).
- `src/installer.ts`: Deploys plugin to AGY customization directory (`~/.gemini/config/plugins/matt`) and re-indexes registry.
- `src/verifier.ts`: Verifies plugin installation with `agy --print "/matt:ask-matt"`.
- `src/index.ts`: Main CLI interface.
- `mise.toml`: Tool versions and convenience tasks (`build`, `convert`, `install`, `verify`).

## Development & Verification Conventions
1. **Tooling**: Built with Node.js + TypeScript using `mise` for environment management.
2. **Commands**:
   - `mise run build`: Compiles TypeScript.
   - `mise run convert`: Converts skills into `./dist/matt`.
   - `mise run install`: Installs plugin globally into `~/.gemini/config/plugins/matt`.
   - `mise run verify`: Runs empirical check using `agy --print "/matt:ask-matt"`.
   - `npx tsx src/index.ts all`: Runs end-to-end convert, install, and verify sequence.
3. **Verification Criterion**:
   The plugin is verified using `agy --print "/matt:ask-matt"`. Successful output prints the skills router without `jetski` or missing permission errors.
