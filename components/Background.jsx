/* Fixed-position video background.
 * Veil + grain overlays remain so text on top stays readable.
 *
 * Source: public/bg/ultrasound.mp4
 * Confirm you have rights / permission for the clip you place here.
 */
export default function Background() {
  return (
    <>
      <video
        className="bg-video"
        src="/bg/ultrasound.mp4"
        poster="/bg/ornithography.jpg"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        aria-hidden="true"
      />
      <div className="bg-veil" aria-hidden="true" />
      <div className="bg-grain" aria-hidden="true" />
    </>
  );
}
