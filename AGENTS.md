# Website instructions

Read [README.md](README.md) for development, verification, and deployment.
Use Node from .nvmrc and npm ci; package.json owns the commands.

Preserve historical posts, public file URLs, content schemas, and the exact
Astro/Satteri compatibility pin. Never hand-edit generated dist output.
Newsdesk owns drafts; promotion into this site is a separate manual decision.
Pushes to master deploy automatically, so deployment requires authorization.

For code changes, run npm run check, npm test, npm run build, and
npm run check:links. Prose-only guidance edits need link review and
git diff --check.

## Code Review Rules

- Flag broken historical URLs or changes that silently rewrite archived posts.
- Check that content promotion and deployment stay within the requested scope.
