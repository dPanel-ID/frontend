/**
 * What a signed-in page shows before its JavaScript has loaded.
 *
 * The static build serves every signed-in page from one shell whose body is
 * empty until the app boots, so on a slow connection the servers page sat
 * blank for seconds. The splash is in that HTML from the start; CSS shows it
 * only while the app's content area is still empty (comments do not count),
 * so prerendered public pages, which arrive with their content, never show
 * it, and it disappears as soon as the app renders anything, such as the
 * signed-in skeleton.
 */
export function BootSplash() {
  return (
    <div
      aria-hidden
      className="boot-splash fixed inset-0 z-0 items-center justify-center bg-background"
    >
      <div className="size-8 animate-spin rounded-full border-2 border-primary/15 border-t-primary/60" />
    </div>
  );
}
