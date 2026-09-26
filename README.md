# Vencord Ctrl Mute

A Vencord userplugin that toggles a guild channel's mute indefinitely when you
Ctrl-click it in the channel list. Ctrl-click it again to unmute it. On macOS,
use Command-click.

The action is saved to Discord's channel notification settings, so it persists
across restarts and other clients. It does not affect direct messages or
category headers.

## Install into a Vencord source build

Clone this repository under `src/userplugins/VencordCtrlMute/` and rebuild
Vencord. The plugin is compiled into the client; it is not loaded from a
separate plugin file at runtime.

This repository is pinned as a submodule in
[x3cca/vencord](https://github.com/x3cca/vencord) for the custom Fedora build.

## License

GPL-3.0-or-later. See [LICENSE](LICENSE).
