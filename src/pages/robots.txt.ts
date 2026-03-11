import type { APIRoute } from 'astro';
import { siteConfig } from '@/config';

export const GET: APIRoute = () => {
  const robotsTxt = `# robots.txt for ${siteConfig.name}
# https://www.robotstxt.org/

User-agent: *
Allow: /

# Disallow template-only or non-launch routes
Disallow: /api/
Disallow: /_astro/
Disallow: /dashboard/
Disallow: /login/
Disallow: /register/
Disallow: /forgot-password/
Disallow: /about/
Disallow: /careers/
Disallow: /customers/
Disallow: /demo/
Disallow: /docs/
Disallow: /enterprise/
Disallow: /features/
Disallow: /integrations/
Disallow: /roadmap/
Disallow: /security/
Disallow: /status/
Disallow: /testimonials/
Disallow: /blog/
Disallow: /changelog/

# Sitemap location
Sitemap: ${siteConfig.url}/sitemap-index.xml
`;

  return new Response(robotsTxt, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
};
