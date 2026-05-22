# 🧠 Cloud.md — Main Documentation Index

**Last Updated:** 2026-05-22  
**Purpose:** Master index for all Habiba Minhas documentation  
**Owner:** Development Team

---

## 📋 Quick Reference

**Cloud.md** is the central brain of the documentation system. When you need specific information, this index directs you to the right file based on your need.

---

## 🗂️ Documentation Map

### **For Design Questions**
→ Read **[design.md](./standards/design.md)**
- Design system (colors, typography, spacing)
- Component patterns
- UI/UX standards
- Admin vs. public site theming
- Accessibility guidelines

### **For Development Questions**
→ Read **[development.md](./standards/development.md)**
- Tech stack (Next.js 16, Supabase, Tailwind CSS v4)
- Project structure
- Coding patterns & conventions
- API routes & server actions
- State management (Zustand)

### **For SEO & Marketing Questions**
→ Read **[SEO.md](./standards/SEO.md)**
- On-page SEO standards
- Meta tags, canonical URLs, H1 tags
- Security headers
- Agent-Ready features
- Performance optimization

### **For Security Questions**
→ Read **[security.md](./standards/security.md)**
- Security headers (X-Frame-Options, CSP, etc.)
- Authentication (admin JWT, customer Supabase auth)
- Content Security Policy
- Agent-Ready security features
- Compliance & best practices

### **For Content Strategy Questions**
→ Read **[content-strategy.md](./content/content-strategy.md)**
- Content pillars (6 main topics)
- Blog topical map (100 posts)
- Keyword strategy
- Internal linking structure
- Target audience

### **For Change History**
→ Read **[CHANGELOG.md](./changelogs/CHANGELOG.md)**
- What changed and when
- Who made the change
- Why it was changed
- Impact assessment

---

## 🎯 How to Use This System

### **Scenario 1: "What colors should I use for this new component?"**
1. Start here (cloud.md)
2. See it's a design question
3. Go to design.md → Design Tokens section
4. Find color palette

### **Scenario 2: "Why is this security header set this way?"**
1. Start here (cloud.md)
2. See it's a security question
3. Go to security.md → Headers section
4. Find explanation and rationale

### **Scenario 3: "What blog topics should we write next?"**
1. Start here (cloud.md)
2. See it's a content question
3. Go to content-strategy.md → Priority Queue
4. Find next topics to write

### **Scenario 4: "When did we add Content Signals to robots.txt?"**
1. Start here (cloud.md)
2. See it's a change history question
3. Go to CHANGELOG.md
4. Search for "Content Signals"

---

## 📐 Documentation Standards

All documentation files follow this structure:

```markdown
# [Topic Name]

**Last Updated:** YYYY-MM-DD
**Owner:** Team/Person
**Status:** Active | Draft | Deprecated

## 📋 Quick Reference
[1-2 sentence summary]

## 📖 Overview
[Detailed explanation]

## 🎯 Standards / Guidelines
[Specific rules]

## 📚 References
[Links to related docs]
```

---

## 📂 File Structure

```
docs/
├── cloud.md                         ← YOU ARE HERE (main index)
├── standards/
│   ├── SEO.md                      ← Already exists, updated
│   ├── design.md                   ← Design system & UI standards
│   ├── development.md              ← Dev practices & tech stack
│   └── security.md                 ← Security headers & policies
├── changelogs/
│   └── CHANGELOG.md                ← All changes with dates
├── content/
│   └── content-strategy.md         ← Content pillars & blog plan
└── topical-map.md                  ← Already exists, detailed 100-post plan
```

---

## 🔄 When to Update Documentation

### **Update design.md when:**
- Adding new colors, fonts, or design tokens
- Creating new UI components
- Changing design patterns
- Updating accessibility standards

### **Update development.md when:**
- Upgrading dependencies (Next.js, React, etc.)
- Adding new libraries
- Changing folder structure
- Creating new coding patterns

### **Update SEO.md when:**
- Changing meta tag strategy
- Adding new SEO features
- Updating robots.txt rules
- Implementing new structured data

### **Update security.md when:**
- Adding/changing security headers
- Updating CSP rules
- Changing authentication flow
- Adding new security features

### **Update content-strategy.md when:**
- Adding new content pillars
- Changing keyword strategy
- Updating blog priorities
- Revising target audience

### **Update CHANGELOG.md when:**
- Making ANY change to the codebase
- Deploying new features
- Fixing bugs
- Updating documentation

---

## 🚨 Important Notes

1. **Always update CHANGELOG.md** when you make changes
2. **Always update "Last Updated" date** in the file you modify
3. **Link between docs** using relative paths (e.g., `[design.md](./standards/design.md)`)
4. **Keep it concise** - documentation should be scannable, not novels

---

## 📞 Documentation Owner

**Primary:** Development Team  
**Last Major Update:** 2026-05-22 (Security headers & Agent-Ready features)  
**Review Frequency:** Monthly

---

**Need help?** Start with the relevant section above, or check CHANGELOG.md for recent updates.
