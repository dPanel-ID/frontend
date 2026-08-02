import type { ComponentType } from 'react';

import {
  CirclePlayIcon,
  CompassIcon,
  FlaskConicalIcon,
  ScaleIcon,
} from 'lucide-react';

import { Badge } from '@/shared/presentation/atoms/Badge';
import { Button } from '@/shared/presentation/atoms/ButtonV2';

type TryFirstStep = {
  title: string;
  description: string;
  Icon: ComponentType<{ className?: string }>;
};

const tryFirstSteps = [
  {
    title: 'Learn in minutes',
    description:
      'Start with a short product walkthrough before you change anything.',
    Icon: CompassIcon,
  },
  {
    title: 'Test with confidence',
    description:
      'Try your application in an environment that fits the experiment.',
    Icon: FlaskConicalIcon,
  },
  {
    title: 'Choose what fits',
    description: 'Use what the test showed to make the next choice clearer.',
    Icon: ScaleIcon,
  },
] as const satisfies readonly TryFirstStep[];

function TryFirstActions() {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <Button asChild size="lg" className="sm:w-auto">
        <a href="/">Try dPanel</a>
      </Button>
      <Button
        asChild
        buttonStyle="outline"
        buttonColor="secondary"
        size="lg"
        className="sm:w-auto"
      >
        <a
          href="https://www.youtube.com/@dpanel_id"
          target="_blank"
          rel="noopener noreferrer"
        >
          <CirclePlayIcon />
          Watch dPanel on YouTube
        </a>
      </Button>
    </div>
  );
}

function TryFirstHero() {
  return (
    <section className="rounded-xl border bg-card p-5 sm:p-8">
      <div className="max-w-3xl space-y-5">
        <Badge variant="secondary">Try dPanel first</Badge>
        <div className="space-y-3">
          <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-primary sm:text-5xl">
            Try your application before you commit your infrastructure.
          </h1>
          <p className="max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
            dPanel helps you learn the product, try your application, and
            compare the result before making the next infrastructure choice.
          </p>
        </div>
        <TryFirstActions />
      </div>
    </section>
  );
}

function TryFirstOutcomeStrip() {
  return (
    <section aria-labelledby="try-first-outcomes" className="space-y-5">
      <div className="max-w-2xl space-y-2">
        <Badge variant="outline">Learn, try, compare</Badge>
        <h2
          id="try-first-outcomes"
          className="text-2xl font-semibold tracking-tight text-primary sm:text-3xl"
        >
          Take the next step with a clearer view.
        </h2>
      </div>

      <ol className="grid gap-3 md:grid-cols-3">
        {tryFirstSteps.map((step) => (
          <li key={step.title} className="rounded-xl border bg-card p-5">
            <span className="flex size-9 items-center justify-center rounded-lg border bg-background text-accent">
              <step.Icon className="size-4" />
            </span>
            <h3 className="mt-4 text-lg font-semibold text-primary">
              {step.title}
            </h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {step.description}
            </p>
          </li>
        ))}
      </ol>
    </section>
  );
}

function TryFirstInvitation() {
  return (
    <section className="rounded-xl border bg-card p-5 sm:p-6">
      <div className="max-w-2xl space-y-4">
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold tracking-tight text-primary">
            See what fits your application.
          </h2>
          <p className="text-sm leading-6 text-muted-foreground">
            Start with a walkthrough or try dPanel when you are ready.
          </p>
        </div>
        <TryFirstActions />
      </div>
    </section>
  );
}

export function DocsIntroContent() {
  return (
    <>
      <TryFirstHero />
      <TryFirstOutcomeStrip />
      <TryFirstInvitation />
    </>
  );
}
