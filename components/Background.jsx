'use client';

/* Efficient fixed-position video background.
 *
 * The video is the only continuously-repainting element on the page, so the
 * cost lives here. To keep CPU/GPU low we:
 *   - skip the 25 MB download entirely on small screens and when the user
 *     prefers reduced motion (the poster image stays as the background);
 *   - lazy-attach the source (preload="none") and start playback ourselves;
 *   - pause when the tab is hidden (Page Visibility) and when the video has
 *     scrolled out of view behind the near-opaque veil — no point decoding
 *     frames nobody can see.
 * The per-frame CSS filter, blend-mode grain and header backdrop-blur that used
 * to recomposite over every video frame have been removed (see globals.css).
 *
 * Source: public/bg/ultrasound.mp4 — confirm you have rights to the clip.
 */
import { useEffect, useRef } from 'react';

export default function Background() {
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const lowPower =
      window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
      window.matchMedia('(max-width: 760px)').matches;
    // Leave the poster image in place; never fetch the video.
    if (lowPower) return;

    video.src = '/bg/ultrasound.mp4';

    let tabVisible = !document.hidden;

    const sync = () => {
      // Veil is ~opaque past one viewport, so the video is invisible by then.
      const onScreen = window.scrollY < window.innerHeight * 1.1;
      const shouldPlay = tabVisible && onScreen;
      if (shouldPlay && video.paused) {
        video.play().catch(() => {});
      } else if (!shouldPlay && !video.paused) {
        video.pause();
      }
    };

    let scheduled = false;
    const onScroll = () => {
      if (scheduled) return;
      scheduled = true;
      requestAnimationFrame(() => {
        scheduled = false;
        sync();
      });
    };
    const onVisibility = () => {
      tabVisible = !document.hidden;
      sync();
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    document.addEventListener('visibilitychange', onVisibility);
    sync();

    return () => {
      window.removeEventListener('scroll', onScroll);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  return (
    <>
      <video
        ref={videoRef}
        className="bg-video"
        poster="/bg/ornithography.jpg"
        muted
        loop
        playsInline
        preload="none"
        aria-hidden="true"
      />
      <div className="bg-veil" aria-hidden="true" />
      <div className="bg-grain" aria-hidden="true" />
    </>
  );
}
