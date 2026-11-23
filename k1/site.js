// Keep audio/video activity under the viewer's control; never autoplay demos.
document.querySelectorAll('video').forEach((current) => {
  current.addEventListener('play', () => {
    document.querySelectorAll('video').forEach((other) => {
      if (other !== current) other.pause();
    });
  });
});

const preview = document.querySelector('.real-robot-preview');
const toggle = document.querySelector('.animation-toggle');
if (preview && toggle) {
  const image = preview.querySelector('img');
  const reducedMotionSource = preview.querySelector('source');
  const animation = image.getAttribute('src');
  const poster = reducedMotionSource.getAttribute('srcset');
  let paused = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const updatePreview = () => {
    reducedMotionSource.remove();
    image.src = paused ? poster : animation;
    toggle.textContent = paused ? 'Play animation' : 'Pause animation';
    toggle.setAttribute('aria-pressed', String(paused));
  };
  updatePreview();
  toggle.addEventListener('click', () => { paused = !paused; updatePreview(); });
}
