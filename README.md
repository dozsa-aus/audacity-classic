# Audacity — The Guild Hall

Standalone static edition of the Audacity Classic retrospective. Everything in `public/` is ready to host. No database, Node server, container, Warcraft Logs account or API key is needed by visitors.

## Publish free on GitHub Pages

1. Create a public repository, such as `audacity-guild-hall`, with default branch `main`.
2. Push the contents of this folder, including `.github/workflows/pages.yml`, to that repository.
3. In the repository’s **Settings → Pages**, choose **GitHub Actions** as the source.
4. Run **Actions → Publish Guild Hall → Run workflow**, or push a new commit.

The workflow publishes only `public/`. GitHub reports the resulting URL on its deployment, normally `https://YOUR-ACCOUNT.github.io/YOUR-REPOSITORY/`. An account-root Pages site and custom domains also work. Keep the trailing slash on a repository URL.

The site contains the supplied guild photograph, logo and audio, cached raid/boss/item artwork, and selected guild analytics JSON. Browser filters, profiles, mechanic files and audio work without a backend. The `34.1 million` line describes locally processed source records; raw event pages are not part of this repository.

## Update the snapshot or design

Maintain the private collector and source app on the original Mac. Refresh the local aggregates if the data changes, then run from that original checkout:

```sh
npm --prefix guild-hall run export:pages
```

This recreates `dist/github-pages/`. Copy its updated `public/` files into this repository, commit and push. Review removals too, so replaced artwork is not retained. Deployment reads the committed snapshot; it never contacts the private collector or Warcraft Logs.

The generated `export-manifest.json` records file sizes, hashes and the snapshot date for verification. The free GitHub Pages setup uses a public repository and serves public files. It has no sign-in or private member area.
