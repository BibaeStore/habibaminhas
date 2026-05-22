# 📝 Change Log

**Purpose:** Track all changes to the Habiba Minhas website  
**Format:** Newest entries first  
**Owner:** Development Team

---

## How to Use This Changelog

**When making ANY change to the codebase:**
1. Add a new entry under the current date
2. Use the format: `[Category] Description - Impact`
3. Link to relevant documentation files

**Categories:**
- `[Feature]` - New functionality
- `[Fix]` - Bug fixes
- `[Security]` - Security improvements
- `[Performance]` - Performance optimizations
- `[Design]` - UI/UX changes
- `[Content]` - Content updates (blog, products)
- `[Docs]` - Documentation changes
- `[Refactor]` - Code refactoring (no user-facing changes)
- `[Chore]` - Maintenance tasks (dependency updates, etc.)

---

## 2026-05-22 — Security Headers & Agent-Ready Features

### Added
- **[Security] Content Signals in robots.txt** - Implemented `Content-Signal: ai-train=no, search=yes, ai-input=yes` to control AI agent usage of our content. Protects unique fashion content from AI training while allowing search and recommendations.
  - **File:** `app/robots.txt/route.ts` (new)
  - **Removed:** `app/robots.ts` (replaced by route handler)
  - **Impact:** Zero breaking changes, better AI discovery control
  - **Ref:** `docs/standards/security.md` lines 108-127

- **[Security] Link Response Headers (RFC 8288)** - Added Link headers pointing AI agents to sitemap, blog, product collections, and about page.
  - **File:** `next.config.ts` lines 66-75
  - **Impact:** Improved AI agent discovery, zero performance impact
  - **Ref:** `docs/standards/security.md` lines 78-95

- **[Feature] Markdown for Agents Detection** - Added middleware detection for `Accept: text/markdown` requests from AI agents. Detection-only for now (conversion deferred for performance).
  - **File:** `middleware.ts` lines 53-61
  - **Impact:** Zero performance impact, future-ready for per-route markdown conversion
  - **Ref:** `docs/standards/security.md` lines 129-146

### Documentation
- **[Docs] Created cloud.md** - Main documentation index directing to specific files based on need
  - **File:** `docs/cloud.md`
  - **Purpose:** Central brain of documentation system

- **[Docs] Created design.md** - Comprehensive design system documentation (colors, typography, components, accessibility)
  - **File:** `docs/standards/design.md`
  - **Covers:** Public storefront + admin dashboard design tokens

- **[Docs] Created development.md** - Development standards (tech stack, project structure, coding patterns, authentication)
  - **File:** `docs/standards/development.md`
  - **Warning:** Documents Next.js 16 breaking changes

- **[Docs] Created security.md** - Security headers, authentication, Agent-Ready features, audit results
  - **File:** `docs/standards/security.md`
  - **Covers:** HTTP security headers, CSP, auth flows, what's implemented vs. skipped

- **[Docs] Created CHANGELOG.md** - This file
  - **File:** `docs/changelogs/CHANGELOG.md`
  - **Purpose:** Track all changes with context

- **[Docs] Created content-strategy.md** - Content pillars, topical map summary, keyword strategy
  - **File:** `docs/content/content-strategy.md`
  - **Covers:** 6 content pillars, 100-post topical map, internal linking

### Audit Results
- **Security Headers:** All 3 recommended headers ALREADY implemented (X-Frame-Options, X-Content-Type-Options, Referrer-Policy)
- **Agent-Ready:** Implemented 3 of 9 features (Content Signals, Link headers, Markdown detection)
- **Skipped:** 6 features not applicable for e-commerce (API catalog, OAuth discovery, MCP, Agent Skills, WebMCP)
- **Performance:** Zero impact - all changes are detection/headers only

### Impact Assessment
- **Breaking Changes:** None
- **Performance:** No degradation
- **Security:** Improved (Agent-Ready features add discovery layer)
- **SEO:** Improved (better AI agent understanding)

---

## 2026-05-21 — Recent Performance Optimizations (from git log)

### Performance
- **[Performance] Revert to safe state: hero images only** - Back to 87 Lighthouse score
  - **Commit:** `e7d56e2`
  - **Impact:** Stable performance baseline

- **[Performance] Add browserslist to package.json** - Reduce polyfill size
  - **Commit:** `2d36a8f`
  - **Impact:** Smaller bundle for modern browsers

- **[Performance] Remove swcMinify option** - Not valid in Next.js 16
  - **Commit:** `73c7864`
  - **Impact:** Fixed config error

- **[Performance] Target modern browsers** - Removed 14KB legacy polyfills
  - **Commit:** `9df2b45`
  - **Impact:** 14KB bundle reduction

- **[Performance] Optimize hero images** - Reduced by 150KB (13.6%)
  - **Commit:** `e1b4d4e`
  - **Impact:** Faster page load

---

## Historical Entries (Pre-2026-05-21)

*To be backfilled from git history and team knowledge*

---

## Changelog Format Example

```markdown
## YYYY-MM-DD — Brief Summary

### Category
- **[Category] Change Title** - Description of what changed and why.
  - **File:** Path to changed file(s)
  - **Impact:** User-facing impact, performance notes
  - **Ref:** Link to relevant documentation
```

---

**Last Updated:** 2026-05-22  
**Maintained By:** Development Team  
**Update Frequency:** After every code change  
**Questions?** See [cloud.md](../cloud.md)
