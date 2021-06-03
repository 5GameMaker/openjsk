
# 1.2.2 (beta, 1)
Some fixes

## Changes

- Added `language` command
- `DefaultPrefixManager`/`DefaultLanguager` fixes
- Added languager support to every command
- Added jishaku command (totally not stolen from discord.ext)

# 1.2.2 (beta)
Quality-of-life changes/Breaking release!

## Changes

- Now Bot.getPluginsOfType(...) can finally be used without a template
- Switching to params instead of args (doesn't break anything)
- Created and implemented languager plugin
- Now requires less code to setup (Breaks existing code and causes issues because of plugin duplication)
- Decryptors now are being used for params
- Added default module
- Added paginator as a plugin (has some issues)
- Upgraded `Context` a bit

## Plans

- Make paginator not a plugin because it makes no sense (english 100)

# 1.2.1 (beta)
Breaking release!

## Changes

- Default plugins can now be accessed using `openjsk.plugins.implementations` (everything can be accessed via main module)
- Plugins were moved in `openjsk.plugins` (everything can be accessed via main module)
- Finally an implementation for behavours
- Decryptors and params (will replace args soon)
- Changed API of `DefaultPrefixManager`
