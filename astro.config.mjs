// @ts-check
import sitemap from '@astrojs/sitemap';
import { defineConfig, fontProviders } from 'astro/config';

const archiveSlugs = [
	'new-blogging-start',
	'Statistics-of-Income-Data-is-Great',
	'A-Few-thoughts-on-the-IRS-targeting',
	'lack-of-predictability-in-executive-action',
	'remorse-racist-politicians-forgiveness',
	'tool-driven-revolutions-in-the-social-sciences',
	'Boehner-should-take-revenge',
	'context-on-sanders-amendment',
	'Senate-Republicans-blocked-amendments-to-Keystone-bill',
	'cant-give-credit-where-credit-is-due',
	'changing-Senate-Rules-is-no-big-deal',
	'no-need-to-protect-president-on-keystone',
	'why-boehner-will-keep-his-job',
	'parables-in-record',
	'congressional-ethics-as-warfare',
	'slides-nullification',
	'what-if-sanders-starts-winning',
	'analogy-taken-far',
	'fall-syllabus',
	'big-questions',
	'professional-update',
	'slides-minimumwage',
];

/** @type {Record<string, string>} */
const archiveRedirects = {};
for (const slug of archiveSlugs) {
	archiveRedirects[`/${slug}/`] = `/archive/${slug}/`;
}

// https://astro.build/config
export default defineConfig({
	site: 'https://adamolson.org',
	integrations: [sitemap()],
	redirects: {
		// The five technical posts kept as first-class blog content, retitled with clean slugs.
		'/post_about_maps/': '/blog/mapping-data-in-r/',
		'/nominate_time/': '/blog/plotting-dw-nominate-over-time/',
		'/Benford-and-Election-Fraud/': '/blog/benford-law-election-fraud/',
		'/ParmQuery/': '/blog/sql-in-r-with-odbc/',
		'/gganimateDW/': '/blog/animating-dw-nominate-with-gganimate/',
		// Everything else moves into the dated archive at the same slug.
		...archiveRedirects,
	},
	fonts: [
		{
			provider: fontProviders.google(),
			name: 'Fraunces',
			cssVariable: '--font-heading',
			fallbacks: ['Georgia', 'serif'],
			weights: [500, 600, 700],
		},
		{
			provider: fontProviders.google(),
			name: 'Source Serif 4',
			cssVariable: '--font-body',
			fallbacks: ['Georgia', 'serif'],
			weights: [400, 600],
			styles: ['normal', 'italic'],
		},
	],
});
