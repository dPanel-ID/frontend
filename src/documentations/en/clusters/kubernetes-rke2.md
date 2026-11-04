---
title: Kubernetes with RKE2
description: Create an RKE2 Kubernetes cluster on your dPanel servers step by step, open a terminal on its node, run your first app, and serve it on your own domain with HTTPS.
sidebar_position: 4
sidebar_icon: shield-check
sidebar_label: Kubernetes with RKE2
---

This guide builds a real RKE2 cluster, **kube-rke**, on two servers and serves a web app from it at `https://kube-rke.devetek.app`. Follow along with your own servers and domain; it takes about 30 minutes, most of it waiting.

RKE2 is Rancher's security-focused Kubernetes: CIS-ready defaults, the Canal network plugin, and its control plane (etcd, API server, scheduler) running as visible pods. It needs bigger servers than k3s and runs on amd64 and arm64 only. For small machines or a Raspberry Pi, see [Kubernetes with k3s](./kubernetes-k3s.md). New to the words? Read [Server groups and clusters](./overview.md) first.

## Before you start

You need servers that dPanel already manages and that read **Ready**. This guide uses two:

| Server     | Role in the cluster | Size                      |
| ---------- | ------------------- | ------------------------- |
| kube-rke-1 | **Server**          | 2 CPU, 4 GB, Ubuntu 24.04 |
| kube-rke-2 | **Agent**           | 2 CPU, 4 GB, Ubuntu 24.04 |

- **Size:** 2 CPU and 4 GB of memory or more per server, amd64 or arm64. RKE2 runs more system pods than k3s; smaller servers struggle.
- **System:** Ubuntu 22.04 or 24.04.
- **Same region** for every server, not in any group, without Docker, k3s or RKE2, and with the dPanel firewall off.

A fresh server launched from dPanel meets all of this. See [Create a cloud server](../servers/cloud-providers/create-a-cloud-server.md).

## 1. Start a Kubernetes group

1. Open **Servers**, then **Server groups**, and press **New group**.
2. Under **What should this group be?**, choose **Kubernetes** and press **Next**.

![New group, step Type: the Kubernetes card selected next to Generic, with PostgreSQL, MariaDB, Redis and Kafka marked Coming soon](../../assets/clusters/wizard-type-kubernetes.webp 'Choose Kubernetes. Other cluster types are coming.')

## 2. Pick the servers and their roles

1. **Name**: `kube-rke`. **Description**: anything that helps, for example "RKE2 cluster serving kube-rke.devetek.app".
2. Under **Servers**, type `kube-rke` in **Search servers**, then tick **kube-rke-1** first and **kube-rke-2** second.
3. Each picked server appears at the top with a role switch. The first one gets **Server** (the control plane), the others **Agent** (apps only). Press the other button to change a role.

![The Configuration step with name kube-rke, a description, and two picked servers: kube-rke-1 with the Server role and kube-rke-2 with the Agent role](../../assets/clusters/rke2-wizard-servers.webp 'Search narrows the list; kube-rke-1 runs the control plane, kube-rke-2 runs apps.')

## 3. Choose RKE2

Scroll down to **Engine**:

1. Pick **RKE2**. On amd64 servers with enough memory it is already selected.
2. **Version**: keep the newest, `v1.37.1+rke2r1` here.
3. **Built-in ingress**: leave it **off**. dPanel's load balancer brings web traffic in (step 8), and RKE2's ingress-nginx would take ports 80 and 443 away from it.

![The Engine choice with RKE2 selected, version v1.37.1+rke2r1 and Built-in ingress off](../../assets/clusters/rke2-wizard-engine.webp 'Pick RKE2 and keep Built-in ingress off.')

Press **Next**.

## 4. Review and install

The **Review** lists what will be installed where: RKE2 as **Server** on kube-rke-1 and as **Agent** on kube-rke-2. Press **Create and install**.

![The Review step: group kube-rke, type Kubernetes, engine RKE2, version v1.37.1+rke2r1, RKE2 installed as Server on kube-rke-1 and as Agent on kube-rke-2](../../assets/clusters/rke2-wizard-review.webp 'Check what will be installed where, then press Create and install.')

dPanel creates the group and starts one install job over both servers: the server first, then the agent.

![The Installing step: Installing kube-rke, status Installing, engine RKE2 v1.37.1+rke2r1, last execution cluster_install Queued, and the single point of failure warning](../../assets/clusters/rke2-wizard-installing.webp 'The install is queued.')

:::info[The single point of failure warning]
With one **Server**, the cluster stops accepting changes if that server goes down; apps already running keep running. Use three servers with the **Server** role when the cluster must survive losing one.
:::

You can close the wizard; the install keeps going. It takes about 12 minutes: RKE2 pulls more images than k3s.

## 5. Check the cluster

Open the group (**Open group page**, or select it in **Server groups**). The **Cluster** tab shows the engine and version, the **API endpoint**, the last execution, and every node with its role. When the install is done, the status and both nodes read **Ready**.

![The kube-rke group on the Cluster tab: Kubernetes, RKE2 v1.37.1+rke2r1, status Ready, API endpoint on port 6443, cluster_install Succeeded, and two nodes, Server and Agent, both ready](../../assets/clusters/rke2-cluster-detail.webp 'A ready RKE2 cluster: both nodes joined and the install succeeded.')

## 6. Open a terminal on the Server node

You talk to Kubernetes with `kubectl`, run in a terminal on the node with the **Server** role. dPanel opens that terminal in your browser; you need no SSH key or tool on your computer.

1. On the **Cluster** tab, select **kube-rke-1** in the **Nodes** table. (Or open **Servers** and select it there.)
2. At the top right of the server's page, press **Open terminal**.

![The kube-rke-1 server page header with the Open terminal button at the top right](../../assets/clusters/rke2-open-terminal.webp 'Open terminal is at the top right of every server page.')

A terminal opens at the bottom of the page. RKE2 keeps `kubectl` and its kubeconfig in its own folders, so set them once per terminal:

```bash
sudo -i
export PATH=$PATH:/var/lib/rancher/rke2/bin
export KUBECONFIG=/etc/rancher/rke2/rke2.yaml
kubectl get nodes
```

Both nodes read `Ready`. RKE2 names them after dPanel's server IDs, such as `dpanel-186`. The rest of this guide assumes that root shell.

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
              '-text=Hello from kube-rke, a RKE2 cluster on dPanel',
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
kubectl apply -f hello.yaml
kubectl get pods -o wide
curl http://127.0.0.1:30080
```

Kubernetes puts one copy on each node, and `curl` answers with the page:

![The browser terminal on kube-rke-1: kubectl get nodes shows dpanel-186 and dpanel-187 Ready, kubectl get pods shows one hello pod on each node, and curl answers Hello from kube-rke, a RKE2 cluster on dPanel](../../assets/clusters/rke2-terminal.webp 'Both nodes Ready, one copy of the app on each, and the app answering on port 30080.')

## 8. Serve it on your domain with HTTPS

A dPanel [load balancer](../networking/load-balancers.md) on the **Server** node brings web traffic into the cluster:

1. Open **Load Balancers** and press **Create a load balancer**.
2. **Gateway server**: **kube-rke-1**. **Web server engine**: **Caddy Server**.
3. **Domain Name**: **Managed**, **Subdomain** `kube-rke`, and your domain. Keep **HTTPS** on.
4. **Routing mode**: **L7**. **Routes**: **Type** **Proxy Pass**, **Matching Path** `/*`, address `127.0.0.1` and port `30080`.
5. Press **Create load balancer**.

On a fresh server the first load balancer also installs Caddy, which takes about 10 minutes; later ones take about a minute. When it reads **Ready**, open `https://kube-rke.your-domain`. The page reads `Hello from kube-rke, a RKE2 cluster on dPanel`, with a valid HTTPS certificate.

:::tip[Why 127.0.0.1 works]
A NodePort is open on **every** node, and Kubernetes forwards it to a running copy, even one on another node. So the gateway sends traffic to itself on port 30080 and still reaches both copies.
:::

## Uninstall, install again or delete

On the group's **Cluster** tab:

- **Uninstall** removes RKE2 from both nodes (it runs RKE2's own uninstall script). Apps in the cluster stop and their data on the nodes is removed. The servers and the group stay; the cluster reads **Uninstalled**.
- **Install again** shows when an install failed or after an uninstall. It installs on the same servers with the same roles and version.
- **Delete cluster** works on an uninstalled, failed or never-installed cluster. The group stays as a generic group; delete it to free the servers for another cluster.

This guide's cluster went through all three: it was first created from the command line, uninstalled, deleted with its group, and created again on the same two servers through the wizard above.

Delete the load balancer first if you made one for the cluster.

## Not available yet

- Adding or removing nodes after the install, and upgrading the Kubernetes version.
- Downloading a kubeconfig for `kubectl` on your own computer. Use **Open terminal** on the Server node for now.
- Opening the cluster ports in the dPanel firewall automatically; that is why nodes need the firewall off.

## Troubleshooting

| What you see                                                | Fix                                                                                                                                                                     |
| ----------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| RKE2 is greyed out                                          | One of the servers is 32-bit ARM (armhf). Use [k3s](./kubernetes-k3s.md) there.                                                                                         |
| A server can't be picked: **Already in a group**            | Remove it from its group first, or pick another server.                                                                                                                 |
| Creating fails: the server already runs Docker, k3s or RKE2 | Use a fresh server, or uninstall that software first. If you removed it by hand, press **Refresh inventory** on the server's **Modules** tab so dPanel sees it is gone. |
| The status reads **Failed**                                 | Open the last execution from the **Cluster** tab to read the error, fix it, then press **Install again**.                                                               |
| `kubectl: command not found`                                | Run the `sudo -i` and two `export` lines from step 6 in that terminal first.                                                                                            |
| The domain doesn't answer                                   | Check `curl http://127.0.0.1:30080` on kube-rke-1 first, then the load balancer's status and **Logs**.                                                                  |
