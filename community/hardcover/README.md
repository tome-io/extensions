# Hardcover

A reviewed declarative community add-on for [Hardcover](https://hardcover.app).

It can act as Tomeio's Discovery, Search, Cover, and Reviews provider. Discovery includes Hardcover's weekly trending books and the team-curated Hidden Gem Fantasy, Romantasy, and Enemies to Lovers vibes. Returned books include Hardcover ratings, rating counts, and featured-series positions.

## Configuration

Create a dedicated Personal Access Token in [Hardcover API settings](https://hardcover.app/account/api/keys/new?scope=read%3Acatalog+read%3Avibes%3Apublic+read%3Alibrary%3Apublic+read%3Ausers) with only these read scopes:

- `read:catalog`
- `read:vibes:public`
- `read:library:public`
- `read:users`

Paste that token into the add-on's configuration. Tomeio stores password fields in secure device storage. The token is sent only to `https://api.hardcover.app`; the workflow is read-only and declares no mutations.

Hardcover currently documents API calls as backend/offline use and does not allow browser requests. Use this add-on in the native iOS or Android app, not Tomeio web. Review data remains subject to Hardcover's API terms and the visibility granted by the token.

The add-on intentionally requires the reader's own token. Tomeio does not ship or proxy a shared Hardcover credential.
