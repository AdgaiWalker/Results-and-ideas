import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const log = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/log' }),
  schema: z.object({
    title: z.string(),
    date: z.date(),
    tags: z.array(z.string()),
    type: z.enum(['article', 'photo', 'thought', 'project', 'dialogue']),
    published: z.boolean().default(true),
    cover: z.string().optional(),
    link: z.string().url().optional(),
  }),
});

export const collections = { log };
