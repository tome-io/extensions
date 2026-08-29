# Moon+ Reader

Moon+ Reader is a reviewed Tomeio device-workflow add-on for Android. It contributes an
**Open in Moon+ Reader** action on local books.

The manifest is the installable add-on and `device-workflow.json` is its complete
implementation. No executable extension code is downloaded. Tomeio interprets the JSON
through a fixed, reviewed Android file-opening capability after the add-on is installed.

Reading progress is not imported from Moon+ backup files. Users who enable Tomeio Sync
configure Moon+ Reader's WebDAV sync with the same server, email, and password; the
first-party sync service then exchanges progress with Tomeio and other supported readers.

Install it from Tomeio's **Add-ons → Community** view.

The add-on manifest uses the Moon+ Reader icon published with the app's official
Google Play listing. Moon+ Reader and its branding belong to their respective owner.

## Implementation boundary

This repository owns the Moon+ package ids, MIME types, and the **Open in Moon+ Reader**
action.

Tomeio core owns the generic allow-listed local-file intent. Live progress compatibility
belongs to the separate Tomeio Sync service rather than this add-on.
