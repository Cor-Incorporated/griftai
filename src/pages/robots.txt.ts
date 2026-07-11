import type { APIRoute } from 'astro';
import { siteConfig } from '@/config';
import { isPreviewSite } from '@/lib/site-env';

export const GET: APIRoute = () => {
  if (isPreviewSite()) {
    const previewRobots = `# robots.txt for ${siteConfig.name} (preview — noindex)
# https://www.robotstxt.org/

User-agent: *
Disallow: /
`;
    return new Response(previewRobots, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'X-Robots-Tag': 'noindex, nofollow',
      },
    });
  }

  const robotsTxt = `# robots.txt for ${siteConfig.name}
# https://www.robotstxt.org/

User-agent: *
Allow: /

# Disallow non-public routes only
Disallow: /api/
Disallow: /dashboard/
Disallow: /login/
Disallow: /register/
Disallow: /forgot-password/

# Explicitly allow Google AI / Gemini crawlers
User-agent: Googlebot
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: Googlebot-Image
Allow: /

# Sitemap location
Sitemap: ${siteConfig.url}/sitemap-index.xml
`;

  return new Response(robotsTxt, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
};
