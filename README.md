# Beyond Relics — Abandoned, But Not Forgotten

**Beyond Relics** is an independent, evidence-led storytelling archive for NASA Space Apps Challenge 2026, Challenge 01: **“Abandoned but Not Forgotten: Storytelling about NASA’s Discarded Equipment on the Moon and Mars.”**

## Project

Space hardware has a second story. When a lander stops transmitting or a rover can no longer move, its physical remains and scientific legacy continue to matter. Beyond Relics helps school-age explorers discover what a machine was built to do, what stayed behind, what scientists learned, and why the mission still matters.

**Live experience:** https://mariam2009m44-lab.github.io/-Beyond-Relics/

## Explore the experience

- **Home:** featured mission stories with NASA Image and Video Library photographs when the service returns a matching image; original vector illustrations remain as a fallback.
- **Artifacts:** searchable and filterable archive by destination and mission status.
- **Artifact details:** mission purpose, what remained, science legacy, design life versus actual outcome, NASA imagery, and primary source links.
- **Challenge Brief:** solution overview, judging alignment, research integrity, demo route, and AI-use disclosure.
- **NASA Data Lab:** selected research context and live search of NASA’s public image library.
- **Timeline:** key mission milestones.
- **The Story:** short visual chapters generated from the archive records.
- **About:** project purpose and research approach.

## Research integrity

1. **Primary sources first:** records link to NASA mission pages, NASA history, and NASA technical archives.
2. **No false “abandoned” labels:** active missions such as Curiosity and Voyager are explicitly marked as comparisons, not abandoned surface artifacts.
3. **Physical remains versus data archive:** the project distinguishes hardware left on another world from scientific records preserved on Earth.
4. **No invented telemetry:** the site does not pretend to track or reconstruct live spacecraft data.
5. **Audience-first storytelling:** each artifact answers four questions in plain language: purpose, remains, discovery, and legacy.
6. **Image provenance:** live photographs are retrieved from NASA’s public Image and Video Library and link to their NASA record. If the service is unavailable, the site keeps its original vector artwork rather than showing a broken image.

## Technology

- Semantic HTML5 and responsive CSS
- Vanilla JavaScript (no build step)
- JSON-driven mission records
- NASA Image and Video Library API (images-api.nasa.gov)
- GitHub Pages static hosting

## AI-use disclosure

ChatGPT assisted with code development and editorial refinement. Mission facts are linked to primary NASA sources and must be checked by the project team. NASA archive imagery is retrieved from NASA’s public Image and Video Library; the project does not present AI-generated images as NASA photographs.

## Run locally

```bash
python -m http.server 8000
```

Open http://localhost:8000/.

## Project integrity

Beyond Relics is an independent educational project. It is not an official NASA product and is not affiliated with or endorsed by NASA. The archive is curated, not a complete inventory of all human-made objects in space.
