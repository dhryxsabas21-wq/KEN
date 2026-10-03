/**
 * The site's public address, used for absolute URLs in link previews,
 * the sitemap and robots.txt.
 *
 * On Vercel, VERCEL_PROJECT_PRODUCTION_URL is set at build time to the
 * production domain (e.g. kennedy-pronto.vercel.app, or a custom domain
 * once added), so nothing needs configuring. Locally it falls back to
 * the dev server.
 */
const host =
  process.env.VERCEL_PROJECT_PRODUCTION_URL ?? process.env.VERCEL_URL ?? null;

export const siteUrl = host ? `https://${host}` : "http://localhost:3000";
