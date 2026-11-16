# Beyond Relics — 3D engineering standards

This document records the implementation patterns used by the Solar Frontiers Explorer and artifact exhibits. It is a practical checklist for future changes, not a claim that every model is a scientific replica.

## 1. Scene ownership and lifecycle

- One renderer owns one canvas and one active scene.
- Create the renderer only when the visitor opens the explorer or enters an artifact exhibit.
- Pause animation when the document is hidden or the experience is closed.
- Disconnect observers and cancel scheduled frames when the page is left.
- Dispose unique geometries, materials, textures, and the renderer during teardown.
- Handle `webglcontextlost` and `webglcontextrestored`; always retain a readable archive fallback.

## 2. Frame-rate independent motion

- Express animation as a per-frame baseline multiplied by a capped delta-time factor.
- Use exponential easing (`1 - Math.pow(1 - smoothing, delta)) so camera motion feels consistent at different refresh rates.
- Cap unusually large deltas after tab suspension to prevent sudden jumps.
- Respect `prefers-reduced-motion`; do not auto-rotate when the visitor requests reduced motion.

## 3. Adaptive rendering quality

- Cap device pixel ratio instead of blindly rendering at full phone resolution.
- Use a lower cap on narrow/mobile viewports and recalculate it after resize.
- Avoid expensive post-processing unless it has a measurable visual benefit.
- Keep geometry and texture budgets conservative for mobile GPUs.

## 4. Interaction and accessibility

- Support pointer drag, wheel/pinch zoom, visible buttons, and keyboard equivalents.
- Use semantic buttons with pressed states for toggles.
- Keep focus inside modal experiences and restore focus to the opener on close.
- Provide text descriptions and a non-WebGL route to the same mission records.
- Keep controls large enough for touch and preserve visible focus indicators.

## 5. Scientific fidelity and provenance

- Label official source models separately from simplified models and artistic reconstructions.
- Never describe a procedural model as an official NASA scan.
- Keep source, author, license, and modification notes in `ASSETS.md` and the credits page.
- Keep solar-system distances and sizes explicitly marked as not to scale where applicable.

## 6. Review checklist before merging

- [ ] JavaScript syntax and project quality audit pass.
- [ ] No duplicate event handlers for the same control.
- [ ] Animation is stable at different frame rates.
- [ ] Reduced-motion behavior remains available.
- [ ] Canvas resize and hidden-tab pause/resume work.
- [ ] Context-loss and no-WebGL fallbacks remain usable.
- [ ] Keyboard and touch controls remain available.
- [ ] Asset fidelity labels and credits remain accurate.
- [ ] Existing archive records, artwork, and page order are unchanged.

## 7. Manual verification scenarios

- Open an artifact exhibit, rotate it, switch to another browser tab, then return; motion should resume without a stale or duplicated frame loop.
- Repeat with the Solar Frontiers Explorer open and closed.
- Resize from desktop width to a narrow mobile viewport; the canvas should stay aligned with its stage and use the lower pixel-ratio cap.
- Toggle reduced motion before loading the exhibit; automatic rotation should remain off.
- Simulate a WebGL context interruption in browser developer tools where supported; the interface should retain its archive navigation and recovery message.
- Navigate the explorer using Tab, Shift+Tab, Escape, arrow keys, +, -, and 0.
- Verify that closing the modal returns focus to its launch button.
- Check at least one official NASA model and one artistic reconstruction; fidelity labels must remain distinct.
