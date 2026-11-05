import { Fragment } from 'react/jsx-runtime';

import LOGO_IFM from '@/shared/assets/logo-ifm.svg';

const LINKS = [
  {
    text: 'Documentation',
    url: '/docs/intro',
  },
  {
    text: 'GitHub',
    url: 'https://github.com/dPanel-ID',
  },
  {
    text: 'YouTube',
    url: 'https://www.youtube.com/@dpanel_id',
  },
];

export default function Footer() {
  return (
    <div className="mt-3 p-2 pt-0 pb-16 sm:pb-2">
      <div className="border-t pt-6 flex justify-center gap-x-2">
        {LINKS.map((linkItem, index) => {
          return (
            <Fragment key={index}>
              <a
                className="text-primary hover:underline hover:text-accent"
                href={linkItem.url}
              >
                {linkItem.text}
              </a>
              {index < LINKS.length - 1 && <span>•</span>}
            </Fragment>
          );
        })}
      </div>

      {/* Credit to the AI service behind Ask dPanel. The navy wordmark is
          turned white in dark mode, where it would otherwise disappear. */}
      <a
        href="https://ifm.ai/"
        target="_blank"
        rel="noopener noreferrer"
        className="group mx-auto mt-3 flex w-fit items-center gap-1.5 rounded-md px-2 py-1 text-xs text-muted-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/50"
      >
        <span>AI assistant powered by</span>
        <img
          src={LOGO_IFM}
          alt="ifm.ai"
          width={118}
          height={20}
          className="h-5 w-auto opacity-80 transition-opacity dark:brightness-0 dark:invert group-hover:opacity-100"
        />
      </a>
    </div>
  );
}
