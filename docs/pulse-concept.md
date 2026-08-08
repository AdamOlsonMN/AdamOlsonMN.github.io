# World Pulse — concept sketch

A living page at `/pulse` (`src/pages/pulse.astro`), reachable by direct URL,
not yet linked from navigation. This doc is the "here's what to evaluate"
writeup — the page itself is deliberately minimal so the concept is easy to
look at and decide on before any more time goes into it.

## What GDELT actually is

The [GDELT Project](https://www.gdeltproject.org/) monitors news coverage
from essentially every country, in 65 languages (machine-translated), and
re-processes it into structured data continuously. The relevant piece here
is the free [DOC 2.0 API](https://blog.gdeltproject.org/gdelt-doc-2-0-api-debuts/):
full-text search over a rolling window of recent global coverage, with
several "modes" beyond plain article search — a coverage-volume timeline,
a sentiment/tone timeline, tone histograms, breakdowns by source country or
language, and more. No API key, no auth, and — the detail that makes this
possible as a static-site page at all — **CORS is wildcard-open**, so a
plain client-side `fetch()` from a static Astro page works with no backend.
The tradeoff: it's rate-limited, and **the real limit is stricter and
burstier than the "~1 request/5s" the API itself advertises in its 429
response** — testing after the first version shipped found requests still
getting 429'd with 15s+ gaps between them. The page now treats this as a
real failure mode rather than something a fixed delay reliably avoids:
exponential-backoff retry specifically on HTTP 429 (not just a bigger fixed
delay), plus an hour-long localStorage cache per topic so a repeat page
load doesn't re-hit GDELT at all. See `REQUEST_DELAY_MS` / `MAX_RETRIES` /
`RETRY_BASE_DELAY_MS` / `CACHE_TTL_MS` in the page's script.

## What the current sketch shows

One mode only: `timelinevol` — for each of three example topics
(`inflation`, `artificial intelligence`, `immigration`, easily swapped —
see the `TOPICS` array at the top of the page's script), the daily percentage
of all GDELT-monitored articles worldwide that mentioned it, over the
trailing 30 days. That percentage is itself the interesting number: it's not
"how many articles," it's "what share of everything happening in the news
right now is this," which is a genuinely different (and more comparable
across topics and over time) measure than a raw article count.

The three topics load sequentially with a delay between fresh requests
rather than all at once, so the chart fills in progressively on page load
— longer than the original ~15-20s estimate now that the delay and retry
backoff are more conservative, but a cached repeat visit within an hour
loads instantly with no GDELT requests at all. That's a real constraint of
the free tier, not a bug.

## What this could grow into, if the core idea lands

None of this is built yet — flagging it here rather than building it
speculatively:

- **Tone timeline** (`mode=timelinetone`) — is coverage of a topic trending
  more positive or negative right now? Layered against the volume chart,
  this starts to answer "is the world just *talking about* X more, or has
  the *framing* of X actually shifted" — which is a much sharper
  data-journalism question than volume alone.
- **Source-country breakdown** (`mode=timelinesourcecountry`) — which
  countries' media are covering a topic most. This is the "who's talking
  about this, specifically" angle GDELT is uniquely positioned to answer,
  and it's a natural fit for a map or small-multiples view.
- **A configurable topic list** instead of three hardcoded strings — a
  simple text input, so this becomes a general-purpose "check what the
  world's coverage of X looks like right now" tool rather than three fixed
  charts.
- **A "top articles" panel** (`mode=artlist`) for one-click drill-down from
  a spike in the chart to the actual stories driving it. Deliberately left
  out of this sketch — it's a second GDELT mode with its own rate-limited
  request, and the JSON shape wasn't live-verified while building this
  (the timeline mode's shape was; see below), so it needs its own pass
  rather than being bolted on unverified.

## Where this could feed newsdesk

`data-sources.md` already lists GDELT as "good for 'what's the world
talking about' angles" but nothing currently uses it. If this page (or its
underlying fetch logic) proves useful, the natural next step isn't really
"make the dashboard prettier" — it's wiring a GDELT check into
`/pitch-meeting` itself: when a candidate pitch's topic shows a real volume
or tone spike this week, that's a concrete, checkable "why now" the rubric
already asks for, sourced independently of HN/Memeorandum/KFF/Abnormal
Returns. That would need a small non-browser fetch path (Node script or
inline WebFetch calls during the skill run, not this client-side page), so
it's a related but separate piece of work from the dashboard itself.

## Honesty note on verification

The `timelinevol` JSON shape used in the page's parsing code
(`{ timeline: [{ series, data: [{ date, value }] }] }`) was confirmed with a
live `curl` against the real API while building this — that part is solid.
Field names for other modes (tone, source-country, article list) referenced
above as future extensions were **not** live-verified and are sourced from
API documentation and a third-party Python client's README rather than a
direct response — treat those as "probably right, confirm before building."
