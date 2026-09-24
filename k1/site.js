// Keep audio/video activity under the viewer's control; never autoplay demos.
document.querySelectorAll('video').forEach((current) => {
  current.addEventListener('play', () => {
    document.querySelectorAll('video').forEach((other) => {
      if (other !== current) other.pause();
    });
  });
});
