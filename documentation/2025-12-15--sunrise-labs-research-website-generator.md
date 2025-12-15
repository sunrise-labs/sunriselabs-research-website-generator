---
id: sunrise-labs-research-website-generator-project
type: project
title: Sunrise Labs Research Website Generator
date: 2025-12-15
status: completed
lab: Sunrise Labs
authors:
  - Ian Tairea (https://github.com/tairea)
tags:
  - internal documentation system
  - open documentation system

links:
  project: null
  experiment: null
  parent: null
  enables: []
  related: []
---

## Objective
Parse all Sunrise Labs' documentation across all Github organization repositories and render it into a live website at SunriseLabs.io. This is 1 of 3 pieces of Sunrise Labs' Research Framework alongside the SunriseLabs Research Spec and SunriseLabs Research (Claude) Skill.

---

## Motivation
Create a new website and internal documentation process that moves off Notion and out into the open, using .md files as the primitive for activity, leveraging git for commit, contributor, version tracking, and Claude Code as the interface and orchestrator.

---

## Research Scope
**In scope**
- All page types defined in Sunrise Labs Research Spec v1.0 (project, milestone, experiment, daily-note, insight, decision, synthesis)
- YAML frontmatter parsing and validation against the spec
- ID-based linking system that resolves page IDs to URLs
- Automatic rebuilds via GitHub Actions when documentation changes
- Static site generation with Handlebars templates
- Aggregation and statistics across all organization repositories
- Dark/light theme support and responsive design
- SEO-friendly sitemap generation

**Out of scope**
- N/A

---

## Key Questions
1. How can we better capture project activity into documentation to share with the world?

---

## Constraints
- Leverage GitHub for free building and hosting (GitHub Actions + GitHub Pages)

---

## Current Status
Initial implementation complete with core parser, aggregator, linker, and renderer. System is operational and ready for deployment.

---

## Linked Work
- Milestones:
  - sunrise-labs-research-website-generator-m01 (Markdown + YAML Parsing)
  - sunrise-labs-research-website-generator-m02 (Page Aggregation & Relationships)
  - sunrise-labs-research-website-generator-m03 (Link Resolution System)
  - sunrise-labs-research-website-generator-m04 (HTML Rendering)
  - sunrise-labs-research-website-generator-m05 (GitHub Integration)
  - sunrise-labs-research-website-generator-m06 (CI/CD Deployment)
- Experiments:
- Insights:
- Decisions:
- Synthesis:
