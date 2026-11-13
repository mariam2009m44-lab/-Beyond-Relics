# Beyond Relics — Abandoned, But Not Forgotten

**Beyond Relics** is an independent, evidence-led storytelling archive developed for NASA Space Apps Challenge 2026 Challenge 01: **“Abandoned but Not Forgotten: Storytelling about NASA’s Discarded Equipment on the Moon and Mars.”**

## The idea

Space hardware has a second story. When a lander stops transmitting or a rover can no longer move, its physical remains and scientific legacy continue to matter. Beyond Relics helps school-age explorers discover what a machine was built to do, what stayed behind, what scientists learned, and why the mission still matters.

## Explore

- **Home:** introduction and featured mission artifacts.
- **Artifacts:** searchable and filterable archive by destination and mission status.
- **Artifact details:** mission purpose, what remained, science legacy, design life vs actual outcome, NASA imagery, and primary source links.
- **Challenge Brief:** project solution, comparison with 2025 global winners, judging alignment, and a suggested demonstration flow.
- **NASA Data Lab:** selected 2026 NASA archive releases and live search of NASA's public image library.
- **Timeline:** key mission milestones.
- **The Story:** short visual chapters generated from the archive records.
- **About:** project purpose and research approach.

## What makes the archive careful

1. **Primary sources first:** artifact records link to NASA mission pages, NASA history, or NASA technical archives.
2. **No false “abandoned” labels:** active missions such as Curiosity and Voyager are explicitly marked as active comparisons.
3. **Physical remains vs data archive:** the project distinguishes hardware left on another world from scientific records preserved on Earth.
4. **No invented telemetry:** numerical claims are limited to values supported by cited sources; the site does not pretend to track or reconstruct live spacecraft data.
5. **Audience-first storytelling:** every artifact answers four questions in plain language: purpose, remains, discovery, and legacy.

## Technology

- Semantic HTML5 and responsive CSS
- Vanilla JavaScript (no build step)
- JSON-driven mission records
- NASA Images and Video Library API
- GitHub Pages static hosting

## Run locally

```bash
python -m http.server 8000
```

Open `http://localhost:8000/`.

## Project integrity

Beyond Relics is an independent educational project. It is not an official NASA product and is not affiliated with or endorsed by NASA. The archive is curated, not a complete inventory of all human-made objects in space.
