import type { DocsSection } from '../-rules/content';

const IMAGES = '/docs/servers';

/** The server guide, in English. Written against the live product. */
export const SERVERS_SECTION_EN: DocsSection = {
  slug: 'servers',
  title: 'Servers',
  summary:
    'Create a server at a cloud provider, see what runs on it, install a database, and remove it when you are done.',
  pages: [
    {
      slug: 'overview',
      title: 'What a server is here',
      summary:
        'One Linux machine that dPanel looks after for you, and the two ways to add one.',
      blocks: [
        {
          kind: 'paragraph',
          text: 'A server is one Linux machine that dPanel looks after for you. It can be a machine dPanel created in your cloud account, or one you already rent and connect yourself.',
        },
        {
          kind: 'paragraph',
          text: 'Once a server is in dPanel, everything below happens in your browser, with no terminal on your own computer.',
        },
        {
          kind: 'list',
          items: [
            'See whether it is healthy, and how much processor, memory and disk it is using.',
            'Install software on it, such as a database or a language runtime.',
            'Start and stop the services running on it.',
            'Manage its Linux user accounts.',
            'Browse its files and read its logs.',
            'Open a terminal on it.',
          ],
        },
        { kind: 'heading', text: 'The two ways to add a server' },
        {
          kind: 'table',
          head: ['', 'Launch a cloud server', 'Connect your own server'],
          rows: [
            [
              'Who it suits',
              'You want a new machine and have a cloud account',
              'You already have a machine running',
            ],
            [
              'What dPanel does',
              'Creates the machine, then sets it up',
              'Connects over SSH, then sets it up',
            ],
            [
              'You need',
              'A cloud project and an SSH key in dPanel',
              'A reachable Ubuntu or Debian server',
            ],
            ['Time', 'About 10 to 20 minutes', 'About 5 minutes'],
          ],
        },
        {
          kind: 'image',
          src: `${IMAGES}/create-choose-path.png`,
          alt: 'The create server page, offering a cloud server or your own server',
          caption: 'Servers, then Create Server, offers both paths.',
        },
        {
          kind: 'paragraph',
          text: 'This guide follows the first path, from an empty list to a working database server and back to an empty list again.',
        },
      ],
    },
    {
      slug: 'before-you-start',
      title: 'Before you start',
      summary:
        'The two things dPanel needs once, then reuses for every server.',
      blocks: [
        { kind: 'heading', text: 'An SSH key' },
        {
          kind: 'paragraph',
          text: 'An SSH key is a pair of files that replaces a password when a computer signs in to a server. One half is public and is written onto the server; the other half is private and never leaves dPanel.',
        },
        {
          kind: 'paragraph',
          text: 'You do not have to create one by hand. Open Backend, then SSH keys, then Create SSH key, and give it a name you will recognise.',
        },
        {
          kind: 'list',
          items: [
            'Key type: pick "For current servers" unless something refuses it. It is shorter and faster, and every current Linux accepts it. "For older servers" is the fallback, and it also asks for a size.',
            'The private half is never shown again. dPanel keeps it encrypted and uses it for you. The page shows the public half, which is safe to copy anywhere, and a fingerprint you can compare with what a server reports.',
          ],
        },
        { kind: 'heading', text: 'A cloud project' },
        {
          kind: 'paragraph',
          text: "A cloud project is dPanel's link to your account at a cloud provider. It holds the credentials that let dPanel create machines on your behalf. Open Backend, then Cloud projects, then Add project, and paste the credentials your provider gives you.",
        },
        {
          kind: 'callout',
          tone: 'info',
          title: 'Who pays for the machine',
          text: 'The machine is created inside your own cloud account, so your provider bills you directly. dPanel does not resell the machine.',
        },
        {
          kind: 'image',
          src: `${IMAGES}/create-step1-provider.png`,
          alt: 'The launch form showing a cloud project and an SSH key ready to pick',
          caption:
            'With both in place, the launch form offers them instead of asking you to connect one.',
        },
      ],
    },
    {
      slug: 'create-a-cloud-server',
      title: 'Create a cloud server',
      summary:
        'The launch form, step by step, from provider to a running machine.',
      blocks: [
        {
          kind: 'paragraph',
          text: 'This walkthrough uses Google Cloud. AWS and DigitalOcean ask the same questions in the same order; the differences are on the providers page.',
        },
        {
          kind: 'paragraph',
          text: 'Open Servers, then Create Server, then Launch a server. The form is one page with three numbered steps and a review panel on the right that fills in as you answer. The counter at its top, such as 3/9, is how many answers dPanel has so far.',
        },
        { kind: 'heading', text: 'Step 1, provider and project' },
        {
          kind: 'list',
          items: [
            'Provider: where the machine will run.',
            'Cloud project: which of your cloud accounts pays for it.',
            'SSH key: the key dPanel will use to reach the machine.',
          ],
        },
        {
          kind: 'image',
          src: `${IMAGES}/create-step1-provider.png`,
          alt: 'Step one of the launch form, with provider, cloud project and SSH key',
        },
        { kind: 'heading', text: 'Step 2, location' },
        {
          kind: 'list',
          items: [
            'Region is the part of the world the machine runs in. Choose one close to the people who will use it.',
            'Zone is one data centre inside that region. Any of them is fine.',
            'Network is filled in for you. dPanel creates a network called dpanel-network the first time it launches in a region and reuses it after that, with only SSH and the web ports open.',
          ],
        },
        {
          kind: 'image',
          src: `${IMAGES}/create-step2-location-size.png`,
          alt: 'Step two of the launch form, with region, zone and network',
        },
        { kind: 'heading', text: 'Step 3, size and image' },
        {
          kind: 'list',
          items: [
            'Server name is how the machine appears in dPanel and at your provider.',
            'Machine type is how much processor and memory it has. A small size is enough to try things out.',
            'Ubuntu release: 24.04 LTS is the safe default, and LTS means years of security updates.',
            'Disk is the size in gigabytes.',
          ],
        },
        { kind: 'heading', text: 'Launch' },
        {
          kind: 'paragraph',
          text: 'When the review panel says Ready to launch, every answer is in. Press Launch server.',
        },
        {
          kind: 'image',
          src: `${IMAGES}/create-step3-ready.png`,
          alt: 'The review panel reading ready to launch',
        },
        {
          kind: 'image',
          src: `${IMAGES}/create-launched.png`,
          alt: 'A dialog confirming that the server is being created',
          caption: 'Choose Open server to watch it come up.',
        },
        {
          kind: 'paragraph',
          text: 'A blue banner says dPanel is setting this server up while it works. Expect 10 to 20 minutes: the provider creates the machine, then dPanel installs its agent, reads what is on the machine and opens the ports it needs. When the banner goes and the badge reads Ready, the server is yours to use.',
        },
        {
          kind: 'callout',
          tone: 'warning',
          title: 'If setup fails',
          text: 'A red banner says so and offers See what happened, which shows the reason the provider or the setup gave. The usual causes are a cloud account without enough quota, and credentials that have expired.',
        },
      ],
    },
    {
      slug: 'cloud-providers',
      title: 'Cloud providers',
      summary: 'What differs between Google Cloud, AWS and DigitalOcean.',
      blocks: [
        {
          kind: 'paragraph',
          text: 'Three providers are covered here because they are the ones tested end to end. The others appear in the form and work the same way, and each gets its own section once it has been through the same testing.',
        },
        {
          kind: 'paragraph',
          text: 'Whichever you pick, the form asks the same questions and the finished server behaves identically: same agent, same tabs, same modules.',
        },
        { kind: 'heading', text: 'Google Cloud' },
        {
          kind: 'list',
          items: [
            'Location is asked in two parts: a region, then a zone inside it.',
            'Size is a machine type, such as e2-small.',
            'dPanel creates dpanel-network in the region on first use and opens SSH and the web ports.',
            'The login user is ubuntu.',
          ],
        },
        { kind: 'heading', text: 'AWS' },
        {
          kind: 'image',
          src: `${IMAGES}/create-provider-aws.png`,
          alt: 'The launch form with AWS selected',
        },
        {
          kind: 'list',
          items: [
            'Location is a region, and dPanel picks a subnet inside it.',
            'Size is an instance type, such as t3.small.',
            'dPanel creates its own network and security group on first use, so a new account needs no preparation beyond credentials.',
            'The login user is ubuntu.',
          ],
        },
        { kind: 'heading', text: 'DigitalOcean' },
        {
          kind: 'image',
          src: `${IMAGES}/create-provider-digitalocean.png`,
          alt: 'The launch form with DigitalOcean selected',
        },
        {
          kind: 'list',
          items: [
            'Location is a single choice: the datacenter region.',
            'Size is a droplet size.',
            'The login user is dpanel, which is the one difference you notice when you open a terminal.',
          ],
        },
      ],
    },
    {
      slug: 'your-server-page',
      title: 'Your server page',
      summary: 'What each tab on a server is for.',
      blocks: [
        {
          kind: 'paragraph',
          text: 'Every server has one page, and everything you can do to that server is on it. The header shows the name, whether it is ready, its address, its Ubuntu release, where it runs, the login dPanel uses, the agent version and when it was created.',
        },
        {
          kind: 'image',
          src: `${IMAGES}/server-overview.png`,
          alt: 'A server page on the Overview tab',
          caption:
            'Overview: live usage read from the agent, then counts and details.',
        },
        { kind: 'heading', text: 'Modules' },
        {
          kind: 'paragraph',
          text: 'Everything dPanel has installed, with its version and whether it is healthy. Add module opens the catalogue.',
        },
        {
          kind: 'image',
          src: `${IMAGES}/server-modules.png`,
          alt: 'The Modules tab listing installed modules',
        },
        { kind: 'heading', text: 'Services' },
        {
          kind: 'paragraph',
          text: 'Every systemd unit the agent can see. A service is a program Linux keeps running in the background, such as a database or a web server. Start, stop, restart or reload one from the menu at the end of its row.',
        },
        {
          kind: 'paragraph',
          text: 'Most servers have well over a hundred of these, and many sit in Dead or Exited on purpose, so the Needs attention count on a fresh machine is normal.',
        },
        {
          kind: 'image',
          src: `${IMAGES}/server-services.png`,
          alt: 'The Services tab listing systemd units',
        },
        { kind: 'heading', text: 'Users' },
        {
          kind: 'paragraph',
          text: 'The Linux accounts on the machine, with their home directory and login shell. Most entries on a fresh server belong to the system and should be left alone.',
        },
        {
          kind: 'image',
          src: `${IMAGES}/server-users.png`,
          alt: 'The Users tab listing Linux accounts',
        },
        { kind: 'heading', text: 'Network' },
        {
          kind: 'paragraph',
          text: 'Which ports are open, which process holds each one, and where connections are allowed from. This is the page to check when something cannot be reached.',
        },
        {
          kind: 'image',
          src: `${IMAGES}/server-network.png`,
          alt: 'The Network tab listing open ports',
        },
        { kind: 'heading', text: 'Files and Logs' },
        {
          kind: 'paragraph',
          text: 'Files opens a file manager for browsing, uploading and previewing text files. Logs shows the newest lines of a log file on the server, parsed into time, level and message, with a filter.',
        },
        {
          kind: 'image',
          src: `${IMAGES}/server-logs.png`,
          alt: 'The Logs tab showing parsed log lines',
        },
        { kind: 'heading', text: 'Settings' },
        {
          kind: 'paragraph',
          text: 'The changes you rarely need, each saying what it does: edit the connection details, run setup again, move the server to another workspace, and the danger zone that deletes it.',
        },
        {
          kind: 'image',
          src: `${IMAGES}/server-settings.png`,
          alt: 'The Settings tab with connection, setup, ownership and danger zone',
        },
      ],
    },
    {
      slug: 'install-software',
      title: 'Install software',
      summary: 'Add a database or a runtime through the module catalogue.',
      blocks: [
        {
          kind: 'paragraph',
          text: 'dPanel installs software through modules. A module is a tested recipe: you answer a couple of questions, dPanel does the installing, configuring and starting on the server, and then keeps track of what it put there.',
        },
        {
          kind: 'paragraph',
          text: 'Open the server, go to Modules, and press Add module. The catalogue groups what is available: databases, language runtimes, containers, content management and infrastructure.',
        },
        {
          kind: 'image',
          src: `${IMAGES}/server-module-catalog.png`,
          alt: 'The module catalogue, grouped by category',
        },
        { kind: 'heading', text: 'Installing a database' },
        {
          kind: 'paragraph',
          text: 'Press Install on the one you want. The form lists what the module will run and asks only for what it cannot decide for you: for a database that is the version, the password for its administrator account, and which addresses it should listen on.',
        },
        {
          kind: 'image',
          src: `${IMAGES}/server-module-install-form.png`,
          alt: 'The MariaDB install form, with a masked password field',
        },
        {
          kind: 'callout',
          tone: 'warning',
          title: 'Choose the password yourself',
          text: 'The administrator password is required and must be at least 8 characters. There is no default, because a database installed with a published default password is reachable by anyone who knows it. dPanel stores it encrypted on the server and never shows it again, so keep your own copy somewhere safe.',
        },
        {
          kind: 'paragraph',
          text: 'Press Install role and confirm. The module appears as Installing, and a database takes a few minutes.',
        },
        {
          kind: 'image',
          src: `${IMAGES}/server-module-installing.png`,
          alt: 'The modules list showing MariaDB installing',
        },
        {
          kind: 'image',
          src: `${IMAGES}/server-module-installed.png`,
          alt: 'The modules list showing MariaDB installed',
          caption: 'The row turns to Installed when it is done.',
        },
        { kind: 'heading', text: 'Checking the result' },
        {
          kind: 'list',
          items: [
            'The Modules tab shows it as Installed, with the version.',
            'The Overview tab lists it under What runs here, as reported by the agent.',
            'The Services tab shows its service running.',
          ],
        },
        {
          kind: 'paragraph',
          text: 'If you manage a fleet, a server group installs the same module on every member in one operation and shows the result per server. Groups are under Servers, then Server groups.',
        },
      ],
    },
    {
      slug: 'connect-over-ssh',
      title: 'Connect over SSH',
      summary:
        'The terminal in your browser, and connecting from your own machine.',
      blocks: [
        {
          kind: 'paragraph',
          text: 'Most of the time you will not need a terminal: the tabs cover services, users, files and logs. When you do, press Open terminal at the top of the server page. dPanel signs in with the key it holds and drops you at a shell.',
        },
        {
          kind: 'image',
          src: `${IMAGES}/server-terminal.png`,
          alt: 'A shell session on the server, inside the browser',
        },
        {
          kind: 'paragraph',
          text: 'Nothing is installed on your computer and you do not need the private key. The session belongs to the login user dPanel set up, which is ubuntu on Google Cloud and AWS, and dpanel on DigitalOcean.',
        },
        { kind: 'heading', text: 'From your own machine' },
        {
          kind: 'paragraph',
          text: 'If you prefer your own terminal, connect with any SSH client using the login shown in the server header.',
        },
        { kind: 'code', code: 'ssh ubuntu@203.0.113.10' },
        {
          kind: 'paragraph',
          text: "For that to work, your computer's own public key has to be on the server. The key dPanel generated stays inside dPanel, so add yours to the server's authorized_keys file, through the Files tab or the browser terminal above.",
        },
        {
          kind: 'code',
          code: 'echo "ssh-ed25519 AAAA... you@example.com" >> ~/.ssh/authorized_keys',
        },
        {
          kind: 'paragraph',
          text: 'Paste your own public key in place of the example. On your machine it is usually at ~/.ssh/id_ed25519.pub.',
        },
      ],
    },
    {
      slug: 'delete-a-server',
      title: 'Delete a server',
      summary: 'Stop paying for a machine you have finished with.',
      blocks: [
        {
          kind: 'paragraph',
          text: 'A cloud machine is billed by your provider for as long as it exists, so remove one as soon as you are finished with it. Open the server, go to Settings, and look at the danger zone.',
        },
        {
          kind: 'image',
          src: `${IMAGES}/server-delete.png`,
          alt: 'The delete dialog, listing what happens and asking for the server name',
          caption:
            'The dialog lists what will happen and asks you to type the name to confirm.',
        },
        {
          kind: 'callout',
          tone: 'danger',
          title: 'This cannot be undone',
          text: 'For a server dPanel created, deleting removes it from dPanel and destroys the machine at your cloud provider, with everything on it. For a server you connected yourself, dPanel only forgets it and your machine keeps running.',
        },
        {
          kind: 'paragraph',
          text: 'Deletion is refused while applications or load balancers still use the server, so remove those first. The row then shows Deleting while the provider tears the machine down, and disappears from the list.',
        },
        { kind: 'heading', text: 'Checking that it is gone' },
        {
          kind: 'paragraph',
          text: "The Servers list is the first check. The second is your provider's own console: dPanel reports what the provider told it, so a delete that half fails at the provider shows up there.",
        },
      ],
    },
  ],
};
