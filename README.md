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

The intended repository is `Robo-Harness/Robo-Harness.github.io`. After publication is approved, enable Pages from the `main` branch, root directory. The project URL is `https://robo-harness.github.io/k1/`.

The `.nojekyll` file keeps the site a plain static export. All assets use relative paths. No analytics, third-party fonts, cookies, or external JavaScript are used.

## Demonstration videos

The page includes three LIBERO-Pro successes and three RoboSuite successes from Gemini with K1. Native replay records were checked before selecting them.

These are **sampled decision-time observations**, not continuous or real-time recordings. Each distinct observation is shown for 0.8 seconds, with a short final hold. Only the current camera entries are selected from each call's image manifest; history images and auxiliary candidate panels are excluded. The terminal simulator state can occur after the final model observation. Success is verified independently, not inferred from the displayed final frame.

Clean clips use RGB from the same archived sensor frames; overlay clips use the original current model-input images. Both modes retain the chronological order. Original experiment files are unchanged. Private source paths and audit logs are kept outside this website.

Only selected figures, derived demonstration clips, and posters are included. No raw trajectories, model requests, datasets, checkpoints, paper draft, or credentials are published here.
