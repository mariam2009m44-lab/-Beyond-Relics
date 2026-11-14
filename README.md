# Beyond Relics — Abandoned, But Not Forgotten

**Beyond Relics** is an independent, evidence-led storytelling archive for NASA Space Apps Challenge 2026, Challenge 01: **“Abandoned but Not Forgotten: Storytelling about NASA’s Discarded Equipment on the Moon and Mars.”**

## Project

Space hardware has a second story. When a lander stops transmitting or a rover can no longer move, its physical remains and scientific legacy continue to matter. Beyond Relics helps school-age explorers discover what a machine was built to do, what stayed behind, what scientists learned, and why the mission still matters.

**Live experience:** https://mariam2009m44-lab.github.io/-Beyond-Relics/

## Explore the experience

- **Home:** featured mission stories with NASA Image and Video Library photographs selected by mission relevance; original vector illustrations remain as a fallback. A lightweight cinematic motion layer adds orbital scenery, subtle planet parallax, animated archive artwork, and scroll progress. An accessible four-question Mission Investigator quiz turns mission facts into a source-linked learning activity.
- **Artifacts:** searchable and filterable archive by destination and mission status, with NASA photographs and linked image-record IDs.
- **Artifact details:** mission purpose, what remained, science legacy, design life versus actual outcome, NASA imagery, and primary source links.
- **Challenge Brief:** solution overview, judging alignment, research integrity, demo route, and AI-use disclosure.
- **NASA Data Lab:** selected research context, live NASA image search, an interactive Apollo passive-seismic network explorer, a GeoCSV waveform lab for real Apollo 12 PSE observations from NASA PDS, and an InSight instrument explorer with documented SEIS, HP³, and RISE outcomes.
- **Timeline:** key mission milestones with NASA mission photographs and source-record links.
- **The Story:** immersive, large-format photographic chapters, a user-initiated cinematic opening score, and distinct original musical motifs for each mission.
- **About:** project purpose and research approach.

## Research integrity

1. **Primary sources first:** records link to NASA mission pages, NASA history, and NASA technical archives.
2. **No false “abandoned” labels:** active missions such as Curiosity and Voyager are explicitly marked as comparisons, not abandoned surface artifacts.
3. **Physical remains versus data archive:** the project distinguishes hardware left on another world from scientific records preserved on Earth.
4. **No invented telemetry:** the ALSEP locator uses documented station coordinates and instrument metadata. The separate waveform lab reads a real NASA PDS GeoCSV observation file (or a user-selected PDS GeoCSV file), plots the parsed numeric observations, and calculates descriptive statistics. It does not label events or infer scientific causes.
5. **Audience-first storytelling:** each artifact answers four questions in plain language: purpose, remains, discovery, and legacy.
6. **Dataset provenance:** ALSEP station coordinates are sourced from NASA RP-1036; passive-seismic instrument type and sample rates are sourced from NASA PDS instrument metadata. The InSight explorer uses NASA-published instrument specifications and clearly identifies HP³’s incomplete deployment. The Pathfinder explorer separates its documented mission statistics from its original explanatory schematic. Diagrams are not mission photographs or telemetry.
7. **Image provenance:** photographs are retrieved live from NASA’s public Image and Video Library, selected using mission-specific queries, and labeled with NASA record IDs. If the service is unavailable, the site keeps its original artwork rather than showing broken images.
8. **Original soundtrack:** the cinematic score is synthesized by the project with the Web Audio API. It is not a recording from the Moon or Mars. Visitors explicitly start the story audio; it does not autoplay.


## Global judging readiness — data requirement

The NASA Space Apps Global Organizing Team clarified that Global Award eligibility requires meaningful use of at least one NASA data source listed in the Resources tab for the selected challenge. Mission facts, NASA photographs, and citations alone do not automatically meet this requirement.

Beyond Relics links the NASA PDS Apollo Seismic Data Bundle and includes an Apollo 12 waveform lab that attempts to load a specific real GeoCSV observation from PDS, with a local-file import fallback. It plots the values read from the selected archive file and calculates descriptive statistics. The browser-level loading and parsing still need to be verified against the source file before the team presents it as a tested feature. The project team must also retain evidence that the Apollo PSE resource is included in the exact Challenge 01 Resources list and identify it in the submission.

For a strong data demonstration, the final experience should identify the qualifying resource, show the exact data fields/products used, explain any processing, and connect the resulting observation to a story about the hardware. The waveform lab is a visualization and descriptive-statistics feature, not a seismic-event detector. Keep all derived visuals labelled as processed data, and never label an illustrative schematic as telemetry.


## Final submission checklist

Before submitting, use [`docs/FINAL-SUBMISSION.md`](docs/FINAL-SUBMISSION.md). It records the official Global Judging gates, the unresolved Challenge 01 Resources match, the current data limitations, AI/asset disclosure requirements, and a 30-second demo outline. Do not claim Global Award data eligibility until the qualifying Challenge 01 NASA resource is identified and its actual use is demonstrated.

For the judge-facing walkthrough, use [`docs/DEMO-SCRIPT.md`](docs/DEMO-SCRIPT.md), which contains a timed 30-second narration, screen sequence, seven-slide fallback, and accuracy gates.

## Technology

- Semantic HTML5 and responsive CSS, with a lightweight JavaScript/CSS cinematic motion system that respects reduced-motion preferences
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
