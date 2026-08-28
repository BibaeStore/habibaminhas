"use client";

import { ProductPostsPage } from "@/components/admin/social/product-posts";

/**
 * The carousel stream: a multi-image product post, every day.
 *
 * Was labelled simply "Posts", which became wrong the moment a second product stream existed —
 * the owner could not tell a carousel from a static anywhere in the admin.
 */
export default function CarouselPage() {
  return <ProductPostsPage stream="carousel" />;
}
