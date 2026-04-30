/* Static image background.
 * The canvas flow-field has been replaced by a fixed photograph.
 * Veil + grain overlays remain so text on top stays readable.
 *
 * Image: bg/ornithography.jpg
 * Confirm you have rights / permission for the image you place here.
 */
export default function Background() {
  return (
    <>
      <div className="bg-image" aria-hidden="true" />
      <div className="bg-veil" aria-hidden="true" />
      <div className="bg-grain" aria-hidden="true" />
    </>
  );
}
