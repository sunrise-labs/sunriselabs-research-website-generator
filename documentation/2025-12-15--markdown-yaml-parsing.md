---
id: sunrise-labs-research-website-generator-m01
type: milestone
title: Markdown + YAML Parsing
date: 2025-12-15
status: completed
lab: Sunrise Labs
authors:
  - Ian Tairea (https://github.com/tairea)
tags:
  - parsing
  - validation

links:
  project: sunrise-labs-research-website-generator-project
  experiment: null
  parent: null
  enables:
    - sunrise-labs-research-website-generator-m02
    - sunrise-labs-research-website-generator-m05
  related: []
---

## Milestone Summary
Establish capability to parse markdown files and validate YAML frontmatter against Sunrise Labs Research Spec v1.0.

---

## Purpose
Foundation for understanding and validating research documentation structure across all repositories.

---

## Scope
**Included**
- YAML frontmatter schema validation
- Markdown content parsing
- Page type recognition (all 7 types: project, milestone, experiment, daily-note, insight, decision, synthesis)
- Status value validation
- Date format validation
- Link structure validation

**Excluded**
- HTML generation
- Link resolution
- Template processing

---

## Work Completed
- Implemented parser.js with comprehensive YAML schema validation
- Created validation rules for all required fields per page type
- Built error reporting for malformed frontmatter
- Integrated markdown parsing with frontmatter extraction

---

## Outcome
System can reliably parse and validate all 7 page types defined in Sunrise Labs Research Spec v1.0, providing clear error messages for validation failures.

---

## Validation
All test markdown files parse correctly with proper validation and error reporting for invalid schemas.

---

## Implications
This foundational capability enables both page aggregation and GitHub integration to work with validated, well-structured documentation.

---

## Enables
- sunrise-labs-research-website-generator-m02 (Page Aggregation & Relationships)
- sunrise-labs-research-website-generator-m05 (GitHub Integration)
