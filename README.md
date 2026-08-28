# Tomeio community add-ons

This repository is the reviewed community registry consumed by Tomeio. It contains
discovery metadata and manifests for supported add-ons that are optional rather than
bundled with the app.

Third-party add-ons do not need to be listed here. Users can install those directly from
their GitHub repository or manifest URL. Inclusion here means the manifest and its
declared capabilities have been reviewed for in-app community discovery.

## Registry

[`registry.json`](./registry.json) is the machine-readable index. Each entry identifies:

- the stable add-on id;
- its HTTPS manifest and repository URLs;
- the minimum compatible Tomeio version;
- when it was last reviewed;
- any reviewed device capabilities it may invoke.

The app downloads the registry, validates every manifest with the Tomeio protocol, and
then displays the entries under the Community filter. Installing a community add-on
creates the same local installation record used by a manually installed third-party
add-on.

## Add-on locations

Reviewed device add-ons, such as Moon+ Reader, live in this repository with their
manifest and JSON workflow. Tomeio core exposes generic, permissioned device primitives;
reader-specific parsing and behavior remain here and are dormant until installation.

Hosted add-ons keep their TypeScript source and deployment in their own repositories.
After review, this registry points to their published manifest; it never executes source
code inside Tomeio.

## Authoring

Build HTTP, declarative, and device-workflow add-ons with
[`@tomeio/addon-sdk`](https://github.com/tome-io/addon-sdk). Executable JavaScript bundle
transports are not accepted. Device workflows require community review because they
request local capabilities.

Every registry change must update the add-on version when its manifest behavior changes.
