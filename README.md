# Beyond Relics — Abandoned, But Not Forgotten

**Beyond Relics** is an evidence-led digital archive about spacecraft, landers, rovers, scientific instruments, and mission hardware that remain after exploration missions move on. It connects the physical legacy of space exploration with the public records that preserve each mission's story.

## Explore the project

- **Home:** editorial introduction to the archive.
- **Artifacts:** browse mission hardware and surviving spacecraft.
- **Artifact details:** read each object's role, mission context, and legacy.
- **NASA Data Lab:** explore selected NASA archive releases, source records, and live NASA image-library search.
- **Mission timeline:** follow key milestones across decades of exploration.
- **The Story:** a visual, chapter-based narrative.
- **About:** project purpose and research approach.

## Research principles

1. **Primary sources first.** Curated entries link to NASA mission pages, NASA science data releases, or the relevant archive.
2. **Separate fact from interpretation.** Archive-release dates are not presented as mission dates, and a dataset is not described as a newly discovered physical artifact.
3. **No invented measurements.** The project only displays numerical scientific metadata when it is supported by the cited source. It does not fabricate telemetry or scientific findings.
4. **Traceability.** Each research record includes a source page and a direct archive destination where available.
5. **Respect the source.** NASA image search results are retrieved from NASA's public Images and Video Library API and link to the original NASA record.

## Technology

- Semantic HTML5
- CSS3 responsive layouts and motion-aware presentation
- Vanilla JavaScript (no build step)
- JSON research and archive records
- NASA Images and Video Library API
- GitHub Pages static hosting

## Run locally

Because the site loads JSON with `fetch()`, serve the repository through a local HTTP server rather than opening HTML files directly.

For example, with Python installed:

```bash
python -m http.server 8000
```

Then open `http://localhost:8000/`.

## Repository structure

```text
-Beyond-Relics/
├── index.html
├── data.html
├── artifacts.html
├── artifact-details.html
├── timeline.html
├── comic.html
├── about.html
├── 404.html
├── css/
├── js/
├── data/
└── assets/
```

## Project status

An educational research and storytelling project. It is not an official NASA product and is not affiliated with or endorsed by NASA.
