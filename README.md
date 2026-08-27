# Tomeio extensions

This repository contains installable book-source extensions for Tomeio. Extensions are separate
from the providers bundled in [`tome-io/core`](https://github.com/tome-io/core) and use the same
manifest and resource contracts.

## Resources

- `catalog` returns discovery rows or paged catalogs.
- `search` returns books matching a query.
- `meta` returns details for a provider book ID.
- `acquisition` returns downloadable formats or external open actions.

An extension implements only the resources it declares in `tomeio-extension.json`.

## Repository structure

```text
provider-name/
├── tomeio-extension.json
├── extension.js
├── package.json
└── test/
```

The manifest defines the extension ID, version, resources, configuration, transport, and permitted
network hosts. Script transports point to a JavaScript bundle and include the SHA-256 digest of the
exact published bytes.

## Runtime

Script extensions register their resources as `globalThis.tomeioExtension`. The sandbox exposes the
host API as `globalThis.tomeio`:

- `tomeio.fetch(url, options)`
- `tomeio.config.get(key)`
- `tomeio.store.get/set/remove(key)`
- `tomeio.secureStore.get/set/remove(key)`

The host API mediates storage and network access. Requests are limited to the HTTPS origins listed
under `permissions.hosts` in the manifest.

## Installation

Tomeio accepts an HTTPS GitHub repository URL, a repository subdirectory URL, or a direct manifest
URL. Repository locations resolve to `tomeio-extension.json`.

```text
https://github.com/owner/repository
https://github.com/owner/repository/tree/main/provider-name
https://raw.githubusercontent.com/owner/repository/main/tomeio-extension.json
```

## Development

Use the protocol types and validator from `@tomeio/extension-protocol` in `tome-io/core`. Test every
declared resource and verify the published bundle digest before updating a manifest.
