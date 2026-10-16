# Matt Pocock Skills AGY Converter Plugin

This project converts Matt Pocock's Claude Code skills repository ([github.com/mattpocock/skills](https://github.com/mattpocock/skills)) into an Antigravity (`agy`) plugin.

## Versioning Policy
By default, the converter uses the **latest published release tag** (e.g. `v1.2.3`) from the source repository rather than building from `master`.
Specific versions or branches can be checked out using `--tag <version_or_branch>` (e.g. `--tag master` or `--tag v1.2.0`).

## Project Structure
- `src/repo.ts`: Clones/updates source skills repository and checks out latest tag (or `--tag` override).
- `src/converter.ts`: Converts Claude skills into flattened AGY plugin format and preserves frontmatter metadata (including `disable-model-invocation`).
- `src/installer.ts`: Deploys plugin to AGY customization directory (`~/.gemini/config/plugins/matt`) and re-indexes registry.
- `src/verifier.ts`: Verifies plugin installation with `agy --print "/matt:ask-matt"`.
- `src/index.ts`: Main CLI interface.
- `mise.toml`: Tool versions and convenience tasks (`setup`, `build`, `convert`, `install`, `verify`).

## Development & Verification Conventions
1. **Tooling**: Built with Node.js + TypeScript using `mise` for environment management.
2. **Commands**:
   - `mise run setup`: Runs complete compound setup sequence (build, clone/pull, convert latest tag, install, and verify).
   - `mise run build`: Compiles TypeScript.
   - `mise run convert`: Converts skills into `./dist/matt`.
   - `mise run install`: Installs plugin globally into `~/.gemini/config/plugins/matt`.
   - `mise run verify`: Runs empirical check using `agy --print "/matt:ask-matt"`.
   - `npx tsx src/index.ts setup`: Runs end-to-end convert, install, and verify sequence.
3. **Verification Criterion**:
   The plugin is verified using `agy --print "/matt:ask-matt"`. Successful output prints the skills router without `jetski` or missing permission errors.
