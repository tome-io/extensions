# Moon+ Reader

Moon+ Reader is a reviewed Tomeio host add-on for Android. It contributes:

- progress import from a user-selected Moon+ Reader backup folder;
- an **Open in Moon+ Reader** action on local books.

The manifest is the installable add-on. It selects the narrowly permissioned
`reader.moon-plus` adapter shipped by compatible Tomeio clients. No executable code is
downloaded, and the adapter is inactive until the add-on is installed and its backup
folder is configured.

Install it from Tomeio's **Add-ons → Community** view.

The add-on manifest uses the Moon+ Reader icon published with the app's official
Google Play listing. Moon+ Reader and its branding belong to their respective owner.

## Implementation boundary

This repository currently owns the reviewed manifest, configuration schema, declared
library action, and community-registry entry. The device implementation is a Tomeio
host adapter because it needs Android Storage Access Framework access, ZIP and SQLite
backup parsing, and an Android package intent. That adapter ships in compatible Tomeio
clients but is only activated while this add-on is installed.

This means the add-on is installable and permission-gated, but its Moon+ Reader-specific
device logic is not yet independently downloadable. Moving that logic into a generic,
declarative device-capability workflow is required before this can be considered fully
external to the app.
