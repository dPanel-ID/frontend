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

/** A reader the page speaks to, the problem they arrive with, and the answer. */
export interface DocsIntroProblem {
  /** Chooses the icon, so content files carry no component references. */
  key: 'owner' | 'developer' | 'operator' | 'team';
  /** Who this is, in plain words ("You run a business website"). */
  who: string;
  problem: string;
  answer: string;
}

export interface DocsIntroCapability {
  /** Chooses the icon, so content files carry no component references. */
  key:
    | 'servers'
    | 'applications'
    | 'traffic'
    | 'data'
    | 'assistant'
    | 'logs'
    | 'clusters'
    | 'teams';
  title: string;
  text: string;
}

/** One box of the "how it works" picture. */
export interface DocsIntroNode {
  title: string;
  /** What lives in the box, a few words each. */
  items: string[];
}

/** One column of the data section. */
export interface DocsIntroDataColumn {
  key: 'server' | 'dpanel' | 'outside';
  title: string;
  /** One sentence a non-technical reader can take away. */
  summary: string;
  items: string[];
}

export interface DocsIntroCopy {
  hero: {
    badge: string;
    title: string;
    subtitle: string;
    primaryCta: string;
    secondaryCta: string;
  };
  problems: {
    badge: string;
    title: string;
    /** Small labels over each card's problem and answer. */
    problemLabel: string;
    answerLabel: string;
    items: DocsIntroProblem[];
  };
  howItWorks: {
    badge: string;
    title: string;
    lead: string;
    /** The three boxes, left to right: you, dPanel, your servers. */
    you: DocsIntroNode;
    dpanel: DocsIntroNode;
    servers: DocsIntroNode;
    /** Labels on the two links between the boxes. */
    youToDpanel: string;
    serversToDpanel: string;
    /** The services around the picture and what each one is for. */
    outside: { title: string; items: Array<{ name: string; role: string }> };
    /** The picture in words, in order; also the text alternative. */
    steps: DocsIntroStep[];
  };
  /** The home lab highlight: machines at home, run like a data centre. */
  homelab: {
    badge: string;
    title: string;
    text: string;
    points: string[];
    cta: string;
    /** A docs path, such as /docs/tutorials/team-homelab. */
    href: string;
    secondaryCta: string;
    secondaryHref: string;
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
  data: {
    badge: string;
    title: string;
    lead: string;
    columns: DocsIntroDataColumn[];
    control: { title: string; items: string[] };
    more: string;
    /** A docs path, such as /docs/getting-started/security-and-your-data. */
    moreHref: string;
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
