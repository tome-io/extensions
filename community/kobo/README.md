# Kobo eReader

Reviewed Tomeio host integration for Kobo's built-in sync client. The add-on
generates a private, revocable Tomeio Sync endpoint and shows the device setup
instructions in Tomeio.

The live compatibility routes run in `tome-io/sync`; this repository contains
only the reviewed manifest. The integration synchronizes EPUB library metadata
and reading progress. It does not upload or serve EPUB, PDF, or cover files.

Kobo models custom-library books as entitlements. Without a book download URL,
metadata-only records may appear unavailable on the device. This limitation is
shown in Tomeio before the user connects the reader.
