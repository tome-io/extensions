# Google Books

A reviewed, GitHub-hosted declarative community add-on for Google Books.

It supplies Tomeio's Discovery and Search provider roles with topic catalogs, newest fiction,
covers, ratings, descriptions, regional prices, and links back to Google Books. It does not claim
the Download provider role: Google purchase and source URLs open on the web instead of returning a
native book file to Tomeio.

The add-on requires a user-provided Google Books API key. Tomeio stores the password configuration
in secure device storage and sends it using Google Books' documented `key` query parameter.

Google Books offers relevance and newest ordering, not a public general-purpose trending feed.
