import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({
    pattern: '**/*.md',
    base: './src/content/blog',
    // Strip the .md extension so post.id (and thus the URL) is
    // /blog/welcome-to-faast/ rather than /blog/welcome-to-faast.md/.
    generateId: ({ entry }) => entry.replace(/\.md$/, ''),
  }),
  schema: z.object({
    title: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    excerpt: z.string(),
    category: z.enum(['article', 'news']),
    tags: z.array(z.string()).default([]),
    author: z.string().default('Dr. Asim Iftikhar, DPT'),
    image: z.object({ url: z.string(), alt: z.string() }).optional(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { blog };
