# Beyond Relics — Asset Register

Last reviewed: 16 November 2026.

This register distinguishes confirmed technical dependencies from assets whose original author, source, or license still needs confirmation. An entry marked **UNVERIFIED** is not permission to redistribute it. Do not describe an asset as NASA-original, public domain, AI-generated, or team-created unless its provenance has been checked.

## Interactive 3D visualizations

| Asset | Creator / source | License | Modifications / fidelity |
|---|---|---|---|
| Procedural artifact geometry in `js/artifact-3d-explorer.js` | Project implementation; contributors must be credited in the project README | Original project code; confirm team authorship before external reuse | Procedural educational geometry. All models are **Artistic visualization**, not NASA scans, engineering CAD, or scale-accurate replicas. |
| Interactive comic-world geometry in `js/comic-world-3d.js` | Project implementation; contributors must be credited in the project README | Original project code; confirm team authorship before external reuse | Procedural Mars lander/rover and deep-space probe environments. **Artistic reconstruction**; the original comic panels remain unchanged 2D artwork. |
| Three.js 0.159.0 runtime | Three.js project — https://threejs.org/ | MIT — https://github.com/mrdoob/three.js/blob/dev/LICENSE | Loaded from jsDelivr CDN; no local modifications. |

| Official Voyager 1 3D model (GLB) | NASA / Michael D. Carbajal — https://science.nasa.gov/3d-resources/voyager-probe-b/ | NASA 3D Resources usage guidance — https://www.nasa.gov/nasa-brand-center/images-and-media/ | Original NASA-provided GLB loaded at runtime; displayed as an official NASA 3D model, not a physical scan. |
| Apollo Lunar Module 3D model (GLB) | NASA / Michael D. Carbajal — https://science.nasa.gov/3d-resources/apollo-lunar-module/ | NASA 3D Resources usage guidance — https://www.nasa.gov/nasa-brand-center/images-and-media/ | Original NASA-provided GLB loaded at runtime for the Apollo 11 Lunar Module record; displayed as an official NASA 3D model, not a physical scan. |
| InSight Lander 3D model (GLB) | NASA / Brian E. Kumanchik — https://science.nasa.gov/3d-resources/insight-cruise-lander/ | NASA 3D Resources usage guidance — https://www.nasa.gov/nasa-brand-center/images-and-media/ | Original NASA-provided GLB loaded at runtime for the InSight record; landed configuration with arm deployed. |
| Opportunity Rover 3D model (GLB) | NASA / Ames Research Center — https://science.nasa.gov/3d-resources/mars-exploration-rover-opportunity-mer-b/ | NASA 3D Resources usage guidance — https://www.nasa.gov/nasa-brand-center/images-and-media/ | Original NASA-provided GLB loaded at runtime for the Opportunity record. |
| Spitzer Space Telescope 3D model (GLB) | NASA / Janice C. Lee; NASA / Robert L. Hurt — https://science.nasa.gov/3d-resources/spitzer-space-telescope/ | NASA 3D Resources usage guidance — https://www.nasa.gov/nasa-brand-center/images-and-media/ | Original NASA-provided GLB loaded at runtime for the Spitzer record. |
| Pioneer 10 3D model (GLB) | NASA/JPL/Eyes on the Solar System — https://science.nasa.gov/3d-resources/pioneer/ | NASA 3D Resources usage guidance — https://www.nasa.gov/nasa-brand-center/images-and-media/ | Original NASA-provided Pioneer 10 GLB loaded for the combined Pioneer 10 & 11 archive record; the displayed model represents Pioneer 10 only, not Pioneer 11. |
| Model viewer runtime | Google model-viewer — https://modelviewer.dev/ | Apache-2.0 — https://github.com/google/model-viewer/blob/master/LICENSE | Loaded as a browser module from Google CDN; no local modifications. |

## NASA mission imagery

| Asset group | Source | License / usage | Modifications |
|---|---|---|---|
| Dynamically retrieved mission photographs in `js/nasa-images.js` | NASA Image and Video Library API — https://images.nasa.gov/ | Check the individual NASA record, creator, and any third-party credit/restriction for every selected image. NASA material is not automatically unrestricted. | Retrieved at runtime; displayed with NASA record identifier. Preserve individual source-record links and credit lines. |

## Story/comic panels

These 49 local image filenames are referenced by `story_artwork` in `data/artifacts.json`. Their author, original source, creation method, and reuse license are **UNVERIFIED** in the repository at this review. Confirm whether each panel is original team work, AI-generated, or based on third-party material before public distribution. If any panel is AI-generated for the NASA Space Apps project, follow the official challenge clarification on visible AI labeling/watermarking and prohibited generated NASA identifiers.

| Mission record | File | Author / source | License |
|---|---|---|---|
| Mars Pathfinder & Sojourner | `IMG-20261114-WA0570.jpg` | UNVERIFIED — confirm with team | UNVERIFIED — do not assume reuse rights |
| Mars Pathfinder & Sojourner | `IMG-20261114-WA0554.jpg` | UNVERIFIED — confirm with team | UNVERIFIED — do not assume reuse rights |
| Mars Pathfinder & Sojourner | `IMG-20261114-WA0550(1).jpg` | UNVERIFIED — confirm with team | UNVERIFIED — do not assume reuse rights |
| Mars Pathfinder & Sojourner | `IMG-20261114-WA0571(1).jpg` | UNVERIFIED — confirm with team | UNVERIFIED — do not assume reuse rights |
| Mars Pathfinder & Sojourner | `IMG-20261114-WA0567(1).jpg` | UNVERIFIED — confirm with team | UNVERIFIED — do not assume reuse rights |
| Mars Pathfinder & Sojourner | `IMG-20261114-WA0561(1).jpg` | UNVERIFIED — confirm with team | UNVERIFIED — do not assume reuse rights |
| Mars Pathfinder & Sojourner | `IMG-20261114-WA0568.jpg` | UNVERIFIED — confirm with team | UNVERIFIED — do not assume reuse rights |
| Mars Pathfinder & Sojourner | `IMG-20261114-WA0566.jpg` | UNVERIFIED — confirm with team | UNVERIFIED — do not assume reuse rights |
| Mars Pathfinder & Sojourner | `IMG-20261114-WA0556.jpg` | UNVERIFIED — confirm with team | UNVERIFIED — do not assume reuse rights |
| Mars Pathfinder & Sojourner | `IMG-20261114-WA0552(1).jpg` | UNVERIFIED — confirm with team | UNVERIFIED — do not assume reuse rights |
| Mars Pathfinder & Sojourner | `IMG-20261114-WA0560.jpg` | UNVERIFIED — confirm with team | UNVERIFIED — do not assume reuse rights |
| Mars Pathfinder & Sojourner | `IMG-20261114-WA0558.jpg` | UNVERIFIED — confirm with team | UNVERIFIED — do not assume reuse rights |
| Mars Pathfinder & Sojourner | `IMG-20261114-WA0547(1).jpg` | UNVERIFIED — confirm with team | UNVERIFIED — do not assume reuse rights |
| Mars Pathfinder & Sojourner | `IMG-20261114-WA0553(1).jpg` | UNVERIFIED — confirm with team | UNVERIFIED — do not assume reuse rights |
| Mars Pathfinder & Sojourner | `IMG-20261114-WA0565(1).jpg` | UNVERIFIED — confirm with team | UNVERIFIED — do not assume reuse rights |
| Mars Pathfinder & Sojourner | `IMG-20261114-WA0549(1).jpg` | UNVERIFIED — confirm with team | UNVERIFIED — do not assume reuse rights |
| Mars Pathfinder & Sojourner | `IMG-20261114-WA0564.jpg` | UNVERIFIED — confirm with team | UNVERIFIED — do not assume reuse rights |
| Mars Pathfinder & Sojourner | `IMG-20261114-WA0555(1).jpg` | UNVERIFIED — confirm with team | UNVERIFIED — do not assume reuse rights |
| Mars Pathfinder & Sojourner | `IMG-20261114-WA0546(1).jpg` | UNVERIFIED — confirm with team | UNVERIFIED — do not assume reuse rights |
| Mars Pathfinder & Sojourner | `IMG-20261114-WA0557(1).jpg` | UNVERIFIED — confirm with team | UNVERIFIED — do not assume reuse rights |
| Mars Pathfinder & Sojourner | `IMG-20261114-WA0562.jpg` | UNVERIFIED — confirm with team | UNVERIFIED — do not assume reuse rights |
| Mars Pathfinder & Sojourner | `IMG-20261114-WA0569(1).jpg` | UNVERIFIED — confirm with team | UNVERIFIED — do not assume reuse rights |
| Mars Pathfinder & Sojourner | `IMG-20261114-WA0551(1).jpg` | UNVERIFIED — confirm with team | UNVERIFIED — do not assume reuse rights |
| Mars Pathfinder & Sojourner | `IMG-20261114-WA0545(1).jpg` | UNVERIFIED — confirm with team | UNVERIFIED — do not assume reuse rights |
| Mars Pathfinder & Sojourner | `IMG-20261114-WA0548(1).jpg` | UNVERIFIED — confirm with team | UNVERIFIED — do not assume reuse rights |
| Mars Pathfinder & Sojourner | `IMG-20261114-WA0563(1).jpg` | UNVERIFIED — confirm with team | UNVERIFIED — do not assume reuse rights |
| Mars Pathfinder & Sojourner | `IMG-20261114-WA0544(1).jpg` | UNVERIFIED — confirm with team | UNVERIFIED — do not assume reuse rights |
| Mars Pathfinder & Sojourner | `IMG-20261114-WA0559(1).jpg` | UNVERIFIED — confirm with team | UNVERIFIED — do not assume reuse rights |
| Mars Pathfinder & Sojourner | `IMG-20261114-WA0543(1).jpg` | UNVERIFIED — confirm with team | UNVERIFIED — do not assume reuse rights |
| Pioneer 10 & 11 — Messages Beyond the Planets | `IMG-20261114-WA0644.jpg` | UNVERIFIED — confirm with team | UNVERIFIED — do not assume reuse rights |
| Pioneer 10 & 11 — Messages Beyond the Planets | `IMG-20261114-WA0648.jpg` | UNVERIFIED — confirm with team | UNVERIFIED — do not assume reuse rights |
| Pioneer 10 & 11 — Messages Beyond the Planets | `IMG-20261114-WA0650.jpg` | UNVERIFIED — confirm with team | UNVERIFIED — do not assume reuse rights |
| Pioneer 10 & 11 — Messages Beyond the Planets | `IMG-20261114-WA0646.jpg` | UNVERIFIED — confirm with team | UNVERIFIED — do not assume reuse rights |
| Pioneer 10 & 11 — Messages Beyond the Planets | `IMG-20261114-WA0642.jpg` | UNVERIFIED — confirm with team | UNVERIFIED — do not assume reuse rights |
| Pioneer 10 & 11 — Messages Beyond the Planets | `IMG-20261114-WA0640.jpg` | UNVERIFIED — confirm with team | UNVERIFIED — do not assume reuse rights |
| Pioneer 10 & 11 — Messages Beyond the Planets | `IMG-20261114-WA0638.jpg` | UNVERIFIED — confirm with team | UNVERIFIED — do not assume reuse rights |
| Pioneer 10 & 11 — Messages Beyond the Planets | `IMG-20261114-WA0639.jpg` | UNVERIFIED — confirm with team | UNVERIFIED — do not assume reuse rights |
| Pioneer 10 & 11 — Messages Beyond the Planets | `IMG-20261114-WA0653.jpg` | UNVERIFIED — confirm with team | UNVERIFIED — do not assume reuse rights |
| Pioneer 10 & 11 — Messages Beyond the Planets | `IMG-20261114-WA0647.jpg` | UNVERIFIED — confirm with team | UNVERIFIED — do not assume reuse rights |
| Pioneer 10 & 11 — Messages Beyond the Planets | `IMG-20261114-WA0643.jpg` | UNVERIFIED — confirm with team | UNVERIFIED — do not assume reuse rights |
| Pioneer 10 & 11 — Messages Beyond the Planets | `IMG-20261114-WA0654.jpg` | UNVERIFIED — confirm with team | UNVERIFIED — do not assume reuse rights |
| Pioneer 10 & 11 — Messages Beyond the Planets | `IMG-20261114-WA0649.jpg` | UNVERIFIED — confirm with team | UNVERIFIED — do not assume reuse rights |
| Pioneer 10 & 11 — Messages Beyond the Planets | `IMG-20261114-WA0641.jpg` | UNVERIFIED — confirm with team | UNVERIFIED — do not assume reuse rights |
| Pioneer 10 & 11 — Messages Beyond the Planets | `IMG-20261114-WA0652.jpg` | UNVERIFIED — confirm with team | UNVERIFIED — do not assume reuse rights |
| Pioneer 10 & 11 — Messages Beyond the Planets | `IMG-20261114-WA0651.jpg` | UNVERIFIED — confirm with team | UNVERIFIED — do not assume reuse rights |
| Pioneer 10 & 11 — Messages Beyond the Planets | `IMG-20261114-WA0637.jpg` | UNVERIFIED — confirm with team | UNVERIFIED — do not assume reuse rights |
| Pioneer 10 & 11 — Messages Beyond the Planets | `IMG-20261114-WA0636.jpg` | UNVERIFIED — confirm with team | UNVERIFIED — do not assume reuse rights |
| Pioneer 10 & 11 — Messages Beyond the Planets | `IMG-20261114-WA0645.jpg` | UNVERIFIED — confirm with team | UNVERIFIED — do not assume reuse rights |
| Pioneer 10 & 11 — Messages Beyond the Planets | `IMG-20261114-WA0635.jpg` | UNVERIFIED — confirm with team | UNVERIFIED — do not assume reuse rights |

## Fonts and interface assets

| Asset | Source | License / status |
|---|---|---|
| Barlow Condensed | Google Fonts — https://fonts.google.com/specimen/Barlow+Condensed | SIL Open Font License; served by Google Fonts. |
| Cormorant Garamond | Google Fonts — https://fonts.google.com/specimen/Cormorant+Garamond | SIL Open Font License; served by Google Fonts. |
| DM Sans | Google Fonts — https://fonts.google.com/specimen/DM+Sans | SIL Open Font License; served by Google Fonts. |
| `assets/logos/favicon.svg` | Repository file | Project source/author not documented; confirm team authorship. |
| Inline SVG interface icons | HTML/CSS files in repository | Source/author not documented; confirm whether custom or adapted. |

## Audio

| Asset | Source | License / status |
|---|---|---|
| Procedural score generated by Web Audio in `js/main.js` and `js/comic-reader.js` | Generated in the browser; no external audio file is referenced by these implementations | No recording file. Review the musical composition/code provenance and credit its author. Playback begins only after user interaction. |

## Data and scientific sources

Mission records and source URLs are maintained in `data/artifacts.json`. The NASA Data Lab contains source links and data metadata in its page/module files. Every displayed dataset must retain its dataset identifier, source URL, instrument, units, and whether values are measured or illustrative. Do not treat a NASA mission page or image as proof that a dataset listed in the specific challenge Resources section was used.

## Required follow-up before claiming a complete asset audit

- Confirm authorship and source of all 49 comic panels, and add a specific license for each set.
- Confirm the source/creator of the favicon and custom interface illustrations/icons.
- Record the exact NASA image record URL, image title, creator/credit, and usage restrictions for each image selected at runtime.
- Confirm the 3D code authorship and preserve the fidelity labels in the interface.
- Update this file whenever any image, model, texture, font, sound, or external library is added, removed, or changed.


## Procedural cosmic atmosphere

| Asset | Source / implementation | License / status |
|---|---|---|
| Animated nebula clouds, spiral-galaxy forms, star field, and small ambient planet silhouettes | Original procedural Canvas 2D artwork generated at runtime by `js/cosmic-environment.js`; styling and visitor controls in `css/cosmic-environment.css`. No external image, NASA texture, or downloaded media is used. | Generated in-browser from project code. Treat as an artistic atmosphere only; not astronomical imagery, to-scale planetary positions, or scientific data. |

| 3D artifact exhibit nebula chamber, drifting star layers, and ambient depth particles | Procedural CSS in `css/artifact-3d-explorer.css` plus generated Three.js point geometry in `js/artifact-3d-explorer.js`; no external galaxy image or NASA texture is used. | Original procedural artistic atmosphere. Not astronomical imagery, not a measured star field, and does not alter official NASA model geometry. |


## Interactive comic-world environments

| Asset | Creator / source | License / fidelity |
|---|---|---|
| Optional Moon, Mars, and deep-space comic environments | Procedural Three.js geometry and generated deterministic star field in `js/comic-world-3d.js`; interface styles in `css/comic-world-3d.css`. | Original artistic reconstructions, not NASA scans, scale models, or mission photographs. Original comic panels remain unchanged. |
