# Robo-Harness K1 project website

Static project page for **Robo-Harness K1: Harnessing Robot-Use Agents via Perception Augmentation**.

- Project page: `/k1/`.
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

The page includes three LIBERO-Pro successes and three RoboSuite successes from Gemini with K1. Native replay records were checked before selecting them.

These are **continuous native-action replays** through the successful terminal state, rendered at 20 frames per second. API and perception-tool waiting time is omitted, so playback follows simulator time, not wall-clock rollout time. Every recorded control step is included. The final simulator image is held for two seconds without executing extra actions; posters show that terminal state.

All six clips use clean RGB from the original camera views, with no historical views or added cameras. Replay checks cover native success, robot trajectories, and agreement with archived sensor images. Original experiment files are unchanged. Private source paths and audit logs are kept outside this website. These selected demonstrations illustrate behavior; the Results section reports performance over the evaluation sets, not over the selected videos.

Only selected figures, derived demonstration clips, and posters are included. No raw trajectories, model requests, datasets, checkpoints, paper draft, or credentials are published here.
