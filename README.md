# TorrServer Tracker Manager

TorrServer plugin that manages the global tracker policy and tracker list applied to all torrents.

## Features

- Global tracker policy with four modes: add to existing, replace, remove all, or leave untouched
- Editable tracker list (one URL per line)
- Applies to every new torrent added to the engine
- Settings persist across restarts
- Ready-to-use default tracker list

## Installation

### From the plugin store

Open the admin panel → Plugins → Store → Install.

### Manual install

1. Download the latest release ZIP from [Releases](https://github.com/TorrServer-Project/plugin-tracker-manager/releases).
2. In the admin panel go to Plugins → Manual install, upload the ZIP.
3. Enable the plugin if it is disabled.

## Usage

Open the plugin page from the sidebar menu or at `/plugins/tracker-manager/`.

1. Choose the tracker policy mode:
   - **Add to existing** - keep original trackers, add the ones from the list
   - **Replace existing** - discard original trackers, use only the list
   - **Remove all trackers** - strip every tracker, rely on DHT only
   - **Do not modify** - leave torrents as they are, plugin does nothing
2. Paste your tracker list, one URL per line.
3. Click **Save & Apply**. The policy is applied immediately to the torrent engine.

The default list is restored with the **Restore Defaults** button.

## Compatibility

- TorrServer (Silo version) or later
- No client-side dependencies

## License

See [LICENSE](LICENSE).