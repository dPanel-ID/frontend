---
title: VM worker
description: Run your dPanel jobs on a server or VM you control. Add a VM worker in dPanel, copy its token once, and run the dPanel executor on the machine as a service.
sidebar_position: 3
sidebar_icon: server
---

A VM worker is a server or VM (virtual machine: a computer rented or run in software) that takes your dPanel workspace's jobs. It runs all the time, asks dPanel for jobs, and runs them against your servers over SSH. Use it when servers connected over SSH are reachable only from your own network.

:::tip[Servers behind a router don't need a worker]
If your servers are at home or behind a router, the simpler way is to [connect them with the dPanel agent](../servers/register-a-private-machine.md). Their jobs then run on the servers themselves, and you need no VM worker.
:::

## Before you start

- A Linux server or VM (Ubuntu 22.04 or 24.04) that can reach your servers over SSH and `https://pawon.devetek.app` over HTTPS. You do not add SSH keys: dPanel gives the worker your servers' SSH access with each job.
- Python 3 (Ubuntu includes it).

## 1. Add the worker in dPanel

1. Open **Profile** for your personal workspace, or your team's page.
2. In **Workers**, press **Add worker** and choose **VM**.
3. **Name**: for example "Office VM".
4. **Executor ID**: 2 to 63 lowercase letters, digits or hyphens, for example `office-vm-01`.
5. Press **Add worker**.

![The Add worker dialog on the VM tab, with Name Office VM and Executor ID office-vm-01](../../assets/workers/add-vm-worker.webp 'Add worker → VM, filled in.')

dPanel shows a **token** and the settings for the machine. **Save the token now**: it is shown only once.

![The Office VM added dialog with a masked worker token and the environment for the executor: token, workspace ID, manager URL and worker ID](../../assets/workers/vm-worker-token.webp 'Copy the environment block now; the token is shown only once. (The token is hidden in this picture.)')

## 2. Install the executor on the machine

```bash
sudo apt-get update && sudo apt-get install -y python3-venv
sudo python3 -m venv /opt/dpanel-ansible
sudo /opt/dpanel-ansible/bin/pip install "ansible-core>=2.16,<2.17" jmespath
sudo ln -sf /opt/dpanel-ansible/bin/ansible* /usr/local/bin/
base=https://raw.githubusercontent.com/dPanel-ID/artifacts/main/executor
version=$(curl -fsSL "$base/LATEST")
curl -fsSL -o dpanelprod-executor "$base/$version/dpanelprod-executor-linux-amd64"
curl -fsSL "$base/$version/SHA256SUMS" | sed 's/dpanelprod-executor-linux-amd64/dpanelprod-executor/' | grep ' dpanelprod-executor$' | sha256sum -c -
chmod +x dpanelprod-executor && sudo mv dpanelprod-executor /usr/local/bin/
```

On an ARM machine, change `linux-amd64` to `linux-arm64` on both the `curl -o` line and the `sed` line.

## 3. Run it as a service

Create `/etc/dpanel-worker.env` with the settings dPanel showed you (readable only by root):

```bash
DPANEL_EXECUTOR_MANAGER_URL=https://pawon.devetek.app
DPANEL_EXECUTOR_TOKEN=dpw_your_token
DPANEL_EXECUTOR_WORKSPACE_ID=group:1234567890
DPANEL_EXECUTOR_WORKER_ID=office-vm-01
ENV=production
```

Then create `/etc/systemd/system/dpanel-worker.service`:

```ini
[Unit]
Description=dPanel worker
After=network-online.target

[Service]
EnvironmentFile=/etc/dpanel-worker.env
WorkingDirectory=/var/lib/dpanel-worker
ExecStart=/usr/local/bin/dpanelprod-executor
Restart=always
User=dpanel-worker

[Install]
WantedBy=multi-user.target
```

```bash
sudo useradd --system --create-home --home-dir /var/lib/dpanel-worker dpanel-worker
sudo chmod 600 /etc/dpanel-worker.env
sudo systemctl daemon-reload && sudo systemctl enable --now dpanel-worker
```

## 4. Switch to private workers

In **Workers**, choose **Private workers** and confirm. The worker's **Last seen** time updates once it asks for jobs.

![The Workers card listing a VM worker office-vm-01 and a GitHub workflow worker acme/dpanel-workers, with the Private workers option next to Shared workers](../../assets/workers/worker-list.webp 'Your workers are listed under the mode switch. Choose Private workers to send jobs to them.')

:::tip[Run several jobs at once]
Set `DPANEL_EXECUTOR_SLOTS=3` in the settings file to let one VM run three jobs at the same time.
:::

## Lost the token?

Press **New token** on the worker. The old token stops working right away; put the new one in `/etc/dpanel-worker.env` and restart the service with `sudo systemctl restart dpanel-worker`.

## Frequently asked questions

### Which machine can be a VM worker?

Any Linux server or VM, Ubuntu 22.04 or 24.04, that can reach your servers over SSH and `https://pawon.devetek.app` over HTTPS. It can sit inside your private network.

### How do I know the worker is connected?

Its **Last seen** time in the **Workers** card updates once it asks dPanel for jobs. A worker that never connected reads **Not seen yet**.

### Can I add a VM worker from the terminal?

Yes. `dnocs worker add --type vm --name office --executor-id office-01` prints the token once. `dnocs worker rotate-token --id <worker ID>` gives it a new one.

### What happens when I remove a VM worker?

It stops taking jobs and its token stops working. Stop the executor service on the machine too, with `sudo systemctl disable --now dpanel-worker`.
