/**
 * The shape of the documentation introduction.
 *
 * Like the rest of the documentation, its prose lives in typed content
 * modules, one per language, rather than in the i18n dictionaries: a
 * dictionary entry per sentence is unreadable to edit and impossible to
 * review as writing.
 */

export interface DocsIntroStep {
  title: string;
  text: string;
}

export interface DocsIntroCapability {
  /** Chooses the icon, so content files carry no component references. */
  key: 'servers' | 'applications' | 'traffic' | 'data' | 'activity' | 'teams';
  title: string;
  text: string;
}

export interface DocsIntroCopy {
  hero: {
    badge: string;
    title: string;
    subtitle: string;
    primaryCta: string;
    secondaryCta: string;
  };
  start: {
    badge: string;
    title: string;
    steps: DocsIntroStep[];
  };
  capabilities: {
    badge: string;
    title: string;
    items: DocsIntroCapability[];
  };
  ownership: {
    badge: string;
    title: string;
    lead: string;
    body: string;
  };
  guides: {
    badge: string;
    title: string;
  };
  providers: {
    title: string;
    /** Named exactly as the product offers them. */
    items: string[];
  };
  closing: {
    title: string;
    text: string;
  };
}
