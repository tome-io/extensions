# Moon+ Reader

Moon+ Reader is a reviewed Tomeio device-workflow add-on for Android. It contributes:

- progress import from a user-selected Moon+ Reader backup folder;
- an **Open in Moon+ Reader** action on local books.

The manifest is the installable add-on and `device-workflow.json` is its complete
implementation. No executable extension code is downloaded. Tomeio interprets the JSON
through fixed, reviewed capabilities only after the add-on is installed and its backup
folder is configured.

Install it from Tomeio's **Add-ons → Community** view.

The add-on manifest uses the Moon+ Reader icon published with the app's official
Google Play listing. Moon+ Reader and its branding belong to their respective owner.

## Implementation boundary

This repository owns the backup discovery rules, ZIP index mapping, SharedPreferences
progress parsing, read-only SQLite queries, result mapping, Moon+ package ids, MIME types,
and the **Open in Moon+ Reader** action.

Tomeio core owns only generic operations: selected-directory scanning, bounded ZIP/file
reads, read-only SQLite execution, Android preferences parsing, and allow-listed local
file intents. The same operations can support other reader applications without adding
reader-specific code to Tomeio.
