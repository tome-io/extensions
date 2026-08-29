# Moon+ Reader

Moon+ Reader is a reviewed Tomeio device-workflow add-on. It contributes an **Open in
Moon+ Reader** action on local Android books and a host-rendered Moon+ backup importer.

The manifest is the installable add-on and `device-workflow.json` is its complete
implementation. No executable extension code is downloaded. Tomeio interprets the JSON
through fixed, reviewed local-file capabilities after the add-on is installed.

When installed and enabled, the add-on exposes **Import Moon+ Reader backup** in Tomeio
Settings. Tomeio selects the local `.mrpro` file and the reviewed workflow reads only the
backup index, books database, positions, and statistics. It returns normalized books and
progress; Tomeio owns the library writes and syncs that data through Tomeio Sync. The raw
backup and book files are never uploaded.

For ongoing progress, users configure Moon+ Reader's WebDAV sync with the same Tomeio
Sync server, email, and password.

Install it from Tomeio's **Add-ons → Community** view.

The add-on manifest uses the Moon+ Reader icon published with the app's official
Google Play listing. Moon+ Reader and its branding belong to their respective owner.

## Implementation boundary

This repository owns the Moon+ backup mapping, package ids, MIME types, and the **Open in
Moon+ Reader** action.

Tomeio core owns generic file picking, capability enforcement, normalized library writes,
and the allow-listed local-file intent. Live progress compatibility belongs to the separate
Tomeio Sync service.
