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

   | Key                | Required | Meaning                                                            |
   | ------------------ | -------- | ------------------------------------------------------------------ |
   | `title`            | yes      | The page heading and its name in the index.                        |
   | `description`      | yes      | One sentence under the heading.                                    |
   | `sidebar_position` | no       | Order inside the section, lowest first. Pages without one go last. |
   | `slug`             | no       | The URL segment. Defaults to the file name. Lowercase kebab-case.  |

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
  "app": { "label": "Open load balancers", "href": "/backend/load-balancers" }
}
```

`label` and `description` are required. `position` orders sections in the
index and on the introduction page. `app` is optional: it adds a button to the
section's page header that opens that part of the product. The folder name is
the section's URL segment. The introduction page picks up new sections by
itself; to give one an icon, add its folder name to `MODULE_ICONS` in
`src/app/docs/intro/-view/DocsIntroContent.tsx`.

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
