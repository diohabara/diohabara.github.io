import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './content/blog' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    draft: z.boolean().default(false),
    type: z.string().default('post'),
    tags: z.array(z.string()).default([]),
    language: z.enum(['ja', 'en']).default('ja'),
    image: z.string().optional(),
    description: z.string().optional(),
  }),
});

export const collections = { blog };
