import Link from "next/link";
import { getCategoryBySlug, getChildCategories } from "@/lib/actions/categories";

/**
 * Server-rendered list of subcategory links for a category landing page.
 *
 * SEO purpose: the desktop mega-menu and mobile menu only render subcategory
 * links client-side (on hover/tap), so crawlers never see them and the
 * subcategory pages become "orphans". This block emits real <a href> links in
 * the server HTML so every active subcategory is crawlable from its parent
 * landing page. Slugs come straight from the DB — same source the sitemap uses.
 */
export async function SubcategoryLinks({
  parentSlug,
  basePath,
  heading = "Browse by Category",
}: {
  parentSlug: string;   // DB category slug, e.g. "baby-products"
  basePath: string;     // route prefix incl. trailing slash, e.g. "/baby/"
  heading?: string;
}) {
  let children: { id: string; name: string; slug: string }[] = [];
  try {
    const parent = await getCategoryBySlug(parentSlug);
    children = await getChildCategories(parent.id);
  } catch {
    return null; // fail safe — never break the page over a nav block
  }

  if (children.length === 0) return null;

  return (
    <nav
      aria-label={heading}
      className="mx-auto w-full max-w-[1440px] px-4 pb-16 sm:px-8"
    >
      <h2 className="mb-5 text-[11px] uppercase tracking-[0.3em] text-gold-dark">
        {heading}
      </h2>
      <ul className="flex flex-wrap gap-3">
        {children.map((c) => (
          <li key={c.id}>
            <Link
              href={`${basePath}${c.slug}/`}
              className="inline-flex items-center border border-border-soft px-4 py-2 text-[12px] uppercase tracking-[0.2em] text-ink-soft transition-colors hover:border-ink hover:text-ink"
            >
              {c.name}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
