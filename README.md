# adamolson.org

Personal site and blog, built with [Astro](https://astro.build) and deployed to GitHub Pages.

## Structure

- `src/content/blog/` — current writing, mostly data/technical.
- `src/content/archive/` — political-science commentary and academic-life posts from 2014-2019, kept as originally written.
- `src/pages/` — routes (home, about, blog, archive, feeds).
- `public/files/` — PDFs and post images from the old site, kept at their original paths since they're linked externally.

## Development

Use the Node version in `.nvmrc` and the committed dependency lockfile:

```sh
npm ci
npm run dev       # local dev server
npm run build     # production build to dist/
npm run preview   # preview the production build
npm run check     # type-check .astro files and content schemas
npm run check:links  # after a build: every internal link in dist/ resolves
npm test          # unit tests for build plugins
```

## Writing posts

Markdown footnotes (`text.[^1]` with `[^1]: The note.` below) render as
margin notes: in the right margin on wide screens, under the line on narrow
ones. A footnote containing a list or code block stays an ordinary footnote at
the end of the post. [`src/plugins/sidenotes.mjs`](src/plugins/sidenotes.mjs)
does the conversion when the site builds.

The plugin runs in Astro's Sätteri Markdown processor, so
`@astrojs/markdown-satteri` is pinned to the exact version Astro itself depends
on. When an Astro update changes that version, update the pin to match; the
plugin tests check that Sätteri's footnote markup hasn't changed.

## Verification

[Pull request checks](.github/workflows/ci.yml) install from the lockfile,
type-check, run the plugin tests, build the static site, check internal links, and run
`npm audit --audit-level=high`. The link check matches case exactly, as GitHub
Pages does, so it catches links that work locally on Windows but 404 in
production. It does not request external URLs. Review GitHub dependency
alerts too: advisory feeds can differ, so a clean npm audit alone does not
resolve an open GitHub alert.

## Deployment

Pushes to `master` deploy automatically via `.github/workflows/deploy.yml`
(GitHub Actions → GitHub Pages). It runs the pull request checks first, so a
failing check blocks the deploy, then builds with the `.nvmrc` Node version and
the lockfile.

The custom domain is set in the repository's Settings → Pages. GitHub ignores
`public/CNAME` for Actions deployments, so editing that file changes nothing.

DNS is at Namecheap: four apex A records for GitHub Pages and exactly one `www`
CNAME, pointing to `adamolsonmn.github.io`. GitHub issues one certificate for
both names, so it issues nothing while `www` is ineligible. The Advanced DNS
page hides records behind "Show more". Until October 2026, a hidden duplicate
`www` CNAME pointing to the apex blocked the certificate. To check
eligibility, run
`gh api repos/AdamOlsonMN/AdamOlsonMN.github.io/pages/health`.
`adamolson.net` is a Namecheap URL redirect (301) to `https://adamolson.org`.
It cannot serve HTTPS itself.

Pages deployment and the PR verification workflow are separate. A successful
build does not verify custom-domain DNS, certificate names, or HTTPS redirects.
After domain changes, verify both `adamolson.org` and `www.adamolson.org` with
normal certificate validation and check the Pages HTTPS settings separately.
