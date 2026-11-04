---
title: Kubernetes clusters
description: Create a Kubernetes cluster with k3s or RKE2 on your dPanel servers, run your first app on it, and put it on your own domain with HTTPS.
sidebar_position: 3
sidebar_icon: rocket
sidebar_label: Kubernetes clusters
---

This guide takes you from two plain servers to a Kubernetes cluster that serves a web app at `https://your-domain` in about 30 minutes. It was written while building two real clusters: **kube-k3s** with k3s and **kube-rke** with RKE2, each with one server and one agent.

New to the words? Read [Server groups and clusters](./overview.md) first.

## Before you start

You need servers that dPanel already manages and that are **Ready**:

|             | k3s                                               | RKE2                          |
| ----------- | ------------------------------------------------- | ----------------------------- |
| Servers     | 1 or more (1, 3, 5 or 7 with the **Server** role) | same                          |
| Each server | 2 GB memory or more                               | 2 CPU and 4 GB memory or more |
| System      | Ubuntu 22.04 or 24.04                             | same                          |
| CPU         | amd64, arm64 or armhf                             | amd64 or arm64                |

All servers must be in the **same region**, not in any group, without Docker, k3s or RKE2 installed, and with the dPanel firewall off. A fresh server launched from dPanel meets all of this. See [Create a cloud server](../servers/cloud-providers/create-a-cloud-server.md).

## 1. Choose Kubernetes

1. Open **Servers**, then **Server groups**, and press **New group**.
2. Under **What should this group be?**, choose **Kubernetes** and press **Next**.

![New group, step Type: Generic and Kubernetes cards, with PostgreSQL, MariaDB, Redis and Kafka marked Coming soon](../../assets/clusters/wizard-type.webp 'Kubernetes is available today; other cluster types are coming.')

## 2. Pick servers, roles and the engine

1. **Name**: the group and cluster name, for example `kube-k3s`. Add a **Description** if you like.
2. Under **Servers**, tick the servers. Each picked server appears at the top with a role switch:
   - **Server** runs the control plane. The first server you pick gets it.
   - **Agent** runs only your apps. The others get it.
     Change a role by pressing the other button.
3. Under **Engine**, pick **k3s** or **RKE2**. An engine that can't run on one of your servers is greyed out with the reason.
4. **Version**: keep the newest unless you need an older one.
5. **Built-in ingress**: leave it **off**. dPanel's load balancer will bring traffic in (step 6), and the engine's own ingress would take ports 80 and 443 away from it.

![Two picked servers: kube-k3s-1 with the Server role and kube-k3s-2 with the Agent role, above the server picker](../../assets/clusters/wizard-servers.webp 'Each picked server gets a role: Server for the control plane, Agent for apps.')

![The Engine choice with k3s selected, version v1.37.1+k3s1 and Built-in ingress off](../../assets/clusters/wizard-engine.webp 'Pick the engine and version. Keep Built-in ingress off.')

Press **Next**.

## 3. Review and install

The **Review** shows the group, the engine, the version and **What will be installed where**: each server with its engine, version and role. Press **Create and install**.

![The Review step: group kube-k3s, type Kubernetes, engine k3s, version v1.37.1+k3s1, and k3s installed as Server on kube-k3s-1 and as Agent on kube-k3s-2](../../assets/clusters/wizard-review.webp 'Check what will be installed where, then press Create and install.')

dPanel creates the group and starts one install job over all the servers: servers first, then agents. The wizard follows it while it runs.

![The Installing step: Installing kube-k3s, status Installing, last execution cluster_install Queued, and a warning that one server is a single point of failure](../../assets/clusters/wizard-installing.webp 'The install is queued. With one server, dPanel warns that the control plane has no backup.')

:::info[The single point of failure warning]
With one **Server**, the cluster stops accepting changes if that server goes down (apps already running keep running). That is fine for learning and small projects. Pick three servers with the **Server** role when you need the cluster to survive losing one.
:::

You can close the wizard; the install keeps going. It takes about 10 minutes for k3s and 12 for RKE2.

## 4. Check the cluster

Open the group. The **Cluster** tab shows the **Status**, the engine and version, the **API endpoint**, the last execution, and every node with its role and status. When the install is done, the status and every node read **Ready**.

![The kube-k3s group page on the Cluster tab: Kubernetes, k3s v1.37.1+k3s1, status Ready, API endpoint on port 6443, cluster_install Succeeded, and two nodes, Server and Agent, both ready](../../assets/clusters/cluster-detail.webp 'A ready cluster: both nodes joined and the install succeeded.')

To look inside, open the node with the **Server** role, go to its **Terminal**, and run:

```bash
# k3s
sudo k3s kubectl get nodes

# RKE2
sudo /var/lib/rancher/rke2/bin/kubectl --kubeconfig /etc/rancher/rke2/rke2.yaml get nodes
```

Every node should be `Ready`:

```text
NAME                               STATUS   ROLES           AGE   VERSION
kube-k3s-1.c.dnocs-demo.internal   Ready    control-plane   7m    v1.37.1+k3s1
kube-k3s-2.c.dnocs-demo.internal   Ready    <none>          4m    v1.37.1+k3s1
```

## 5. Run your first app

Still in the server node's terminal, save this as `hello.yaml`. It runs two copies of a tiny web page and opens it on port `30080` of every node (a **NodePort**):

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

Apply it and check it (on RKE2 use the longer `kubectl` command from step 4):

```bash
sudo k3s kubectl apply -f hello.yaml
sudo k3s kubectl get pods -o wide
curl http://127.0.0.1:30080
```

Kubernetes puts one copy on each node, and `curl` answers `Hello from kube-k3s, a k3s cluster on dPanel`.

## 6. Put it on your domain with HTTPS

A dPanel [load balancer](../networking/load-balancers.md) on the **Server** node brings web traffic into the cluster:

1. Open **Load Balancers** and press **Create a load balancer**.
2. **Gateway server**: the cluster's **Server** node. **Web server engine**: **Caddy Server**.
3. **Domain Name**: **Managed**, a **Subdomain** such as `kube-k3s`, and your domain. Keep **HTTPS** on.
4. **Routing mode**: **L7**. **Routes**: **Type** **Proxy Pass**, **Matching Path** `/*`, address `127.0.0.1` and port `30080`.
5. Press **Create load balancer**.

On a fresh server, the first load balancer also installs Caddy, which takes about 10 minutes; later ones take about a minute. When it reads **Ready**, open `https://kube-k3s.your-domain`: the page comes from one of the copies in the cluster, with a valid HTTPS certificate.

:::tip[Why 127.0.0.1 works]
A NodePort is open on **every** node and Kubernetes forwards it to a running copy, even one on another node. So the gateway can send traffic to itself on port 30080 and still reach both copies.
:::

## Uninstall or delete a cluster

On the group's **Cluster** tab:

- **Uninstall** removes the engine from every node. Apps in the cluster stop and their data on the nodes is removed. The servers and the group stay, and the cluster reads **Uninstalled**.
- **Install again** shows on a cluster whose install failed or that was uninstalled. It installs again on the same servers with the same roles, engine and version.
- **Delete cluster** works only on a cluster that is uninstalled, failed or never installed. The group stays as a generic group, so you can delete it or reuse its servers.

Delete the load balancer first if you made one for the cluster.

## Not available yet

- Adding or removing nodes after the install, and upgrading the Kubernetes version.
- Downloading a kubeconfig to use `kubectl` from your own computer. Use the server node's **Terminal** for now.
- Opening the cluster ports in the dPanel firewall automatically; that is why nodes need the firewall off.

## Troubleshooting

| What you see                                                                     | Fix                                                                                                         |
| -------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| A server can't be picked: **Already in a group**                                 | Remove it from its group first, or pick another server.                                                     |
| An engine is greyed out                                                          | It can't run on one of the picked servers' CPU type, for example RKE2 on a 32-bit Raspberry Pi. Use k3s.    |
| Creating fails because a server runs Docker, k3s or RKE2, or has the firewall on | Use a fresh server, or uninstall those and turn the firewall off.                                           |
| The status reads **Failed**                                                      | Open the last execution from the **Cluster** tab to read the error, fix it, then press **Install again**.   |
| The domain doesn't answer                                                        | Check `curl http://127.0.0.1:30080` on the server node first, then the load balancer's status and **Logs**. |
