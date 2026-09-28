# Pagebound API investigation

Observed September 28, 2026 from the public web bundles and authenticated reads
using the account supplied for this investigation. No library, review, shelf,
profile, or progress mutations were made. Login uses the site's normal session
exchange and may update authentication metadata.

## Sources

- [Pagebound](https://pagebound.co/), [Library](https://pagebound.co/library),
  [Discover](https://pagebound.co/discover), and [Discuss](https://pagebound.co/discuss).
- Shared client bundle: `/assets/chunks/chunk-ByPJ5q-l.js`.
- Login: `/assets/entries/src_pages_login_email.3oECTUT7.js`.
- Library: `/assets/entries/src_pages_library_books.BBdnMfCF.js` and
  `/assets/chunks/chunk-Dxiz6rjC.js`.
- Discovery: `/assets/entries/src_pages_discover.Dvejezw3.js`.
- Book details/reviews: `/assets/entries/src_pages_books_-uuid.myiG_zIk.js`.

Asset hashes identify the inspected deployment and will change.

## Authentication

Firebase project: `pagebound-430920`. Email/password login returns an ID token.
`POST https://prod-pagebound-api.onrender.com/api/v1/auth/firebase_auth` accepts
`{"id_token":"…"}` and returns `{user, token, preferences}`. Subsequent API reads
use the returned Pagebound token. Passing the Firebase ID token directly to
`/auth/get_authed_user` failed; the token exchange is required.

No refresh or expiry contract for the Pagebound token was established. The
implementation obtains a fresh session per authenticated invocation. Keep all
tokens out of source, fixtures, telemetry, and URLs.

Follow-up verification confirmed `GET /books/:book_uuid` also works without an
Authorization header and includes aggregate ratings. The `meta` resource uses
this public read, avoiding repeated authentication when enriching Home cards.

## Confirmed reads

Paths below are relative to `https://prod-pagebound-api.onrender.com/api/v1`.

| Endpoint | Observed behavior |
| --- | --- |
| `GET /books?q=emoji` | `{books, emoji}`; daily featured books. |
| `GET /books?q=most_finished_yesterday` | Array of books. |
| `GET /books?q=most_tbr_yesterday` | Array of books. |
| `GET /books?q=most_discussed_yesterday` | Array of books. |
| `GET /books/:book_uuid` | `{book, user_book}`; details, aggregate/sub-ratings, tags, recommendations, quests, lists, and forum metadata. |
| `GET /books/:numeric_book_id/reviews` | `{reviews, user_review, total_pages}`; supports `page`, `only_written_reviews`, `only_following`, and `sort_by=most_upvotes`. |
| `GET /user_books?status=current&page=1` | `{user_books, total_pages, total_count}`; supplied account was empty. |
| `GET /user_books?page=1` | Same response keys; supplied account was empty. |
| `GET /shelves` | Custom shelves; supplied account returned an empty array. |

The site's status values are `current`, `tbr`, `interested`, `finished`, `dnf`,
and `paused`. Library results are flattened user-book records: the UI reads
`book_uuid`, `title`, `author_name`, and `image_url` directly, not a nested `book`.
Their own `uuid` belongs to the user's library entry.

Details supply `aggregate_ratings.overall` as a numeric string and
`aggregate_ratings.ratings_count` as a number. Discovery often omits aggregate
ratings. Missing ratings stay absent rather than becoming zero. Sub-ratings
include plot, character, quality, entertainment, and audiobook. Tomeio currently
renders the overall rating only.

Review records include `id`, `uuid`, `username`, `review`, `overall_rating`,
`is_spoiler`, `is_dnf`, `is_blocked`, `is_flagged`, `upvotes`, and `created_at`.
Review text is Markdown. The date observed is a formatted date string, not a
precise timestamp. The add-on retains it without inventing a time or timezone.
`user_image_url` is an avatar path relative to `https://cdn.pagebound.co`; the
workflow resolves it to `authorAvatarUrl`. Missing avatars remain absent.

## Search

Host: `https://hztadco4ku1vqi6lp.a1.typesense.net`.

`GET /collections/books/documents/search` accepts `q`, `query_by=title,author_name`,
`sort_by=rating_count:desc`, `page`, and `per_page`. Authentication uses the public
`X-TYPESENSE-API-KEY` shipped with the site's client. Results contain `found` and
`hits[].document`, with `id`, `uuid`, `title`, `author_name`, `description`,
`image_url`, and `rating_count`.

The UUID is returned in documents but is **not searchable**: `query_by=uuid`
returned a schema error. Known UUIDs must go through the book-details API.
Search covers can use `cdn.pagebound.org`, whereas current detail responses use
`cdn.pagebound.co`; the workflow retains the URL supplied by each endpoint.

## Additional surfaces found in client code

These routes were identified in client code; they were not all exercised live.

| Surface | Read endpoints / notes |
| --- | --- |
| Custom shelf books | `GET /shelves/:shelf_uuid?page=…`; returns shelf, user books, counts, and breakdown. |
| Reading sessions | `GET /reading_instances?user_book_uuid=…`; multiple reading instances per user-book. |
| Planning | `GET /user_books/scheduled_books`; month/year and past filters. |
| Review summary | `GET /books/:book_uuid/reviews_summary`; rating distribution. |
| Book discussion | `GET /books/:book_uuid/feed?page=…`, `/social_activity?status=…`, and `/user_book_counts`. |
| Review discussion | `GET /reviews/:review_id?page=…`; review and paginated comments. |
| Lists | `GET /lists?type=new\|popular\|emoji&page=…`. |
| Quests | `GET /challenges/discover`. |
| Giveaways | `GET /giveaways/discover`. |
| Community discovery | `GET /users?q=taste\|royalty\|new`. |

The shared bundle also exposes writes for user books, status changes, scheduling,
reviews, custom shelves, and reading instances. Those were not called or included
in the add-on. Any future write integration needs explicit product behavior for
conflicts, deletions, rereads, partial progress, and which service owns each field.

## Integration boundaries

- Custom shelves need a way to enumerate account-specific catalogs; the current
  manifest publishes fixed catalog descriptors. A manually configured shelf UUID
  is possible but would be a separate product choice.
- Automatic library/progress sync needs pagination beyond the current bounded
  request graph and verified populated reading-instance data. The existing reader
  path also uses device-reader import semantics. The add-on therefore exposes
  status shelves as ordinary catalogs.
- Forums, quests, badges, lists, and giveaways have no matching Tomeio resource
  in the current protocol. Do not flatten them into fabricated books or reviews.
- Map only book/review fields needed by Tomeio. Rich API responses contain nested
  user objects that are unnecessary for this integration.
- This is an unofficial client integration. Provider changes to authentication,
  search keys, API response shapes, or CORS can require an add-on update.
