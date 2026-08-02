# Docs introduction: provider comparison and IaC portability

**Date:** 2026-08-02

## Goal

Add the two missing product reasons to try dPanel without returning `/docs/intro`
to a long reference page:

1. Visitors can run an application with the providers available in dPanel and
   compare the result against their requirements.
2. Visitors retain practical control of their infrastructure work because
   changes are tracked as OpenTofu and Ansible IaC that they can keep using in
   another platform later.

## Content and layout

Insert one section between the existing three-step outcome strip and the final
trial invitation. The section contains two equal cards in a two-column grid on
desktop and one column below `md`.

### Provider comparison card

- Eyebrow: `Compare your options`
- Heading: `Try providers. Compare the fit.`
- Body: `Run your application with the provider you want to evaluate, then use
the result to choose what fits your requirements.`
- Provider labels: `IDCloudHost`, `AWS`, `GCP`, `Vultr`, and `Manual SSH
Access`.

The labels make the current available provider options concrete without
promising that every provider, pricing model, or region is interchangeable.

### IaC portability card

- Eyebrow: `Your infrastructure, documented`
- Heading: `Keep your IaC in your hands.`
- Body: `Every change is tracked with OpenTofu and Ansible, so you can keep
using the same IaC in your own platform later.`

This describes continuity of the generated/tracked IaC and does not promise
automatic migration, legal ownership terms, or provider-independent execution.

## Visual direction

Use the current compact dark design system and existing `Badge` and card
primitives. The provider card has a restrained cloud-blue icon accent and
provider label pills; the IaC card uses a muted branch/code icon accent. Keep
the cards at the current `rounded-xl border bg-card p-5` density. The provider
labels wrap naturally and remain readable at narrow widths.

## Accessibility and verification

- Use semantic headings and a descriptive list for provider labels.
- Keep the existing keyboard-accessible actions unchanged.
- Extend the docs-intro component test with both card headings, all five
  provider labels, and the OpenTofu/Ansible continuity statement.
- Re-run the focused component test, route lint, Prettier, and production
  build; visually inspect the local page at desktop width.
