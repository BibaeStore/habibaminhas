import { SocialChrome } from "@/components/admin/social/chrome";

/**
 * Shared frame for /admin/social and its sub-pages.
 *
 * Photos, Reels, Planner and Settings are separate routes rather than tabs in one
 * component. Putting the navigation, the week's progress and the master automation switch
 * in a layout means they are defined once and cannot drift between pages — the drift being
 * the actual complaint that prompted this rebuild, where a photo and a reel were shown by
 * two sets of subtly different controls.
 */
export default function SocialLayout({ children }: { children: React.ReactNode }) {
  return <SocialChrome>{children}</SocialChrome>;
}
