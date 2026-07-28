# adamolson.org

Personal site and blog, built with [Astro](https://astro.build) and deployed to GitHub Pages.

## Structure

- `src/content/blog/` — current writing, mostly data/technical.
- `src/content/archive/` — political-science commentary and academic-life posts from 2014-2019, kept as originally written.
- `src/pages/` — routes (home, about, blog, archive, feeds).
- `public/files/` — PDFs and post images from the old site, kept at their original paths since they're linked externally.

## Development

```sh
npm install
npm run dev       # local dev server
npm run build     # production build to dist/
npm run preview   # preview the production build
```

## Deployment

Pushes to `master` build and deploy automatically via `.github/workflows/deploy.yml` (GitHub Actions → GitHub Pages). The custom domain is set in `public/CNAME`.
