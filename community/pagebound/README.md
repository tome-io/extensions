# Pagebound

A declarative community add-on for [Pagebound](https://pagebound.co). It uses
Pagebound's existing email/password login and runs requests directly from Tomeio.
No hosted proxy or changes to Tomeio core are required.

## Features

- Discovery: today's featured emoji, most finished, most added to TBR, and most
  discussed yesterday.
- Personal library: paginated Reading, TBR, Interested, Finished, DNF, and Paused
  catalogs. Select Pagebound as the Discovery provider to browse these shelves.
- Title/author search and cover resolution.
- Book details with descriptions, tags, publication year, aggregate ratings,
  rating counts, series positions, and Pagebound/Goodreads identifiers when available.
- Written reviews with ratings, author avatars and links, dates, upvotes, and spoiler flags.
  Blocked and flagged reviews are omitted.

Library catalogs let readers browse and add books through Tomeio's existing catalog
UI. They do not automatically import shelves or synchronize reading progress.
The add-on does not write books, reviews, progress, or other account content.

## Configuration and authentication

Enter your Pagebound email and password in the add-on settings. Tomeio stores the
password in secure storage. Accounts using a social login need a working Pagebound
email/password login; social provider login is not implemented here.

The workflow follows the site's login sequence:

1. Send the email/password to Firebase Identity Toolkit's
   `accounts:signInWithPassword` endpoint.
2. Exchange the Firebase ID token at Pagebound's `/api/v1/auth/firebase_auth`.
3. Send the returned **Pagebound** token as `Authorization: Bearer …` to Pagebound's
   API. The Firebase token cannot authenticate those API reads directly.

Only Firebase receives the password. Only Pagebound receives the ID/session tokens.
Search uses the same public Typesense search key embedded in the site's JavaScript;
it receives search terms, not account credentials. The Firebase project key and
Typesense search key in the workflow are public client configuration, not a shared
reader account. No personal credentials or session tokens are committed.

The current declarative runtime does not cache login sessions between invocations.
Library catalog, known-ID resolve, and matched review calls each log
in again. Discovery catalogs and book metadata use public endpoints, so Home rating
enrichment and detail-screen visits do not cause additional logins. Ordinary search
and title/author resolution also do not log in. Authentication
errors propagate rather than producing an empty library. A future generic session
cache could reduce login traffic without adding a provider-specific host adapter.

## Matching and pagination

Pagebound book UUIDs are the canonical add-on IDs and can be used directly for
reviews, avoiding an extra book-detail request. User-book UUIDs identify library entries
and must not be used as book UUIDs.

Resolution uses a Pagebound identifier when present; otherwise it requires an exact
title and author match after trimming and case normalization. Reviews without a
Pagebound identifier require a unique search result and the same exact match.
Ambiguous matches return no reviews. ISBN lookup is not implemented because the
public search index inspected does not expose ISBN fields.

Search pages contain 24 results. Discovery lists honor the requested page size,
defaulting to 20.
Library and review pages use Pagebound's native pagination and `total_pages`, so
their page sizes may differ from Tomeio's requested `limit`. No native page is
truncated, which would otherwise skip records. Search rating counts can lag behind
book-detail counts because Pagebound maintains a separate search index.

Discovery responses often omit the overall rating. Updated Tomeio clients fill
missing catalog ratings through the shared, cached `meta` handler used by book
details. Clients with progressive enrichment display the catalog first and fill
ratings in afterward. Older clients may wait for all metadata requests before
showing the catalog, or show ratings only on the detail screen. Unrated books
remain unrated; rating counts are not used to invent an average.

## Investigation and limits

See [API notes](./API-NOTES.md) for observed endpoints and future integration areas.
These are undocumented web-client APIs inspected on September 28, 2026 and may
change independently of Tomeio.

Live investigation confirmed login, token exchange, four discovery endpoints,
search, exact title/author matching, book details, written reviews, custom shelf
listing, and library reads. The supplied account had no books or custom shelves;
populated library mappings follow the site's library component and still need
validation with a populated account. No account content was added for testing.

Before release, exercise the add-on in Tomeio on the target platforms: login errors,
all catalogs, populated library pagination, details, cross-provider matching, and
spoiler handling. Browser CORS behavior and native end-to-end behavior have not
been validated. Publish this directory and the registry together so the manifest's
workflow URL exists before users install it.
