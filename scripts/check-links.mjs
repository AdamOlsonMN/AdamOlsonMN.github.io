// Checks that every internal link in the built site points at a page or file
// that exists. Matching is case-sensitive, like GitHub Pages, even on Windows
// and macOS where the local filesystem is not.
//
// Usage: node scripts/check-links.mjs [dist-directory]

import { readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';

const root = path.resolve(process.argv[2] ?? 'dist');

const listings = new Map();
function entries(dir) {
	if (!listings.has(dir)) {
		let names = null;
		try {
			names = new Set(readdirSync(dir));
		} catch {
			// Not a directory, or missing.
		}
		listings.set(dir, names);
	}
	return listings.get(dir);
}

/** Whether a slash-separated path under root exists with exactly this case. */
function existsExactly(relative) {
	let current = root;
	for (const part of relative.split('/').filter(Boolean)) {
		if (!entries(current)?.has(part)) return false;
		current = path.join(current, part);
	}
	return true;
}

function isFile(relative) {
	return existsExactly(relative) && statSync(path.join(root, relative)).isFile();
}

/** Mirrors how GitHub Pages resolves a request path to a file. */
function resolves(urlPath) {
	if (urlPath.endsWith('/')) return isFile(`${urlPath}index.html`);
	return isFile(urlPath) || isFile(`${urlPath}/index.html`) || isFile(`${urlPath}.html`);
}

function htmlFiles(dir) {
	return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
		const full = path.join(dir, entry.name);
		if (entry.isDirectory()) return htmlFiles(full);
		return entry.name.endsWith('.html') ? [full] : [];
	});
}

const linkPattern = /\b(?:href|src)="([^"]*)"|http-equiv="refresh" content="\d+;\s*url=([^"]*)"/g;
const broken = new Set();

for (const file of htmlFiles(root)) {
	const pagePath = `/${path.relative(root, file).split(path.sep).join('/')}`;
	const html = readFileSync(file, 'utf8');
	for (const match of html.matchAll(linkPattern)) {
		const link = (match[1] ?? match[2]).replaceAll('&amp;', '&');
		// Anything with a scheme or host is external; skip in-page anchors too.
		if (!link || link.startsWith('#') || link.startsWith('//') || /^[a-z][a-z\d+.-]*:/i.test(link)) {
			continue;
		}
		const { pathname } = new URL(link, `https://site.invalid${pagePath}`);
		if (!resolves(decodeURIComponent(pathname))) broken.add(`${pagePath}: ${link}`);
	}
}

if (broken.size > 0) {
	console.error(`Found ${broken.size} broken internal link(s):`);
	for (const line of broken) console.error(`  ${line}`);
	process.exit(1);
}
console.log('All internal links resolve.');
