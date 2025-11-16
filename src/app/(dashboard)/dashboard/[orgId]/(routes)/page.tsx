/**
 * Render a static dashboard layout with three responsive aspect-ratio tiles and a full-width muted bar.
 *
 * @returns A React fragment containing a three-column responsive grid of muted, rounded aspect-video tiles and a full-width muted container beneath.
 */
export default function Page() {
  return (
    <>
      <div className="grid auto-rows-min gap-4 md:grid-cols-3">
        <div className="bg-muted/50 aspect-video rounded-xl" />
        <div className="bg-muted/50 aspect-video rounded-xl" />
        <div className="bg-muted/50 aspect-video rounded-xl" />
      </div>
      <div className="bg-muted/50 min-h-screen flex-1 rounded-xl md:min-h-min" />
    </>
  );
}