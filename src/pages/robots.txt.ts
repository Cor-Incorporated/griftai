import type { APIRoute } from 'astro';
import { siteConfig } from '@/config';

export const GET: APIRoute = () => {
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
