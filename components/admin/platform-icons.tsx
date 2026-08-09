import { Share2 } from "lucide-react";

/**
 * Platform brand glyphs for the social admin.
 *
 * lucide-react dropped its brand icons, so these are small inline SVG paths. They are
 * monochrome and inherit `currentColor`, so the surrounding status colour (green posted,
 * red failed, grey pending) still drives the appearance.
 *
 * To support a new platform: add one entry here whose key matches the `platform` value
 * written to `social_post_log`. Anything unrecognised falls back to a generic share icon,
 * so an unknown platform renders sensibly instead of breaking the row.
 */

export type PlatformIconProps = { size?: number; className?: string };

function Svg({
  size = 15,
  className,
  children,
}: PlatformIconProps & { children: React.ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      {children}
    </svg>
  );
}

function FacebookIcon(props: PlatformIconProps) {
  return (
    <Svg {...props}>
      <path d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.69 4.53-4.69 1.31 0 2.68.24 2.68.24v2.97h-1.51c-1.49 0-1.96.93-1.96 1.89v2.25h3.33l-.53 3.49h-2.8V24C19.61 23.1 24 18.1 24 12.07Z" />
    </Svg>
  );
}

function InstagramIcon(props: PlatformIconProps) {
  return (
    <Svg {...props}>
      <path d="M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41a3.8 3.8 0 0 1-1.38-.9 3.8 3.8 0 0 1-.9-1.38c-.16-.42-.36-1.06-.41-2.23C2.17 15.58 2.16 15.2 2.16 12s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41C8.42 2.17 8.8 2.16 12 2.16ZM12 0C8.74 0 8.33.01 7.05.07 5.78.13 4.9.33 4.14.63a5.9 5.9 0 0 0-2.13 1.38A5.9 5.9 0 0 0 .63 4.14C.33 4.9.13 5.78.07 7.05.01 8.33 0 8.74 0 12s.01 3.67.07 4.95c.06 1.27.26 2.15.56 2.91.31.79.72 1.46 1.38 2.13a5.9 5.9 0 0 0 2.13 1.38c.76.3 1.64.5 2.91.56C8.33 23.99 8.74 24 12 24s3.67-.01 4.95-.07c1.27-.06 2.15-.26 2.91-.56a5.9 5.9 0 0 0 2.13-1.38 5.9 5.9 0 0 0 1.38-2.13c.3-.76.5-1.64.56-2.91.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95c-.06-1.27-.26-2.15-.56-2.91a5.9 5.9 0 0 0-1.38-2.13A5.9 5.9 0 0 0 19.86.63c-.76-.3-1.64-.5-2.91-.56C15.67.01 15.26 0 12 0Zm0 5.84a6.16 6.16 0 1 0 0 12.32 6.16 6.16 0 0 0 0-12.32ZM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8Zm7.85-10.4a1.44 1.44 0 1 1-2.88 0 1.44 1.44 0 0 1 2.88 0Z" />
    </Svg>
  );
}

function YoutubeIcon(props: PlatformIconProps) {
  return (
    <Svg {...props}>
      <path d="M23.5 6.19a3.02 3.02 0 0 0-2.12-2.14C19.5 3.55 12 3.55 12 3.55s-7.5 0-9.38.5A3.02 3.02 0 0 0 .5 6.19C0 8.08 0 12 0 12s0 3.92.5 5.81a3.02 3.02 0 0 0 2.12 2.14c1.88.5 9.38.5 9.38.5s7.5 0 9.38-.5a3.02 3.02 0 0 0 2.12-2.14C24 15.92 24 12 24 12s0-3.92-.5-5.81ZM9.55 15.57V8.43L15.82 12l-6.27 3.57Z" />
    </Svg>
  );
}

function WhatsappIcon(props: PlatformIconProps) {
  return (
    <Svg {...props}>
      <path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.64.07-.3-.15-1.25-.46-2.39-1.47-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.61-.92-2.21-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.01-1.04 2.47s1.06 2.87 1.21 3.07c.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.69.63.71.22 1.36.19 1.87.12.57-.09 1.76-.72 2-1.41.25-.7.25-1.29.18-1.41-.07-.12-.27-.2-.57-.35ZM12.05 21.8h-.01a9.8 9.8 0 0 1-5-1.37l-.36-.21-3.72.97.99-3.62-.23-.37a9.79 9.79 0 0 1-1.5-5.23c0-5.4 4.41-9.8 9.83-9.8a9.76 9.76 0 0 1 9.82 9.81c0 5.4-4.41 9.81-9.82 9.81ZM20.52 3.49A11.75 11.75 0 0 0 12.05 0C5.5 0 .18 5.31.17 11.85c0 2.09.55 4.13 1.59 5.93L.07 24l6.37-1.67a11.9 11.9 0 0 0 5.6 1.42h.01c6.55 0 11.87-5.32 11.88-11.86a11.78 11.78 0 0 0-3.47-8.4Z" />
    </Svg>
  );
}

function TiktokIcon(props: PlatformIconProps) {
  return (
    <Svg {...props}>
      <path d="M12.53.02C13.84 0 15.14.01 16.44 0c.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07Z" />
    </Svg>
  );
}

function PinterestIcon(props: PlatformIconProps) {
  return (
    <Svg {...props}>
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.08 3.16 9.43 7.63 11.19-.11-.95-.2-2.41.04-3.45.22-.94 1.4-5.96 1.4-5.96s-.36-.72-.36-1.78c0-1.67.97-2.92 2.17-2.92 1.02 0 1.52.77 1.52 1.69 0 1.03-.66 2.57-1 4-.28 1.19.6 2.16 1.77 2.16 2.13 0 3.76-2.24 3.76-5.48 0-2.86-2.06-4.87-5-4.87-3.41 0-5.41 2.55-5.41 5.19 0 1.03.4 2.13.89 2.73.1.12.11.22.08.34-.09.38-.29 1.19-.33 1.36-.05.22-.17.27-.4.16-1.5-.7-2.43-2.89-2.43-4.65 0-3.79 2.75-7.27 7.94-7.27 4.17 0 7.41 2.97 7.41 6.94 0 4.14-2.61 7.47-6.24 7.47-1.22 0-2.36-.63-2.75-1.38l-.75 2.85c-.27 1.04-1 2.35-1.49 3.15C9.57 23.81 10.76 24 12 24c6.63 0 12-5.37 12-12S18.63 0 12 0Z" />
    </Svg>
  );
}

function XIcon(props: PlatformIconProps) {
  return (
    <Svg {...props}>
      <path d="M18.9 1.15h3.68l-8.04 9.19L24 22.85h-7.41l-5.8-7.58-6.64 7.58H.46l8.6-9.83L0 1.15h7.59l5.24 6.93 6.07-6.93Zm-1.29 19.5h2.04L6.49 3.24H4.3l13.31 17.41Z" />
    </Svg>
  );
}

const REGISTRY: Record<string, (p: PlatformIconProps) => React.ReactElement> = {
  facebook: FacebookIcon,
  instagram: InstagramIcon,
  youtube: YoutubeIcon,
  whatsapp: WhatsappIcon,
  tiktok: TiktokIcon,
  pinterest: PinterestIcon,
  x: XIcon,
  twitter: XIcon,
};

/** Brand glyph for a platform, falling back to a generic share icon. */
export function PlatformIcon({
  platform,
  size = 15,
  className,
}: PlatformIconProps & { platform: string }) {
  const Brand = REGISTRY[platform.toLowerCase()];
  if (!Brand) return <Share2 size={size} className={className} />;
  return <Brand size={size} className={className} />;
}

/** Human-readable platform name, e.g. "instagram" -> "Instagram", "x" -> "X". */
export function platformLabel(platform: string): string {
  if (platform.toLowerCase() === "x") return "X";
  return platform.charAt(0).toUpperCase() + platform.slice(1);
}
