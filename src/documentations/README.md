# dPanel documentation

Everything under `/docs` in the app is written here, in Markdown. The pages are
read at build time, so a change shows up in `pnpm dev` as soon as you save.

```text
src/documentations/
├── README.md                  this file (not a page)
├── assets/                    images, shared by every language
│   └── servers/servers-list.webp
├── en/                        English, the default
│   └── servers/               one folder per section
│       ├── _category_.json    the section's label, position and description
│       └── overview.md        one file per page
└── id/                        Indonesian, the same tree with the same file names
    └── servers/
        ├── _category_.json
        └── overview.md
```

English and Indonesian sit side by side (`en/`, `id/`) rather than the Docusaurus
`i18n/` layout. That keeps both trees at the same depth, so an image or a link
written as `../../assets/...` or `../applications/deploy.md` works unchanged in
both languages.

A page's URL is `/docs/<section folder>/<page slug>`, for example
`/docs/servers/overview`.

## Who we write for

Every page must work for two readers at once:

- **Someone new**: a new developer, a beginner, or a person who is not technical at all. Say what a thing is and why they would want it before how. Explain a term the first time it appears, in a few plain words. Write steps in order and say what they should see afterwards.
- **An expert**: a devops engineer, sysadmin, WordPress developer, VPS maintainer or cloud engineer. Keep the exact facts easy to find: ports, paths, service names, what changes on the machine, permissions, limits, failure behaviour and the `dnocs` command.

A plain opening with precise detail below serves both. The docs are public: never mention internal development, tests, staff, internal hosts or customer data, in text or in screenshots.

When a feature ships, update its page in both languages in the same change.

## Edit a page

Open the `.md` file and change it. Change the same page in the other language
too.

## Add a page

1. Create `en/<section>/<slug>.md` with frontmatter:

   ```markdown
   ---
   title: Delete a server
   description: Stop paying for a machine you have finished with.
   sidebar_position: 9
   ---

   The page body starts here.
   ```

   | Key                | Required | Meaning                                                             |
   | ------------------ | -------- | ------------------------------------------------------------------- |
   | `title`            | yes      | The page heading and its name in the index.                         |
   | `description`      | yes      | One sentence under the heading.                                     |
   | `sidebar_position` | no       | Order inside the section, lowest first. Pages without one go last.  |
   | `slug`             | no       | The URL segment. Defaults to the file name. Lowercase kebab-case.   |
   | `sidebar_label`    | no       | A shorter name for the index. Defaults to `title`.                  |
   | `sidebar_icon`     | no       | The icon in the index. See [Icons and colours](#icons-and-colours). |

   Frontmatter is one `key: value` per line. Quote a value that contains a colon.

2. Create the same file, with the same name and slug, under `id/`, and
   translate it. Write natural Indonesian rather than a word-for-word copy.
3. Run `pnpm test`. The docs tests fail if a page exists in one language
   only, if a link or image does not resolve, or if an image has no alt text.

## Add a section

Create a folder in both `en/` and `id/`, each with a `_category_.json`:

```json
{
  "label": "Load balancers",
  "position": 4,
  "description": "Put one public HTTPS address in front of your applications.",
  "icon": "network",
  "color": "emerald",
  "app": { "label": "Open load balancers", "href": "/backend/load-balancers" }
}
```

`label` and `description` are required. `position` orders sections in the
index and on the introduction page. `app` is optional: it adds a button to the
section's page header that opens that part of the product. The folder name is
the section's URL segment. The introduction page picks up new sections by
itself; to give one an icon, add its folder name to `MODULE_ICONS` in
`src/app/docs/intro/-view/DocsIntroContent.tsx`.

## Group pages inside a section

A folder inside a section with its own `_category_.json` becomes a group that
folds open in the index, like **Servers → Cloud providers**:

```text
en/servers/
├── _category_.json
├── overview.md
└── cloud-providers/
    ├── _category_.json      label, position, description, icon
    ├── index.md             the group's own page, opened by its name
    ├── provider-aws.md
    └── provider-gcp.md
```

- The group's `position` orders it among the section's pages.
- `index.md` is optional. Its URL is the folder name
  (`/docs/servers/cloud-providers`); without one, the group's name opens its
  first page.
- Grouped pages keep flat URLs (`/docs/servers/provider-aws`), so moving a page
  into or out of a group never breaks a link. Slugs must be unique across the
  whole section.
- Groups go one level deep. Link to a grouped page with its file path, such as
  `./cloud-providers/provider-aws.md`.

## Icons and colours

A section's `_category_.json` takes an `icon` and a `color`; a group's takes
an `icon`; a page takes `sidebar_icon`. The section's colour tints its icon
tile, every page icon in it and the page being read.

- **Colours:** `sky`, `indigo`, `violet`, `emerald`, `amber`, `teal`, `rose`.
- **Icons:** [lucide](https://lucide.dev/icons) names from the list in
  `DOCS_ICON_NAMES` (`src/app/docs/-rules/content.ts`). To use a new one, add
  its name there and its component in
  `src/app/docs/-view/-presentation/DocsIcon/index.tsx`.
- **Cloud providers:** `provider:aws`, `provider:gcp`, `provider:digitalocean`,
  `provider:idcloudhost`, `provider:alibabacloud`, `provider:tencent` show the
  provider's logo.

An unknown icon or colour fails the build and names the file.

## Add an image

1. Save it under `assets/<section>/`, as WebP. Capture screenshots at 2x
   (for example a 1440×900 viewport with a device scale factor of 2) and keep
   each file under about 300 KB. Crop to the part of the screen that matters.
2. Reference it with a relative path, alt text, and an optional caption:

   ```markdown
   ![The Servers page listing two servers](../../assets/servers/servers-list.webp 'Each card shows the status and live usage.')
   ```

Images are drawn at half their pixel width, so a 2x screenshot stays sharp.
Never show tokens, keys, passwords, environment variable values, or other
people's names and emails in a screenshot.

## What you can write

- Headings: `##` and `###`.
- **Bold**, _italic_, `code`, and [links](../servers/overview.md).
- Numbered lists, drawn as numbered steps. Bullet lists.
- Tables (GitHub style).
- Code blocks with a language: ` ```bash `, ` ```json `.
- Callouts, the Docusaurus way. The title in brackets is optional:

  ```markdown
  :::warning[This cannot be undone]
  Deleting a server destroys the machine at your provider.
  :::
  ```

  `note`, `tip` and `info` are blue, `warning` is amber, `danger` is red.

Links to another page use its file: `./install-software.md`,
`../applications/overview.md#create-one`. A link to `/docs/...` or to an app
page such as `/servers` also works. Website links open in a new tab.

Raw HTML is not rendered.
