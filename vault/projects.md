---
title: Projects
description: A few things I've built on the side.
publish: true
permalink: projects.md
template: projects
---

# Projects

A few things I've built on the side — mostly scratching my own itches around AI agents, job hunting, and home automation.

## [STARlog](https://github.com/stefanhoth/starlog)

Interview prep tool for the STAR method (Situation, Task, Action, Result). Speak or paste a rough description of something that happened, and Gemini turns it into a polished, interview-ready story — then maps it against the competencies a specific job posting is likely to probe for, so you can see your gaps before the interview does. Everything runs in the browser; nothing leaves your machine except the API calls made with your own key.

## [crusty-proxy](https://github.com/stefanhoth/crusty-proxy)

A small MCP security proxy that sits between my self-hosted AI agent (OpenClaw) and the external APIs it can call. It holds all the credentials and enforces an allowlist, so the agent itself never sees an API key — closer to "responsible disclosure" than to "AI security": the agent runs on a need-to-know basis.

## [paperless-ngx-cli](https://github.com/stefanhoth/paperless-ngx-cli)

A terminal client for Paperless-NGX, my self-hosted document archive. Search, inspect metadata, and trigger bulk operations without opening a browser — built as a single static binary so it drops straight into shell scripts, cron jobs, and AI agent workflows.