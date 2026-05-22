# 💻 Development Standards

**Last Updated:** 2026-05-22  
**Owner:** Development Team  
**Status:** Active

---

## 📋 Quick Reference

Habiba Minhas is built with **Next.js 16.2.4 (App Router)**, **Supabase**, **Tailwind CSS v4**, and **TypeScript**. This is a production e-commerce site — all changes must maintain stability and performance.

---

## 🛠️ Tech Stack

### **Core Framework**
- **Next.js:** 16.2.4 (App Router)
  - ⚠️ **WARNING:** Next.js 16 has breaking changes from v15
  - Read `node_modules/next/dist/docs/` before writing code
  - Server Components by default
  - Metadata API for SEO
- **React:** 19.2.4
- **TypeScript:** 5.x
- **Node.js:** 20.x (minimum)

### **Database & Backend**
- **Supabase:** PostgreSQL + Auth + Storage
  - Client: `@supabase/supabase-js` (2.103.3)
  - SSR: `@supabase/ssr` (0.10.2)
- **Server Actions:** Used for mutations (orders, cart, etc.)
- **API Routes:** Used for webhooks, external integrations

### **Styling**
- **Tailwind CSS:** v4 (latest)
  - Config: `tailwindcss.config.js` (removed in v4, uses `@theme` in CSS)
  - PostCSS: `@tailwindcss/postcss` plugin
- **CSS Variables:** Used for color tokens (see `app/globals.css`)

### **State Management**
- **Zustand:** 5.0.12
  - Cart state: `lib/cart-store.ts`
  - Checkout state: `lib/checkout-store.ts`
  - Wishlist state: `lib/wishlist-store.ts`

### **Authentication**
- **Admin:** JWT tokens (jose library)
  - Cookie: `admin_token`
  - Middleware: `middleware.ts` lines 4-25
- **Customer:** Supabase Auth
  - Cookie prefix: `sb-*-auth-token`
  - Server-side validation in page components

### **Email & Notifications**
- **Nodemailer:** 8.0.7
- **PDFKit:** 0.18.0 (for invoices)

---

## 📂 Project Structure

```
habiba-minhas/
├── app/                          # Next.js App Router
│   ├── (public routes)/
│   │   ├── page.tsx             # Home page
│   │   ├── ladies/              # Category pages
│   │   ├── kids/
│   │   ├── baby/
│   │   ├── accessories/
│   │   ├── journal/             # Blog
│   │   └── product/[category]/[slug]/
│   ├── admin/                   # Admin dashboard
│   │   ├── layout.tsx           # Admin-only layout
│   │   ├── page.tsx             # Dashboard home
│   │   ├── orders/
│   │   ├── products/
│   │   └── ...
│   ├── account/                 # Customer account
│   ├── cart/
│   ├── checkout/
│   │   ├── shipping/
│   │   └── payment/
│   ├── api/                     # API routes
│   │   └── categories/images/
│   ├── .well-known/             # Discovery endpoints
│   │   └── apple-app-site-association/
│   ├── robots.txt/              # Robots.txt with Content Signals
│   ├── layout.tsx               # Root layout (public)
│   ├── globals.css              # Global styles + design tokens
│   └── not-found.tsx
├── components/
│   ├── admin/                   # Admin-only components
│   ├── common/                  # Shared components
│   ├── home/                    # Homepage components
│   ├── product/                 # Product-related
│   └── ui/                      # Reusable UI primitives
├── lib/
│   ├── actions/                 # Server actions
│   │   ├── products.ts
│   │   ├── orders.ts
│   │   ├── customers.ts
│   │   └── ...
│   ├── supabase/
│   │   ├── client.ts           # Client-side Supabase
│   │   └── server.ts           # Server-side Supabase
│   ├── cart-store.ts           # Zustand cart state
│   ├── checkout-store.ts       # Checkout flow state
│   ├── wishlist-store.ts
│   └── utils.ts                # Shared utilities
├── public/                      # Static assets
│   ├── categories/
│   ├── editorial/
│   ├── HeroSection/
│   ├── logo/
│   └── data/                   # Static JSON (reviews, sold)
├── docs/                        # Documentation
│   ├── cloud.md                # Main index
│   ├── standards/
│   ├── changelogs/
│   └── content/
├── middleware.ts                # Edge middleware (auth, redirects)
├── next.config.ts               # Next.js config
├── tailwind.config.js           # Tailwind v4 (minimal)
├── tsconfig.json
└── package.json
```

---

## 🎯 Coding Standards

### **File Naming**
- Components: `PascalCase.tsx` (e.g., `ProductCard.tsx`)
- Utilities: `kebab-case.ts` (e.g., `format-price.ts`)
- Server actions: `kebab-case.ts` (e.g., `get-products.ts`)
- Routes: `kebab-case/` folders (App Router convention)

### **Component Patterns**

#### **Server Components (Default)**
```tsx
// app/products/page.tsx
export default async function ProductsPage() {
  const products = await getProducts(); // Server-side data fetch
  return <ProductGrid products={products} />;
}
```

#### **Client Components (Interactive)**
```tsx
'use client';

import { useState } from 'react';

export function AddToCartButton({ productId }: Props) {
  const [loading, setLoading] = useState(false);
  // Interactive logic
}
```

#### **Server Actions**
```tsx
'use server';

import { createClient } from '@/lib/supabase/server';

export async function addToCart(productId: string) {
  const supabase = await createClient();
  // Mutation logic
  revalidatePath('/cart');
}
```

### **TypeScript Rules**
- ✅ Use `interface` for objects, `type` for unions/primitives
- ✅ Avoid `any` - use `unknown` if truly unknown
- ✅ Export types from component files
- ✅ Use `satisfies` for type narrowing

### **Import Order**
1. React / Next.js
2. External libraries
3. Internal lib/components (use `@/` alias)
4. Types
5. Styles (if any)

```tsx
import { Metadata } from 'next';
import { getProducts } from '@/lib/actions/products';
import { ProductCard } from '@/components/product/product-card';
import type { Product } from '@/types';
```

---

## 🔄 Data Fetching Patterns

### **Server-Side (Recommended)**
```tsx
// Fetch in Server Component
export default async function Page() {
  const data = await fetchData(); // Direct async/await
  return <Component data={data} />;
}
```

### **Client-Side (When Needed)**
```tsx
'use client';

import { useEffect, useState } from 'react';

export function ClientComponent() {
  const [data, setData] = useState(null);
  useEffect(() => {
    fetchData().then(setData);
  }, []);
  // ...
}
```

### **Server Actions (Mutations)**
```tsx
// lib/actions/cart.ts
'use server';

export async function addToCart(formData: FormData) {
  const productId = formData.get('productId');
  // Mutate database
  revalidatePath('/cart');
  return { success: true };
}
```

---

## 🗄️ Database (Supabase)

### **Tables (Main)**
- `products` - Product catalog
- `categories` - Product categories
- `orders` - Customer orders
- `order_items` - Order line items
- `customers` - Customer accounts
- `addresses` - Shipping addresses
- `admins` - Admin users

### **Server-Side Client**
```tsx
import { createClient } from '@/lib/supabase/server';

export async function getProducts() {
  const supabase = await createClient();
  const { data } = await supabase.from('products').select('*');
  return data;
}
```

### **Client-Side Client**
```tsx
import { createClient } from '@/lib/supabase/client';

export function useProducts() {
  const supabase = createClient();
  // Client-side queries
}
```

---

## 🔐 Authentication Flow

### **Admin**
1. Login: POST to `/api/admin/auth/login`
2. JWT signed with `ADMIN_JWT_SECRET`
3. Cookie: `admin_token` (httpOnly)
4. Middleware validates JWT for `/admin/*` routes

### **Customer**
1. Supabase Auth (email/password)
2. Session cookie: `sb-*-auth-token`
3. Server-side validation in components
4. Middleware checks cookie presence for `/account/*`

---

## ⚡ Performance Best Practices

### **Images**
```tsx
import Image from 'next/image';

<Image
  src="/path/to/image.webp"
  alt="Description"
  width={400}
  height={500}
  loading="lazy"           // Below fold
  priority                 // Above fold only
  sizes="(max-width: 768px) 100vw, 50vw"
/>
```

### **Metadata (SEO)**
```tsx
export const metadata: Metadata = {
  title: "Page Title",
  description: "Unique description",
  alternates: {
    canonical: "/page-path/",
  },
};
```

### **Code Splitting**
- Use dynamic imports for heavy components
```tsx
const HeavyComponent = dynamic(() => import('./heavy-component'), {
  loading: () => <Skeleton />,
});
```

---

## 🧪 Testing

*Currently no automated tests in place. Future: Add Jest + React Testing Library.*

**Manual Testing Checklist:**
- [ ] Test on Chrome, Firefox, Safari
- [ ] Test on mobile (iOS Safari, Android Chrome)
- [ ] Test admin dashboard (all CRUD operations)
- [ ] Test checkout flow (shipping → payment → confirmation)
- [ ] Test cart (add, remove, update quantity)

---

## 🚀 Deployment

### **Environment Variables**

**.env.local (Development):**
```
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx
ADMIN_JWT_SECRET=xxx
```

**.env.production (Production):**
- Same variables as development
- Use production Supabase project
- Strong `ADMIN_JWT_SECRET` (32+ characters)

### **Build & Deploy**
```bash
npm run build      # Creates production build
npm run start      # Starts production server
```

### **Vercel (Recommended Host)**
- Auto-deploys from `main` branch
- Environment variables set in Vercel dashboard
- Edge Functions for middleware
- CDN for static assets

---

## 🚨 Important Notes

### **Next.js 16 Breaking Changes**
⚠️ **Read `AGENTS.md` before making changes!**

Next.js 16 has breaking changes:
- API changes (check official docs)
- File structure conventions may differ
- New middleware syntax
- Read `node_modules/next/dist/docs/` for latest API reference

### **Performance Monitoring**
- Lighthouse score target: 90+ (mobile & desktop)
- Core Web Vitals: All green
- Check `git log` for recent optimizations (hero images, polyfills, etc.)

### **Security**
- Never commit `.env` files
- Never expose `SUPABASE_SERVICE_ROLE_KEY` to client
- Admin routes protected by middleware
- CSP headers prevent XSS

---

## 📚 References

- **Next.js Docs:** https://nextjs.org/docs
- **Supabase Docs:** https://supabase.com/docs
- **Tailwind CSS v4:** https://tailwindcss.com/docs
- **TypeScript:** https://www.typescriptlang.org/docs
- **Security:** See [security.md](./security.md)
- **Design:** See [design.md](./design.md)

---

**Last Major Update:** 2026-05-22 (Security headers, Agent-Ready features)  
**Review Frequency:** Monthly  
**Questions?** Check [cloud.md](../cloud.md) or ask the dev team
