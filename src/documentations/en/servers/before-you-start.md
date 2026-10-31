---
title: 'Before you start'
description: 'The two things dPanel needs once, then reuses for every server.'
sidebar_position: 2
---

## An SSH key

An SSH key is a pair of files that replaces a password when a computer signs in to a server. One half is public and is written onto the server; the other half is private and never leaves dPanel.

You do not have to create one by hand. Open Backend, then SSH keys, then Create SSH key, and give it a name you will recognise.

- Key type: pick "For current servers" unless something refuses it. It is shorter and faster, and every current Linux accepts it. "For older servers" is the fallback, and it also asks for a size.
- The private half is never shown again. dPanel keeps it encrypted and uses it for you. The page shows the public half, which is safe to copy anywhere, and a fingerprint you can compare with what a server reports.

## A cloud project

A cloud project is dPanel's link to your account at a cloud provider. It holds the credentials that let dPanel create machines on your behalf. Open Backend, then Cloud projects, then Add project, and paste the credentials your provider gives you.

:::info[Who pays for the machine]
The machine is created inside your own cloud account, so your provider bills you directly. dPanel does not resell the machine.
:::

![The launch form showing a cloud project and an SSH key ready to pick](../../assets/servers/create-step1-provider.png 'With both in place, the launch form offers them instead of asking you to connect one.')
