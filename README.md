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
```

## Verification

[Pull request checks](.github/workflows/ci.yml) install from the lockfile, build
the static site, and run `npm audit --audit-level=high`. Review GitHub dependency
alerts too: advisory feeds can differ, so a clean npm audit alone does not
resolve an open GitHub alert.

## Deployment

Pushes to `master` build and deploy automatically via `.github/workflows/deploy.yml` (GitHub Actions → GitHub Pages).

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
