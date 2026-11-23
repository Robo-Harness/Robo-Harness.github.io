# Robo-Harness K1 project website

Static project page for **Robo-Harness K1: Harnessing Robot-Use Agents via Perception Augmentation**.

- Project page: `/k1/`.
- KnowinAgent-RoboDojo showcase: `/KnowinAgent-RoboDojo/` (static export of the KnowinAgent-RoboDojo site, including 270 test-episode videos).
- The root page redirects to `/k1/`.
- Algorithm source: [Robo-Harness/k1](https://github.com/Robo-Harness/k1).

## Preview

From this directory:

```bash
python -m http.server 8765
```

Open `http://localhost:8765/k1/`. No build step, package installation, API credential, or model server is required.

## GitHub Pages

Website repository: `Robo-Harness/Robo-Harness.github.io`. GitHub Pages publishes the `main` branch, root directory. The project URL is `https://robo-harness.github.io/k1/`. Push changes to `main` to update the site.

The `.nojekyll` file keeps the site a plain static export. All assets use relative paths. No analytics, third-party fonts, cookies, or external JavaScript are used.

## Demonstration videos

The real-robot section adds a physical Piper **can-into-bowl** success as a GIF and an MP4. Both show all 33 recorded decisions using the canonical English current-view presentation: a two-second task card, current camera views, separate observation/result frame numbers, actual tool calls/results, and the task query throughout. These are decision snapshots, with API waiting time omitted. A still poster is used for reduced-motion preferences, and the GIF has a pause control.

The page includes three LIBERO-Pro successes and three RoboSuite successes from Gemini with K1. Native replay records were checked before selecting them.

These combine **original annotated decision observations and complete native-action replays** through the successful terminal state. Current model-input images pause for 1.2 seconds with the corresponding function name and key arguments. Motion segments include every recorded control step at 20 frames per second. The actual successful terminal image is held for two seconds, without extra actions. API waiting time is omitted; this is not wall-clock playback. Posters show annotated decision observations.

All six clips use the original camera views, with no historical views or added cameras. Overlays appear only on their original recorded observations, never projected onto changed motion frames. Captions show a whitelist of action/perception arguments, not raw reasoning, requests, or logs. Replay checks cover native success, robot trajectories, and agreement with archived sensor images. Original experiment files are unchanged. Private source paths and audit logs are kept outside this website. These selected demonstrations illustrate behavior; the Results section reports performance over the evaluation sets, not over the selected videos.

Only selected figures, derived demonstration clips, and posters are included. No raw trajectories, model requests, datasets, checkpoints, paper draft, or credentials are published here.

## Results update

Figure 1 uses the updated **60-case matched LIBERO-Pro comparison**: Gemini RGB-only 16.7%, Gemini + K1 71.7%, Astra RGB-only 63.3%, and Astra + K1 93.3%. The separate full Gemini sweep remains 139/180 (77.2%). The learning curves include the untrained Qwen3.5-9B checkpoint. Real-robot, RoboTwin, RoboCasa, and mixed-environment post-training results follow the updated paper and the code repository's `docs/results.md`.
