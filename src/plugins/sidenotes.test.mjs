// Runs Markdown through the same Sätteri pipeline the site uses, so a change in
// its footnote markup after an Astro upgrade fails here instead of on a post.
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createSatteriMarkdownProcessor } from '@astrojs/markdown-satteri';
import { sidenotes } from './sidenotes.mjs';

const processor = await createSatteriMarkdownProcessor({ hastPlugins: [sidenotes()] });
const plain = await createSatteriMarkdownProcessor();
const render = async (/** @type {string} */ markdown) => (await processor.render(markdown, {})).code;

test('paragraph footnotes become sidenotes and the footnote section goes away', async () => {
	const html = await render(
		'A claim.[^cox] Another.[^two]\n\n[^cox]: Cox and McCubbins, *Setting the Agenda*.\n[^two]: First.\n\n    Second.\n',
	);
	assert.match(html, /<sup class="sidenote-ref" id="user-content-fnref-cox">1<\/sup>/);
	assert.match(
		html,
		/<span class="sidenote" id="user-content-fn-cox" role="note"><span class="sidenote-number">1<\/span> Cox and McCubbins, <em>Setting the Agenda<\/em>\.<\/span>/,
	);
	assert.match(html, /First\.<br>Second\.<\/span>/);
	assert.doesNotMatch(html, /data-footnote|class="footnotes"|↩/);
});

test('a footnote with a list stays at the end and keeps its number', async () => {
	const html = await render('One.[^a] Two.[^list]\n\n[^a]: Simple.\n[^list]: A list:\n\n    - item\n');
	assert.match(html, /<span class="sidenote" id="user-content-fn-a"/);
	assert.match(html, /<a href="#user-content-fn-list"[^>]*data-footnote-ref/);
	assert.match(html, /<li id="user-content-fn-list" value="2">/);
	assert.doesNotMatch(html, /<li id="user-content-fn-a"/);
});

test('posts without footnotes are unchanged', async () => {
	const markdown = 'No notes here, just a [link](https://example.com) and a list:\n\n- one\n- two\n';
	assert.equal(await render(markdown), (await plain.render(markdown, {})).code);
});
