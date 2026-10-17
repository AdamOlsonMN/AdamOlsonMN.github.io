// Turns Markdown footnotes ([^1]) into Tufte-style sidenotes for the Sätteri
// pipeline. Each note moves next to its reference as a span that global.css
// floats into the right margin on wide screens and shows below the line on
// narrow ones. Notes containing more than plain paragraphs (a list, a code
// block) stay ordinary footnotes at the end of the post, keeping their numbers.

/** @param {any} node @param {string} [tagName] */
function isElement(node, tagName) {
	return node?.type === 'element' && (!tagName || node.tagName === tagName);
}

/** Copies a hast node into a plain object that can be inserted elsewhere. */
function clone(/** @type {any} */ node) {
	/** @type {any} */
	const copy = { type: node.type };
	if (node.tagName) copy.tagName = node.tagName;
	if (node.properties) copy.properties = { ...node.properties };
	if ('value' in node) copy.value = node.value;
	if (node.children) copy.children = node.children.map(clone);
	return copy;
}

/** @param {any} node @returns {any} */
function findFootnotes(node) {
	if (isElement(node, 'section') && node.properties?.dataFootnotes !== undefined) return node;
	for (const child of node.children ?? []) {
		const found = findFootnotes(child);
		if (found) return found;
	}
	return undefined;
}

/** Inline content for a footnote made only of paragraphs, else null. */
function inlineContent(/** @type {any} */ item) {
	const blocks = item.children.filter(
		(/** @type {any} */ child) => !(child.type === 'text' && !child.value.trim()),
	);
	if (!blocks.every((/** @type {any} */ block) => isElement(block, 'p'))) return null;
	/** @type {any[]} */
	const content = [];
	blocks.forEach((/** @type {any} */ paragraph, /** @type {number} */ i) => {
		if (i > 0) content.push({ type: 'element', tagName: 'br', properties: {}, children: [] });
		for (const child of paragraph.children) {
			const isBackref = isElement(child, 'a') && child.properties?.dataFootnoteBackref !== undefined;
			if (!isBackref) content.push(clone(child));
		}
	});
	// Drop the space that separated the text from the removed back-reference.
	const last = content.at(-1);
	if (last?.type === 'text') last.value = last.value.trimEnd();
	return content;
}

/** @param {string} tagName @param {string[]} className @param {any[]} children @param {object} [extra] */
function element(tagName, className, children, extra = {}) {
	return { type: 'element', tagName, properties: { className, ...extra }, children };
}

export function sidenotes() {
	return () => {
		/** @type {Map<string, any[]>} Footnote id → its inline content. */
		const notes = new Map();
		/** @type {Map<string, number>} Footnote id → its original number. */
		const numbers = new Map();
		let convertAll = false;

		return {
			name: 'sidenotes',
			before(/** @type {any} */ root) {
				const list = findFootnotes(root)?.children.find((/** @type {any} */ c) => isElement(c, 'ol'));
				const items = (list?.children ?? []).filter((/** @type {any} */ c) => isElement(c, 'li'));
				items.forEach((/** @type {any} */ item, /** @type {number} */ i) => {
					const id = String(item.properties.id);
					numbers.set(id, i + 1);
					const content = inlineContent(item);
					if (content) notes.set(id, content);
				});
				convertAll = items.length > 0 && notes.size === items.length;
			},
			element: [
				{
					filter: ['sup'],
					visit(/** @type {any} */ node, /** @type {any} */ ctx) {
						const link = node.children.find((/** @type {any} */ c) => isElement(c, 'a'));
						if (link?.properties?.dataFootnoteRef === undefined) return;
						const id = String(link.properties.href).replace(/^#/, '');
						const content = notes.get(id);
						if (!content) return;
						const number = ctx.textContent(link);
						ctx.replaceNode(node, [
							element('sup', ['sidenote-ref'], [{ type: 'text', value: number }], {
								id: link.properties.id,
							}),
							element(
								'span',
								['sidenote'],
								[
									element('span', ['sidenote-number'], [{ type: 'text', value: number }]),
									{ type: 'text', value: ' ' },
									...content,
								],
								{ id, role: 'note' },
							),
						]);
					},
				},
				{
					filter: ['section'],
					visit(/** @type {any} */ node, /** @type {any} */ ctx) {
						if (convertAll && node.properties?.dataFootnotes !== undefined) ctx.removeNode(node);
					},
				},
				{
					filter: ['li'],
					visit(/** @type {any} */ node, /** @type {any} */ ctx) {
						if (convertAll) return; // The whole section is already gone.
						const id = String(node.properties?.id);
						if (notes.has(id)) ctx.removeNode(node);
						else if (numbers.has(id)) ctx.setProperty(node, 'value', numbers.get(id));
					},
				},
			],
		};
	};
}
