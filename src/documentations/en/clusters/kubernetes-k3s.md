---
title: Kubernetes with k3s
description: Create a k3s Kubernetes cluster on your dPanel servers step by step, run your first app, and serve it on your own domain with HTTPS.
sidebar_position: 3
sidebar_icon: rocket
sidebar_label: Kubernetes with k3s
---

This guide builds a real k3s cluster, **kube-k3s**, on two servers and serves a web app from it at `https://kube-k3s.example.com`. Follow along with your own servers and domain; it takes about 30 minutes, most of it waiting.

k3s is the lightweight engine: one small program, happy on 2 GB of memory and on a Raspberry Pi. For hardened production, see [Kubernetes with RKE2](./kubernetes-rke2.md). New to the words? Read [Server groups and clusters](./overview.md) first.

## Before you start

You need servers that dPanel already manages and that read **Ready**. This guide uses two:

| Server     | Role in the cluster | Size                      |
| ---------- | ------------------- | ------------------------- |
| kube-k3s-1 | **Server**          | 2 CPU, 4 GB, Ubuntu 24.04 |
| kube-k3s-2 | **Agent**           | 2 CPU, 4 GB, Ubuntu 24.04 |

- **Size:** 2 GB of memory or more per server is comfortable; 1 GB is the minimum. amd64, arm64 or armhf (Raspberry Pi) all work.
- **System:** Ubuntu. This guide uses Ubuntu 24.04.
- **Same region** for every server, not in any group, without Docker, k3s or RKE2, and with the dPanel firewall off.
- **Connected over SSH.** Servers that joined through the dPanel agent can't be cluster nodes yet. See [Rules that keep your servers safe](./overview.md#rules-that-keep-your-servers-safe).

A fresh server launched from dPanel with **SSH** under **How dPanel connects** meets all of this. See [Create a cloud server](../servers/cloud-providers/create-a-cloud-server.md). With the dPanel firewall off, nothing on the server blocks ports. On DigitalOcean and IDCloudHost dPanel creates no provider firewall either, so port 30080 and the Kubernetes API on port 6443 can be reached from the internet. Add a provider firewall if you do not want that.

## 1. Start a Kubernetes group

1. Open **Servers**, then **Server groups**, and press **New group**.
2. Under **What should this group be?**, choose **Kubernetes** and press **Next**.

![New group, step Type: the Kubernetes card selected next to Generic, with PostgreSQL, MariaDB, Redis and Kafka marked Coming soon](../../assets/clusters/wizard-type-kubernetes.webp 'Choose Kubernetes. Other cluster types are coming.')

## 2. Pick the servers and their roles

1. **Name**: `kube-k3s`. **Description**: anything that helps, for example "k3s cluster serving kube-k3s.example.com".
2. Under **Servers**, tick **kube-k3s-1** first, then **kube-k3s-2**. Type in **Search servers** to find them quickly.
3. Each picked server appears at the top with a role switch. The first one gets **Server** (the control plane), the others **Agent** (apps only). Press the other button to change a role.

![Two picked servers: kube-k3s-1 with the Server role and kube-k3s-2 with the Agent role, above the server picker](../../assets/clusters/k3s-wizard-servers.webp 'kube-k3s-1 runs the control plane, kube-k3s-2 runs apps.')

## 3. Choose k3s

Scroll down to **Engine**:

1. Pick **k3s**.
2. **Version**: keep the newest, `v1.37.1+k3s1` here.
3. **Built-in ingress**: leave it **off**. dPanel's load balancer brings web traffic in (step 8), and k3s's own ingress would take ports 80 and 443 away from it.

![The Engine choice with k3s selected, version v1.37.1+k3s1 and Built-in ingress off](../../assets/clusters/k3s-wizard-engine.webp 'Pick k3s and keep Built-in ingress off.')

Press **Next**.

## 4. Review and install

The **Review** lists what will be installed where: k3s as **Server** on kube-k3s-1 and as **Agent** on kube-k3s-2. Press **Create and install**.

![The Review step: group kube-k3s, type Kubernetes, engine k3s, version v1.37.1+k3s1, k3s installed as Server on kube-k3s-1 and as Agent on kube-k3s-2](../../assets/clusters/k3s-wizard-review.webp 'Check what will be installed where, then press Create and install.')

dPanel creates the group and starts one install job over both servers: the server first, then the agent.

![The Installing step: Installing kube-k3s, status Installing, last execution cluster_install Queued, and a warning that one server is a single point of failure](../../assets/clusters/k3s-wizard-installing.webp 'The install is queued. With one server, dPanel warns that the control plane has no backup.')

:::info[The single point of failure warning]
With one **Server**, the cluster stops accepting changes if that server goes down; apps already running keep running. That is fine for learning and small projects. Use three servers with the **Server** role when the cluster must survive losing one.
:::

You can close the wizard; the install keeps going. It takes about 10 minutes.

## 5. Check the cluster

Open the group (**Open group page**, or select it in **Server groups**). The **Cluster** tab shows the engine and version, the **API endpoint**, the last execution, and every node with its role. When the install is done, the status and both nodes read **Ready**.

![The kube-k3s group on the Cluster tab: Kubernetes, k3s v1.37.1+k3s1, status Ready, API endpoint on port 6443, cluster_install Succeeded, and two nodes, Server and Agent, both ready](../../assets/clusters/cluster-detail.webp 'A ready k3s cluster: both nodes joined and the install succeeded.')

## 6. Open a terminal on the Server node

You talk to Kubernetes with `kubectl`, run in a terminal on the node with the **Server** role. dPanel opens that terminal in your browser; you need no SSH key or tool on your computer.

1. On the **Cluster** tab, select **kube-k3s-1** in the **Nodes** table. (Or open **Servers** and select it there.)
2. At the top right of the server's page, press **Open terminal**.

![The kube-k3s-1 server page header with the Open terminal button at the top right](../../assets/clusters/server-open-terminal.webp 'Open terminal is at the top right of every server page.')

A terminal opens at the bottom of the page, signed in as the server's login user. Run:

```bash
sudo k3s kubectl get nodes
```

Both nodes read `Ready`. k3s ships `kubectl` inside the `k3s` command, so every command starts with `sudo k3s kubectl`.

## 7. Run your first app

In the same terminal, create `hello.yaml`: run `nano hello.yaml`, paste the text below, then press `Ctrl+O`, `Enter` and `Ctrl+X`. It runs two copies of a tiny web page and opens it on port `30080` of every node (a **NodePort**):

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: hello
spec:
  replicas: 2
  selector:
    matchLabels: { app: hello }
  template:
    metadata:
      labels: { app: hello }
    spec:
      containers:
        - name: hello
          image: hashicorp/http-echo:1.0
          args:
            [
              '-listen=:8080',
              '-text=Hello from kube-k3s, a k3s cluster on dPanel',
            ]
          ports:
            - containerPort: 8080
---
apiVersion: v1
kind: Service
metadata:
  name: hello
spec:
  type: NodePort
  selector: { app: hello }
  ports:
    - { port: 80, targetPort: 8080, nodePort: 30080 }
```

Apply it and check it:

```bash
sudo k3s kubectl apply -f hello.yaml
sudo k3s kubectl get pods -o wide
curl http://127.0.0.1:30080
```

Kubernetes puts one copy on each node, and `curl` answers with the page:

![The browser terminal on kube-k3s-1: kubectl get nodes shows two Ready nodes, kubectl get pods shows one hello pod on each node, and curl answers Hello from kube-k3s, a k3s cluster on dPanel](../../assets/clusters/k3s-terminal.webp 'Both nodes Ready, one copy of the app on each, and the app answering on port 30080.')

## 8. Serve it on your domain with HTTPS

A dPanel [load balancer](../networking/load-balancers.md) on the **Server** node brings web traffic into the cluster:

1. Open **Load Balancers** and press **Create a load balancer**.
2. **Gateway server**: **kube-k3s-1**. **Web server engine**: **Caddy Server**.
3. **Domain Name**: **Managed**, **Subdomain** `kube-k3s`, and your domain. Keep **HTTPS** on.
4. **Routing mode**: **L7**. **Routes**: **Type** **Proxy Pass**, **Matching Path** `/*`, address `127.0.0.1` and port `30080`.
5. Press **Create load balancer**.

On a fresh server the first load balancer also installs Caddy, which can take about 10 minutes; later ones take about a minute. When it reads **Ready**, open `https://kube-k3s.your-domain`. The page reads `Hello from kube-k3s, a k3s cluster on dPanel`, with a valid HTTPS certificate.

:::tip[Why 127.0.0.1 works]
A NodePort is open on **every** node, and Kubernetes forwards it to a running copy, even one on another node. So the gateway sends traffic to itself on port 30080 and still reaches both copies.
:::

## Uninstall, install again or delete

On the group's **Cluster** tab:

- **Uninstall** removes k3s from both nodes. Apps in the cluster stop and their data on the nodes is removed. The servers and the group stay; the cluster reads **Uninstalled**.
- **Install again** shows when an install failed or after an uninstall. It installs on the same servers with the same roles and version.
- **Delete cluster** works on an uninstalled, failed or never-installed cluster. The group stays as a generic group; delete it to free the servers for another cluster.

Delete the load balancer first if you made one for the cluster.

## Not available yet

- Adding or removing nodes after the install, and upgrading the Kubernetes version.
- Downloading a kubeconfig for `kubectl` on your own computer. Use **Open terminal** on the Server node for now.
- Opening the cluster ports in the dPanel firewall automatically; that is why nodes need the firewall off.

## Troubleshooting

| What you see                                                | Fix                                                                                                                                                                     |
| ----------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A server can't be picked: **Already in a group**            | Remove it from its group first, or pick another server.                                                                                                                 |
| Creating fails: the server already runs Docker, k3s or RKE2 | Use a fresh server, or uninstall that software first. If you removed it by hand, press **Refresh inventory** on the server's **Modules** tab so dPanel sees it is gone. |
| The status reads **Failed**                                 | Open the last execution from the **Cluster** tab to read the error, fix it, then press **Install again**.                                                               |
| `kubectl` says permission denied                            | Start the command with `sudo k3s kubectl`.                                                                                                                              |
| The domain doesn't answer                                   | Check `curl http://127.0.0.1:30080` on kube-k3s-1 first, then the load balancer's status and **Logs**.                                                                  |

## From the terminal

The same cluster can be created with the `dnocs` CLI, using the server IDs from `dnocs server list`:

```bash
dnocs cluster create --name kube-k3s --engine k3s --server <ID of the Server node> --agent <ID of the Agent node>
dnocs cluster detail --id <cluster ID>
```

`dnocs cluster install` installs again after a failure, and `dnocs cluster uninstall` and `dnocs cluster delete` remove it. See [AI in the terminal](../ai/ai-in-the-terminal.md) to install `dnocs`.

## Frequently asked questions

### How long does the install take?

About 10 minutes for two servers. You can close the wizard; the install keeps running and the **Cluster** tab shows its progress.

### Can I add a node to the cluster later?

Not yet. The servers and their roles are fixed when you create the cluster. To change them, uninstall and delete the cluster, then create a new one.

### How do I use kubectl from my own computer?

Downloading a kubeconfig is not available yet. Use **Open terminal** on the **Server** node and run `sudo k3s kubectl` there.

### The install failed. What now?

Open the last execution from the **Cluster** tab to read the error, fix the cause, then press **Install again**. It uses the same servers, roles, engine and version.
