'use client';

/* Efficient fixed-position video background.
 *
 * The video is the only continuously-repainting element on the page, so the
 * cost lives here. To keep CPU/GPU low we:
 *   - skip the 25 MB download entirely on small screens and when the user
 *     prefers reduced motion (the poster image stays as the background);
 *   - lazy-attach the source (preload="none") and start playback ourselves;
 *   - pause only when the tab is hidden (Page Visibility) — no point decoding
 *     frames nobody can see. (We do NOT pause on scroll: the video and veil are
 *     both position:fixed, so the clip stays visible at the top of the viewport
 *     the whole way down the page — pausing it would just freeze a visible frame.)
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

    const sync = () => {
      if (!document.hidden && video.paused) {
        video.play().catch(() => {});
      } else if (document.hidden && !video.paused) {
        video.pause();
      }
    };

    document.addEventListener('visibilitychange', sync);
    sync();

    return () => {
      document.removeEventListener('visibilitychange', sync);
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
