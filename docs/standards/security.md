# 🔒 Security Standards

**Last Updated:** 2026-05-22  
**Owner:** Development Team  
**Status:** Active

---

## 📋 Quick Reference

Habiba Minhas implements **comprehensive security headers**, **authentication**, and **Agent-Ready discovery features** to protect the site and its users.

---

## 🛡️ Security Headers (HTTP)

All security headers are configured in `next.config.ts` (lines 31-67).

### **X-Frame-Options: SAMEORIGIN**

**What it does:** Prevents clickjacking attacks by disallowing the site from being embedded in iframes by other domains.

**Value:** `SAMEORIGIN`

**Why:** Allows embedding on same origin (e.g., admin embedding product previews) but blocks malicious third-party iframes.

**Impact:** Protects against clickjacking attacks where attackers trick users into clicking hidden elements.

---

### **X-Content-Type-Options: nosniff**

**What it does:** Prevents browsers from MIME-sniffing and forces them to respect the declared `Content-Type` header.

**Value:** `nosniff`

**Why:** Stops browsers from interpreting files as different types (e.g., treating a text file as JavaScript).

**Impact:** Prevents MIME-based attacks where malicious files are disguised as safe types.

---

### **Referrer-Policy: strict-origin-when-cross-origin**

**What it does:** Controls what referrer information is sent to other sites when users click external links.

**Value:** `strict-origin-when-cross-origin`

**Why:** 
- Same-origin requests: Full referrer URL sent
- Cross-origin HTTPS→HTTPS: Only origin sent (not full URL)
- HTTPS→HTTP: No referrer sent

**Impact:** Balances privacy (doesn't leak full URLs to third parties) with analytics (retains origin for tracking).

---

### **Content-Security-Policy (CSP)**

**What it does:** Comprehensive policy controlling what resources can load and execute on the site.

**Value:**
```
default-src 'self';
script-src 'self' 'unsafe-eval' 'unsafe-inline' widget.trustpilot.com *.supabase.co;
style-src 'self' 'unsafe-inline';
img-src 'self' data: https: blob:;
font-src 'self' data:;
connect-src 'self' *.supabase.co wss://*.supabase.co;
frame-src 'self' widget.trustpilot.com;
object-src 'none';
base-uri 'self';
form-action 'self';
frame-ancestors 'self';
upgrade-insecure-requests;
```

**Breakdown:**

| Directive | Value | Why |
|-----------|-------|-----|
| `default-src 'self'` | Only load resources from same origin | Baseline security |
| `script-src` | Self + Trustpilot + Supabase | Allow third-party scripts we trust |
| `'unsafe-inline'` | Inline scripts/styles allowed | Next.js requires this |
| `'unsafe-eval'` | eval() allowed | Supabase SDK requires this |
| `img-src https: blob:` | All HTTPS images + data URIs | Product images from CDN |
| `connect-src *.supabase.co wss://` | Supabase API + WebSocket | Database connections |
| `frame-src widget.trustpilot.com` | Trustpilot widget embed | Reviews widget |
| `object-src 'none'` | No Flash/plugins | Security best practice |
| `upgrade-insecure-requests` | Upgrade HTTP to HTTPS | Force HTTPS |

**Impact:** Prevents XSS, injection attacks, and unauthorized resource loading.

**⚠️ Note:** `'unsafe-inline'` and `'unsafe-eval'` reduce CSP effectiveness but are required for Next.js and Supabase. Future: Migrate to nonces for inline scripts.

---

### **Link Headers (Agent Discovery)**

**What it does:** HTTP headers that point AI agents to useful resources (RFC 8288).

**Value:**
```
Link: </sitemap.xml>; rel="sitemap"; type="application/xml",
      </journal/>; rel="collection"; title="Fashion & Lifestyle Blog",
      </ladies/>; rel="collection"; title="Ladies Collection",
      </kids/>; rel="collection"; title="Kids Festive Wear",
      </baby/>; rel="collection"; title="Baby & Nursery",
      </about/>; rel="about"; title="About Habiba Minhas"
```

**Why:** Helps AI agents (ChatGPT, Claude, Perplexity) discover key pages and content collections.

**Impact:** Improves AI search results and product recommendations.

**Location:** `next.config.ts` lines 66-75

---

## 🤖 Agent-Ready Features

### **Content Signals (robots.txt)**

**What it does:** Declares how AI agents can use your content.

**Value:**
```
Content-Signal: ai-train=no, search=yes, ai-input=yes
```

**Breakdown:**
- `ai-train=no` - Do NOT use our content to train AI models (protects unique fashion content)
- `search=yes` - AI CAN use content to answer search queries (appear in AI search results)
- `ai-input=yes` - AI CAN read and summarize content for users (product recommendations)

**Why:** Protects intellectual property while allowing beneficial AI usage.

**Location:** `app/robots.txt/route.ts`

**Reference:** https://contentsignals.org/

---

### **Markdown for Agents (Detection)**

**What it does:** Detects when AI agents request markdown instead of HTML.

**Status:** Detection only (conversion deferred for performance)

**How it works:**
1. Middleware detects `Accept: text/markdown` header
2. Sets `x-markdown-requested: true` flag
3. Future: Per-route conversion can be enabled without performance impact

**Why:** AI agents prefer markdown for easier parsing, but HTML→markdown conversion is expensive. Current approach allows future opt-in per route.

**Location:** `middleware.ts` lines 53-61

**Reference:** https://developers.cloudflare.com/fundamentals/reference/markdown-for-agents/

---

## 🔐 Authentication & Authorization

### **Admin Authentication**

**Method:** JWT tokens (jose library)

**Flow:**
1. Admin logs in at `/admin/login`
2. Server validates credentials
3. JWT signed with `ADMIN_JWT_SECRET` (env var)
4. Cookie `admin_token` set (httpOnly, secure)
5. Middleware validates JWT for all `/admin/*` routes

**Security Features:**
- JWT secret stored in environment variable (never committed)
- httpOnly cookie (prevents XSS theft)
- Middleware enforcement (can't bypass by URL manipulation)
- Token expiry (configurable)

**Location:** `middleware.ts` lines 4-25, 68-85

---

### **Customer Authentication**

**Method:** Supabase Auth (email/password)

**Flow:**
1. Customer signs up/logs in
2. Supabase handles auth
3. Session cookie `sb-*-auth-token` set
4. Server-side validation in page components
5. Middleware checks cookie presence for `/account/*`

**Security Features:**
- Supabase handles password hashing (bcrypt)
- Session tokens rotated automatically
- httpOnly cookies
- HTTPS-only in production

**Location:** `middleware.ts` lines 29-36, 88-104

---

## 🚨 Security Vulnerabilities We Prevent

### **Cross-Site Scripting (XSS)**
- **How:** Content-Security-Policy blocks inline scripts from untrusted sources
- **Additional:** React escapes user input by default

### **Clickjacking**
- **How:** X-Frame-Options prevents iframe embedding by malicious sites

### **MIME Sniffing**
- **How:** X-Content-Type-Options forces browsers to respect Content-Type

### **Man-in-the-Middle (MITM)**
- **How:** CSP `upgrade-insecure-requests` forces HTTPS

### **SQL Injection**
- **How:** Supabase uses parameterized queries (not raw SQL concatenation)

### **CSRF (Cross-Site Request Forgery)**
- **How:** 
  - Supabase auth tokens validated server-side
  - Admin JWT tokens in httpOnly cookies
  - SameSite cookie attribute (future: add explicitly)

---

## ❌ Agent-Ready Features NOT Implemented

*The following were recommended in the SEO audit but are **NOT applicable** for an e-commerce site:*

### **API Catalog (/.well-known/api-catalog)**
- **Status:** Not implemented
- **Why:** We don't expose public APIs
- **Decision:** Only relevant for API providers (Stripe, Twilio, etc.)

### **OAuth/OIDC Discovery**
- **Status:** Not implemented
- **Why:** We're not an OAuth provider
- **Decision:** Supabase handles our auth, we don't need to expose OAuth metadata

### **MCP Server Card**
- **Status:** Not implemented
- **Why:** Experimental feature for developer tools
- **Decision:** Not production-ready, not relevant for e-commerce

### **Agent Skills Index**
- **Status:** Not implemented
- **Why:** Only relevant if exposing programmatic skills/tools to AI
- **Decision:** E-commerce storefront doesn't need this

### **WebMCP**
- **Status:** Not implemented
- **Why:** Experimental Chrome-only feature
- **Decision:** Too early, not cross-browser, not production-stable

---

## 📊 Security Audit Summary (2026-05-22)

### **✅ IMPLEMENTED**
1. X-Frame-Options: SAMEORIGIN
2. X-Content-Type-Options: nosniff
3. Referrer-Policy: strict-origin-when-cross-origin
4. Content-Security-Policy (comprehensive)
5. Link headers for agent discovery
6. Content Signals in robots.txt
7. Markdown for Agents detection

### **🔜 FUTURE ENHANCEMENTS**
1. CSP with nonces (remove `'unsafe-inline'`)
2. Subresource Integrity (SRI) for third-party scripts
3. Rate limiting on login endpoints
4. Security.txt file (/.well-known/security.txt)

### **❌ NOT APPLICABLE**
1. API Catalog
2. OAuth/OIDC Discovery
3. MCP Server Card
4. Agent Skills Index
5. WebMCP

---

## 🔍 Security Monitoring

### **Regular Checks**
- [ ] Monthly: Review CSP violations (if logging enabled)
- [ ] Monthly: Check for dependency vulnerabilities (`npm audit`)
- [ ] Quarterly: Review admin access logs
- [ ] Quarterly: Test authentication flows

### **Tools**
- **Security Headers:** https://securityheaders.com/
- **Mozilla Observatory:** https://observatory.mozilla.org/
- **npm audit:** Built-in vulnerability scanner

---

## 🚧 Security Best Practices

### **For Developers**
1. **Never commit secrets** - Use `.env` files, never hardcode
2. **Validate all input** - Server-side, never trust client
3. **Use parameterized queries** - Prevent SQL injection
4. **Escape output** - React does this by default, but be careful with `dangerouslySetInnerHTML`
5. **HTTPS everywhere** - Production must use HTTPS

### **For Admin Users**
1. **Strong passwords** - Minimum 16 characters
2. **Unique passwords** - Don't reuse across sites
3. **2FA** - Future: Implement two-factor auth
4. **Log out** - Always log out from shared computers

---

## 📚 References

- **OWASP Top 10:** https://owasp.org/www-project-top-ten/
- **CSP Guide:** https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP
- **Next.js Security:** https://nextjs.org/docs/app/building-your-application/configuring/security-headers
- **Content Signals:** https://contentsignals.org/
- **RFC 8288 (Link Headers):** https://www.rfc-editor.org/rfc/rfc8288

---

**Last Security Audit:** 2026-05-22  
**Next Review:** 2026-08-22 (Quarterly)  
**Questions?** Check [cloud.md](../cloud.md) or contact dev team
