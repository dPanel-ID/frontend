import { Link, createFileRoute } from '@tanstack/react-router';
import { BookOpenIcon } from 'lucide-react';

import { Button } from '@/shared/presentation/atoms/ButtonV2';

import { DocsIntroContent } from './-view/DocsIntroContent';

export const Route = createFileRoute('/docs/intro/')({
  ssr: true,
  head: () => ({
    meta: [
      {
        title: 'dPanel Documentation | Introduction',
      },
      {
        name: 'description',
        content:
          'Learn dPanel, try your application, and use the result to choose the infrastructure that fits your next step.',
      },
    ],
  }),
  component: DocsIntroPage,
});

function DocsIntroPage() {
  return (
    <>
      <a
        href="#docs-intro-content"
        className="sr-only fixed left-4 top-4 z-50 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground focus:not-sr-only focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        Skip to content
      </a>
      <main
        id="docs-intro-content"
        tabIndex={-1}
        className="min-h-svh bg-background text-foreground"
      >
        <DocsHeader />

        <div className="mx-auto w-full max-w-7xl space-y-5 px-4 py-5 sm:px-6 lg:px-8">
          <DocsIntroContent />
        </div>
      </main>
    </>
  );
}

function DocsHeader() {
  return (
    <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <Link
          to="/docs/intro"
          className="flex min-w-0 items-center gap-2 rounded-md focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          aria-label="dPanel documentation introduction"
        >
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border bg-card text-primary">
            <BookOpenIcon className="size-4" />
          </span>
          <span className="hidden text-sm font-semibold text-primary sm:inline">
            dPanel Docs
          </span>
        </Link>

        <Button
          asChild
          buttonStyle="outline"
          buttonColor="secondary"
          size="sm"
          className="inline-flex"
        >
          <Link to="/">Open app</Link>
        </Button>
      </div>
    </header>
  );
}
