# Earthbound Changelog Hub (Deno Edition)

A lightweight, high-performance centralized changelog repository built with Deno and Hono.

## Features
- 🦕 **Deno Native**: No `node_modules`, no complex build steps.
- 🚀 **Hono Power**: Ultra-fast routing and rendering.
- 🎨 **Premium Design**: Sleek dark mode with glassmorphism and modern typography.
- 📝 **Markdown Driven**: Automatically renders changelogs from the `content/` directory.

## Getting Started

### Prerequisites
- [Deno](https://deno.land/) installed.

### Run Locally
```bash
deno task dev
```
The app will be available at `http://localhost:8000`.

### Generate Static Site
To export the site as static HTML:
```bash
deno task build
```
The output will be in the `dist/` directory, which can be hosted on any static web server (GitHub Pages, Netlify, etc.).

## Content Structure
Add your project changelogs to the `content/repos/` directory:
```
content/repos/
  your-repo-name/
    CHANGELOG.md
```

Each `CHANGELOG.md` should have frontmatter:
```markdown
---
title: Your Project Name
description: A short description of the project.
repository: https://github.com/user/repo
---
```

## Automation
To sync changelogs from other repositories, you can use the GitHub Action workflow described in the [walkthrough](C:\Users\jmsut\.gemini\antigravity\brain\c66616b4-b702-4c37-9f33-2b4500bfe47f\walkthrough.md). Just update the port/URL if necessary.
