---
title: Projects
description: A few things I've built on the side.
publish: true
permalink: projects.md
template: projects
---

# Projects

A few things I've built on the side — mostly scratching my own itches around AI agents, job hunting, and home automation.

## [🔦 STARlog](https://github.com/stefanhoth/starlog)

*TypeScript · Gemini · runs entirely in the browser*

**Turn rough memories into interview-ready STAR stories — and see your gaps before the interview does.**

Speak or paste a rough description of something that happened, and Gemini turns it into a polished story following the STAR method (Situation, Task, Action, Result) — then maps it against the competencies a specific job posting is likely to probe for. Everything runs in the browser; nothing leaves your machine except the API calls made with your own key.

### The story

Job hunting meant retelling the same experiences over and over — and losing the good details every time. I wanted a tool that takes a two-minute voice ramble and produces a structured story I can actually rehearse, without shipping my career history to someone else's backend.

### Lessons learned

Getting structured output from the model is the easy part. The hard part is making it push back when a story has no measurable result — an honest "this story is weak" is worth more than a polished paragraph.

- [GitHub](https://github.com/stefanhoth/starlog)

## [🦀 crusty-proxy](https://github.com/stefanhoth/crusty-proxy)

*Rust · MCP · security*

**My AI agent never sees an API key — need-to-know, enforced by a proxy.**

A small MCP security proxy that sits between my self-hosted AI agent (OpenClaw) and the external APIs it can call. It holds all the credentials and enforces an allowlist — closer to "responsible disclosure" than to "AI security": the agent runs on a need-to-know basis.

### The story

Self-hosting an agent means handing it credentials for every API it may ever call — which is one prompt injection away from leaked keys. crusty-proxy moves the trust boundary: the agent talks to the proxy, the proxy holds the secrets and refuses anything that isn't on the allowlist.

- [GitHub](https://github.com/stefanhoth/crusty-proxy)

## [paperless-ngx-cli](https://github.com/stefanhoth/paperless-ngx-cli)

*Go · CLI · self-hosted*

**My document archive, one command away — scriptable from shell, cron, and agents.**

A terminal client for Paperless-NGX, my self-hosted document archive. Search, inspect metadata, and trigger bulk operations without opening a browser — built as a single static binary so it drops straight into shell scripts, cron jobs, and AI agent workflows.

### Lessons learned

A single static binary beats a "proper" package: the zero-dependency install is the feature people actually notice.

- [GitHub](https://github.com/stefanhoth/paperless-ngx-cli)