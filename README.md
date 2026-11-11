# Beyond Relics — Abandoned, But Not Forgotten

An interactive educational space archive exploring spacecraft, landers, rovers, and scientific equipment left across the Moon, Mars, and deep space.

## Project experience

- **The Archive:** browse spacecraft and scientific artifacts.
- **Artifact Details:** learn each machine's purpose, mission, and legacy.
- **Mission Timeline:** follow milestones across decades of exploration.
- **Cinematic Story:** explore a short chapter-based visual story.
- **About:** understand the educational goal behind the archive.

## Technology

- HTML5 for page structure
- CSS3 for the visual system, layouts, and responsive design
- Vanilla JavaScript for navigation and interactions
- JSON files for structured archive and mission data
- GitHub Pages for static hosting

## Repository structure

```text
-Beyond-Relics/
├── index.html
├── about.html
├── artifacts.html
├── artifact-details.html
├── comic.html
├── timeline.html
├── 404.html
├── css/
│   ├── style.css
│   ├── home.css
│   └── responsive.css
├── js/
│   ├── main.js
│   ├── artifacts.js
│   ├── comic.js
│   └── timeline.js
├── data/
│   ├── artifacts.json
│   ├── missions.json
│   ├── timeline.json
│   └── comic-chapters.json
├── assets/
│   ├── images/
│   ├── icons/
│   ├── fonts/
│   └── logos/
├── components/
└── docs/
```

## Run locally

Open `index.html` in a browser, or use a local static web server. No build step or package installation is required.

## Add project images

Place image files in the matching folder under `assets/images/`, then reference them with relative paths such as:

```html
<img src="assets/images/artifacts/lunar-module.jpg" alt="Lunar Module">
```

The current interface uses CSS-based placeholder artwork until the project's selected photographs and illustrations are added.

## Publishing with GitHub Pages

1. Open the repository **Settings**.
2. Select **Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**.
4. Select branch **main** and folder **/(root)**.
5. Save and wait for the deployment to finish.

## Content accuracy

This is an educational project. Verify mission dates, mission status, technical descriptions, and image credits against official NASA mission sources before public release. Do not imply that every artifact is still operational.

## License

No license has been selected yet. Until a license is added, the repository's contents remain under the default copyright terms.
