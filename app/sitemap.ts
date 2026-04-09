import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://greed-compute-ui.vercel.app'
  return [
    { url: base, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: `${base}/login`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${base}/docs`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${base}/docs/integrations/crewai`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${base}/docs/integrations/langgraph`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${base}/docs/integrations/anthropic`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${base}/docs/integrations/openclaw`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${base}/playground`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${base}/upgrade`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
  ]
}
