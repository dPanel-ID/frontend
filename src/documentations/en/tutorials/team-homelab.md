---
title: Share a homelab with your team
description: Connect your home servers, PCs and Raspberry Pis to dPanel with the dPanel agent and put them in a team workspace, so everyone in the team can manage them with their own role. No SSH, public IP or open port needed.
sidebar_position: 4
sidebar_icon: users
sidebar_label: Team homelab
---

Homelab machines join dPanel with the dPanel agent: you run one command on each machine, and the agent connects out to dPanel. You don't need SSH, a public IP or port forwarding on your router. Never connected a machine before? Follow [Connect a server with the dPanel agent](../servers/register-a-private-machine.md) first; it explains every step for a single machine.

A machine you connect lands in the workspace you picked: the one selected in dPanel when you choose **Get install command**, or the one your dnocs is pointed at when you use `sudo dnocs machine register`. If that is your personal space, only you can see it. This tutorial puts homelab machines in a **team workspace** instead, so the whole team shares them: each member opens the same servers, installs software and deploys apps, within the role you give them.

We use a workspace called **Home Lab** with two machines:

- `homelab-nas`, connected straight into the workspace (Part 2).
- `homelab-pi`, which was already connected in a personal space and is moved into the workspace (Part 3).

Both have no public IP and no open port. They reach dPanel through the agent, as explained in [Connect a server with the dPanel agent](../servers/register-a-private-machine.md).

## What you need first

- A team workspace, and a role that can add servers to it: Owner, Admin or DevOps. Create one from the workspace picker with **New workspace** (see [Workspaces](../getting-started/workspaces.md)).
- The workspace ID. You find it in the workspace picker, or with `dnocs workspace list`.
- On each machine: Linux with systemd on Intel/AMD (`amd64`) or ARM (`arm64`), `sudo` and internet access. dnocs is needed only for the command line way and for moving a machine (Part 3): [Install dnocs](../ai/ai-in-the-terminal.md#install-dnocs).

## No spare machine? Try it in a container

You can try everything in this tutorial without a spare PC: run a Linux container with Docker or Podman on your laptop or any server, and connect the container as if it were a homelab machine. Each container becomes its own server in dPanel. This works with Ubuntu 24.04, Ubuntu 26.04 and Debian 13, on Linux, macOS and Windows (Docker Desktop).

:::warning[For trying dPanel only]
The container runs systemd and the dPanel agent, which install software and system services, so it starts with `--privileged`: it has nearly the same power as your own computer's administrator. Use it to try dPanel, not to host real websites; for those, connect a real machine or VM.
:::

**1. Save this file** as `Containerfile` in an empty folder. It installs systemd (the dPanel agent runs as a system service), `sudo` and `curl`, and adds a user called `dpanel` that may use `sudo`. The empty `/etc/machine-id` makes every container get its own machine ID, so each one is a separate server.

```dockerfile
ARG BASE=docker.io/library/ubuntu:24.04
FROM ${BASE}
ENV container=docker
RUN apt-get update \
 && DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends \
      systemd systemd-sysv sudo curl ca-certificates iproute2 \
 && apt-get clean && rm -rf /var/lib/apt/lists/* \
 && rm -f /var/lib/dbus/machine-id && : > /etc/machine-id
RUN useradd -m -s /bin/bash -G sudo dpanel \
 && echo 'dpanel ALL=(ALL) NOPASSWD:ALL' > /etc/sudoers.d/dpanel
STOPSIGNAL SIGRTMIN+3
CMD ["/sbin/init"]
```

**2. Build an image** for the Linux you want to try. Pick one line:

```bash
docker build -f Containerfile --build-arg BASE=docker.io/library/ubuntu:24.04 -t dpanel-lab-ubuntu24 .
docker build -f Containerfile --build-arg BASE=docker.io/library/ubuntu:26.04 -t dpanel-lab-ubuntu26 .
docker build -f Containerfile --build-arg BASE=docker.io/library/debian:13 -t dpanel-lab-debian13 .
```

With Podman, write `podman build` instead of `docker build`; the rest is the same.

**3. Start a container** that boots systemd. The `--hostname` is the name the server gets in dPanel:

```bash
docker run -d --name homelab-nas --hostname homelab-nas \
  --privileged --cgroupns=host -v /sys/fs/cgroup:/sys/fs/cgroup:rw \
  dpanel-lab-ubuntu24
```

With Podman, which starts systemd by itself when the image runs `/sbin/init`:

```bash
sudo podman run -d --name homelab-nas --hostname homelab-nas dpanel-lab-ubuntu24
```

After a few seconds, `docker exec homelab-nas systemctl is-system-running` (or `sudo podman exec …`) prints `running` or `degraded`; both are fine.

**4. Connect it to dPanel**, the same two ways as in [Part 2](#part-2-connect-a-machine-straight-into-the-workspace):

- **The one-line command from the website.** Open a shell in the container with `docker exec -it homelab-nas bash`, paste the command from **Get install command** and press Enter.
- **dnocs.** Open a shell as the `dpanel` user, install dnocs, sign in, then connect:

  ```bash
  docker exec -it -u dpanel -w /home/dpanel homelab-nas bash
  curl --proto '=https' --tlsv1.2 -sSf https://dnocs.devetek.app/installer.sh | sh
  dnocs auth login -u <your username>
  dnocs workspace set --id <workspace id>
  sudo dnocs machine register
  ```

Within a minute the server shows **Ready** in dPanel. Start more containers with other names (`homelab-pi`, …) or other images to get more servers.

:::tip[Run dnocs machine register with sudo, from the user who signed in]
`dnocs machine register` installs a system service, so it must run as root, and it reads the sign-in of the user who typed `sudo`. Sign in as `dpanel` and run `sudo dnocs machine register`. A root shell (`sudo su -`, `sudo -s` or `docker exec` without `-u dpanel`) has no sign-in of its own, so dnocs answers `please login first using 'dnocs auth login'`; run `dnocs auth login` in that shell first, or go back to the `dpanel` user.
:::

**5. When you are done**, delete the server in dPanel (**Settings** on the server page, or `dnocs server delete --id <server id>`), then remove the container with `docker rm -f homelab-nas` (or `sudo podman rm -f homelab-nas`). Restarting the container keeps the same server.

## Part 1: Pick the team workspace

In dPanel, open the workspace picker at the top left. Personal resources and team workspaces are kept apart; the ID column shows each workspace's ID.

![The Select workspace dialog with the personal workspace and the Home Lab team workspace, its ID 1305126145648220810 and the Owner role](../../assets/tutorials/homelab-workspace-picker.webp)

## Part 2: Connect a machine straight into the workspace

From the website:

1. Switch dPanel to the **Home Lab** workspace in the workspace picker.
2. Open **Servers**, then **Create Server**.
3. On the **Connect a server with the dPanel agent** card, type `homelab-nas` as the server name and choose **Get install command**.
4. Choose **Copy**, then paste the command into a terminal on the machine and run it. It asks for `sudo`.
5. The card says **Connected!** once the agent connects, usually in under a minute. The server is created in the Home Lab workspace.

The command works once, for 2 hours; get a new one for each machine. The machine needs no dnocs and no sign-in.

**Prefer the command line?** On the machine, sign in as your normal user, point dnocs at the team workspace, then connect it:

```bash
dnocs auth login -u <your username>
dnocs workspace set --id <workspace id>
sudo dnocs machine register
```

dnocs names the workspace in its question, so you can check you picked the right one before you confirm. It then creates a Linux user for your dPanel account, installs the agent and waits until the server is ready, usually in under a minute. The server is created in that workspace. To read the install script before running it, use `sudo dnocs machine register --print-only`.

![A terminal on homelab-nas: dnocs workspace list, dnocs workspace set to Home Lab, then sudo dnocs machine register asking to register it in workspace Home Lab and reporting server 209 ready](../../assets/tutorials/homelab-register.webp)

## Part 3: Move a machine from your personal space

A machine you connected earlier in your personal space can move to the team with `dnocs transfer`. It keeps its server ID, its agent, its installed software and its apps:

```bash
dnocs transfer server --id <server id> --to "<workspace name or id>"
```

dnocs shows what moves and asks you to confirm (`--yes` skips the question). A move is one way: once a server is in a workspace, it cannot go back to a personal space or on to another workspace.

![A terminal on homelab-pi: dnocs transfer server 210 to Home Lab reports it moved, then dnocs server list in the Home Lab workspace shows homelab-pi and homelab-nas, both ready](../../assets/tutorials/homelab-transfer.webp)

Running `sudo dnocs machine register` again on a moved machine works only from the workspace it now belongs to; from your personal space dnocs refuses, so a machine cannot be pulled out of the team by accident.

## Part 4: Check the servers in the workspace

Switch dPanel to the team workspace and open **Servers**. Both machines are there with a **Private** badge, owned by the workspace, with who added them.

![The Home Lab servers page listing homelab-pi and homelab-nas, both Private and Ready, owner Home Lab, created by the person who registered them](../../assets/tutorials/homelab-servers.webp)

Each server page shows the workspace as its **Ownership**. Everything from the [dPanel agent guide](../servers/register-a-private-machine.md) works the same here: modules, apps, the terminal, files, logs, the database manager and load balancers. Jobs for these servers still run on the machines themselves, whatever workers the workspace uses.

![The homelab-pi server page in the Home Lab workspace: local address, connection through the dPanel agent, Ownership Home Lab, and Redis installed](../../assets/tutorials/homelab-server.webp)

## Part 5: Invite your team

Open **Teams**, then the workspace, to see its members and the workspace's workers.

![The Home Lab team page with its members, your Owner role, and the workers section using dPanel's shared workers](../../assets/tutorials/homelab-team.webp)

Choose **Add Member**, pick the person and the roles they get. The role decides what they can do with the homelab:

![The Add New People dialog: a user picker and the workspace roles Owner, Admin, DevOps, Developer, Viewer and Billing](../../assets/tutorials/homelab-add-member.webp)

| Role | With the homelab servers |
| --- | --- |
| Owner, Admin | Everything, including adding and removing servers and members |
| DevOps | Add and manage servers, install modules, open the terminal and databases; cannot delete |
| Developer | Deploy and manage applications on the servers; sees the servers but cannot change them or open their terminal; cannot delete |
| Viewer | Look only: servers, usage, logs and jobs |

See [Members and roles](../teams/members-and-roles.md) for every role in detail.

## Good to know

- A workspace can connect up to 10 machines this way (cloud servers dPanel creates don't count), and a machine belongs to one workspace at a time.
- To publish a website from a homelab machine, add a load balancer and forward ports 80 and 443 on your router to the machine. See [Put a load balancer on it](../servers/register-a-private-machine.md#put-a-load-balancer-on-it).
- Removing a person from the workspace takes their access to its servers away at once; the machines keep running.
- Deleting a server in dPanel removes it at once and revokes its agent. Stop the agent on the machine afterwards with `sudo systemctl disable --now dpanel-agent`.
