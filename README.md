<div align="center">
  <img width="10%" src="https://raw.githubusercontent.com/0x7s0lt1/WGAF_next/main/public/img/eye.png">
  <h1>WGA in Frame</h1>
  <p>Random content from <a href="https://www.wga.hu/">wga.hu</a></p>
</div>

<br/>
<br/>
<br/>

Install dependencies:
```
pnpm install
```

Run the development server:
```
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Catalogue

The artwork list comes from the [WGA catalogue download](https://www.wga.hu/database/download/index.html),
split into small per-category shards in `public/json/catalog/` so the frame only downloads the part it needs.
Images are loaded straight from wga.hu.

To refresh it from wga.hu:
```
pnpm catalog
```
or build from a downloaded `data_txt.zip` / `catalog.txt`:
```
pnpm catalog path/to/data_txt.zip
```

### Colour palettes

The palette strip and the colour filter need each artwork's colours. wga.hu doesn't let the browser read its
images, so they're computed ahead of time: `pnpm palettes` downloads every artwork's small thumbnail (~10 KB) once,
extracts its main colours and stores them in the same catalogue shards, plus `colors.json` for the filter.
`pnpm catalog` keeps existing palettes when it rebuilds, so only new artworks need computing afterwards.

```
pnpm palettes
```

| Option | Default | What it does |
|---|---|---|
| `--slow` | off | Go easier on wga.hu: 3 requests/s, 2 at a time (a full run takes ~5 h instead of ~1.5 h). |
| `--rate <n>` | `10` (`3` with `--slow`) | Maximum requests per second, all downloads together. |
| `--concurrency <n>` | `4` (`2` with `--slow`) | How many downloads run at the same time. |
| `--limit <n>` | all | Only compute this many palettes, e.g. to try it out. |
| `--category <ids>` | all | Only these categories, comma-separated: `painting`, `sculpture`, `architecture`, `graphics`, `illumination`, `ceramics`, `furniture`, `glassware`, `metalwork`, `mosaic`, `stained-glass`, `tapestry`, `others`. |
| `--shuffle` | off | Random order instead of catalogue order, so a partial run (or `--limit`) covers every category evenly. |
| `--retry-failed` | off | Try again the artworks that failed on an earlier run (missing image, network error). Normally they're skipped. |
| `--apply` | off | No downloads: just write what's in the progress file into the catalogue. Useful to publish partial progress while a run is still going. |

Options can be combined:
```
pnpm palettes --limit 200 --category tapestry      # quick try on one category
pnpm palettes --shuffle --limit 5000               # a first pass spread over everything
pnpm palettes --slow --retry-failed                # gently retry what failed before
pnpm palettes --rate 5 --concurrency 2             # your own speed
```
(With npm, put `--` before the options: `npm run palettes -- --slow`.)

**Stopping and resuming:** progress is saved to `.cache/palettes.json` every 250 artworks (git-ignored). Press Ctrl+C
once to finish the downloads in flight and write the catalogue, twice to quit at once (the last save is kept).
Running `pnpm palettes` again continues where it stopped.

**Being polite:** if wga.hu answers "too many requests" (HTTP 429/503), the speed is halved for the rest of the run
and its requested wait (`Retry-After`, up to a minute) is respected. If it blocks the requests (HTTP 403), the run stops and saves its progress.
