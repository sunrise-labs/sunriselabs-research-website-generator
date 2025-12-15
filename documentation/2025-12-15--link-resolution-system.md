---
id: sunrise-labs-research-website-generator-m03
type: milestone
title: Link Resolution System
date: 2025-12-15
status: completed
lab: Sunrise Labs
authors:
  - Ian Tairea (https://github.com/tairea)
tags:
  - linking
  - navigation

links:
  project: sunrise-labs-research-website-generator-project
  experiment: null
  parent: sunrise-labs-research-website-generator-m02
  enables:
    - sunrise-labs-research-website-generator-m04
  related: []
---

## Milestone Summary
Convert page IDs to URLs and generate breadcrumb navigation for contextual page relationships.

---

## Purpose
Enable internal linking between pages in the generated website, allowing readers to navigate the research knowledge graph intuitively.

---

## Scope
**Included**
- ID-to-URL mapping for all page references
- Breadcrumb generation showing page hierarchy
- Navigation structure construction
- Link validation and broken link detection

**Excluded**
- HTML rendering
- Template processing
- Visual styling

---

## Work Completed
- Implemented linker.js with robust ID resolution
- Built breadcrumb generation based on project/parent relationships
- Created URL generation following consistent patterns
- Added validation for missing or broken internal references

---

## Outcome
All internal page references resolve to correct URLs with proper context through breadcrumbs, enabling seamless navigation across all Sunrise Labs research.

---

## Validation
Links correctly navigate between pages, breadcrumbs show proper hierarchy (e.g., Project → Milestone → Experiment), and broken links are detected during build.

---

## Implications
This navigation layer transforms isolated markdown files into an interconnected knowledge base where relationships are explorable.

---

## Enables
- sunrise-labs-research-website-generator-m04 (HTML Rendering)
