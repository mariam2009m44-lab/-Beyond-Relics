# Beyond Relics — Final Submission & Global Readiness

> Working checklist for the NASA Space Apps Challenge 2026, Challenge 01: “Abandoned but not Forgotten.” This document is a team aid, not an official NASA eligibility determination.

## Submission gate — complete before clicking Submit

- [ ] Confirm the team is registered for the correct 2026 event and the selected Challenge 01.
- [ ] If participating in the **Universal Event**, confirm 2–6 participants are registered on the same team. The Global Organizing Team's Challenge 01 clarification says a Universal Event team of one is not eligible for Global Judging. Check the rule for your actual event type.
- [ ] Open the official Challenge 01 **Resources** tab and copy the exact title and URL of at least one NASA data source listed there.
- [ ] Confirm that the qualifying resource is actually used in the project—not merely linked or cited.
- [ ] In the project, show the resource name, data product/file or fields used, the processing or comparison performed, and the finding it supports.
- [ ] Add every dataset, image, text source, code library, tool, and external asset to the submission's NASA Data and References fields.
- [ ] Disclose all AI/SI use. If any image or video is AI-generated, add a visible AI-generated watermark to those generated portions and describe the tool/use in the submission.
- [ ] Confirm third-party assets have suitable usage rights. Attribution alone does not grant permission.
- [ ] Prepare either a demo video of **30 seconds maximum** or a presentation of **7 slides maximum** (including title and closing slides).
- [ ] Test the deployed site on mobile and desktop, including all navigation, story controls, image fallbacks, data explorers, and external links.
- [ ] Verify the final submission is public and accessible without signing in.

## Data eligibility — current project status

Beyond Relics currently includes:
- NASA PDS Apollo Passive Seismic Experiment archive links and collection metadata.
- Published ALSEP station coordinates and PSE instrument sampling-rate metadata.
- NASA-published InSight instrument specifications and links to the SEIS archive.
- NASA Image and Video Library search results with NASA record identifiers.

**Important limitation:** the current ALSEP explorer plots station locations and displays instrument metadata. It does not yet process or plot raw seismic waveform samples. A link to a NASA dataset, mission facts, or NASA photographs alone does not satisfy the 2026 Global Award data requirement.

**Unresolved eligibility check:** the team must compare the Apollo PSE and/or InSight SEIS sources against the exact list in the selected Challenge 01 Resources tab. Do not claim that either qualifies until this match is confirmed. If a listed resource is different, prioritize integrating that exact source.

## Suggested 30-second demo structure

1. **0–5 sec — The question:** “When a NASA mission ends, what remains—and what can it still teach us?”
2. **5–11 sec — The archive:** show one Moon artifact and one Mars artifact; distinguish physical hardware from archived data.
3. **11–20 sec — The evidence:** open the qualifying Challenge 01 NASA dataset, show the actual product/fields used, and reveal one clear result. Do not show metadata as if it were raw telemetry.
4. **20–26 sec — The story:** connect the result to a short illustrated story and a learning question for school-age explorers.
5. **26–30 sec — The impact:** show the takeaway and the live project URL.

Record the demo only after the qualifying dataset is visibly integrated. Keep it honest and legible; do not use rapid cuts that hide the evidence.

## Suggested project summary

**Beyond Relics** is an interactive, evidence-led digital archive that helps school-age explorers discover the machines NASA left on the Moon and Mars. Visitors follow each artifact from mission purpose to physical remains, scientific discoveries, and lasting legacy. NASA imagery and primary mission records ground the stories, while interactive explainers and learning challenges make the science approachable. The project distinguishes hardware left on another world from the data preserved on Earth and labels diagrams and simplified locators as illustrations—not photographs, terrain maps, or telemetry.

## Suggested judging walkthrough

1. Start on the home page and state the storytelling problem in one sentence.
2. Open the Apollo ALSEP artifact and explain what physically remains on the Moon.
3. Open the Data Lab and demonstrate the exact qualifying dataset from Challenge 01 Resources, including the data product or fields used and one derived result.
4. Show how the evidence becomes a short story for school-age learners.
5. Open the NASA source record and explain the limitation of the visualization.
6. End with the learning challenge and project impact.

## Current known technical/research limitations

- The Apollo explorer is a station locator with published metadata, not a waveform-analysis tool.
- The InSight explorer is a factual instrument explainer; it does not reproduce raw SEIS observations.
- The story reader uses live NASA image search and text-based story beats; it is not yet a fully illustrated original comic-book collection.
- Some pages depend on the NASA Images API and should be tested with both successful and failed network requests.
- This repository has not been fully browser-tested in this review. Do not describe the site as fully tested until the deployed experience has been checked on real devices.

## Official guidance

- 2026 event dates, submission window and registration: https://www.spaceappschallenge.org/2026/
- Challenge 01 Resources: https://www.spaceappschallenge.org/2026/challenges/nasas-discarded-equipment-storytelling/?tab=resources
- Global Organizing Team clarification on data, team size, AI watermarking and demo length: https://github.com/nasa/spaceapps/discussions/1947
- Global Organizing Team clarification on pre-event work and citations: https://github.com/nasa/spaceapps/discussions/1813 and https://github.com/nasa/spaceapps/discussions/1858
- NASA Space Apps legal terms and third-party material responsibilities: https://www.spaceappschallenge.org/legal/

## AI and asset disclosure template

Edit this to match the team's actual work; remove anything that is not true:

- AI-assisted coding/editorial support: ChatGPT was used for code assistance and editorial refinement; team members reviewed and remain responsible for the final work.
- NASA imagery: images are retrieved from NASA's public Image and Video Library and should retain their NASA record/source attribution.
- AI-generated visuals: list each tool and identify the specific generated image/video portions with a visible “AI-generated” watermark. Do not present generated visuals as NASA photographs and do not generate or alter NASA logos, mission identifiers, or other NASA branding.
- Audio: identify whether the soundtrack is original code-generated audio, licensed music, or another source; include licence/source details where relevant.

---
Last repository review: 2026-11-14. Update this checklist after the Challenge 01 Resources tab and deployed site have been verified.
