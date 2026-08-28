"use client";

import { ProductPostsPage } from "@/components/admin/social/product-posts";

/**
 * The static stream: one hero photograph, twice a week.
 *
 * Its own page because it is its own rotation. The static stream had been publishing correctly
 * since it shipped but there was nowhere to look at it, which is a strange thing to ask an owner
 * to trust.
 */
export default function StaticPage() {
  return <ProductPostsPage stream="static" />;
}
