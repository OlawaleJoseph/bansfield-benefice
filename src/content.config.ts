import { defineCollection } from 'astro:content';
import { file } from 'astro/loaders';
import { z } from 'astro/zod';
import fs from 'node:fs/promises';
import path from 'node:path';
import YAML from 'yaml';

const PAGES_DIR = 'src/content/pages';

const link = z.object({ href: z.string(), label: z.string() });

/**
 * Pages carried over from the old site: HTML files with YAML front matter.
 * The entry id is the page's path without ".html", e.g. "cowlinge/history/interior"
 * or "cowlinge/history/index".
 */
const pages = defineCollection({
  loader: {
    name: 'html-pages',
    async load({ store, parseData, generateDigest, logger, watcher }) {
      const root = path.resolve(PAGES_DIR);
      const files = (await fs.readdir(root, { recursive: true })).filter((f) => f.endsWith('.html'));
      const idFor = (rel: string) => rel.split(path.sep).join('/').replace(/\.html$/, '');
      const loadFile = async (rel: string) => {
        const raw = await fs.readFile(path.join(root, rel), 'utf8');
        const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
        if (!m) return logger.warn(`${rel}: missing front matter, skipped`);
        const id = idFor(rel);
        const data = await parseData({ id, data: YAML.parse(m[1]) ?? {} });
        store.set({ id, data, body: m[2], rendered: { html: m[2] }, digest: generateDigest(raw), filePath: path.join(PAGES_DIR, rel) });
      };
      store.clear();
      await Promise.all(files.map(loadFile));
      watcher?.add(root);
      const ours = (p: string) => p.startsWith(root) && p.endsWith('.html');
      watcher?.on('change', async (p) => ours(p) && (await loadFile(path.relative(root, p))));
      watcher?.on('add', async (p) => ours(p) && (await loadFile(path.relative(root, p))));
      watcher?.on('unlink', (p) => ours(p) && store.delete(idFor(path.relative(root, p))));
    },
  },
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    picture: z.object({ src: z.string(), alt: z.string().default('') }).optional(),
    nav: z.array(z.object({ head: link.optional(), links: z.array(link).default([]) })).optional(),
  }),
});

const photo = z.object({ src: z.string(), alt: z.string(), small: z.boolean().default(false) });

const churches = defineCollection({
  loader: file('src/data/churches.yaml'),
  schema: z.object({
    village: z.string(),
    dedication: z.string(),
    openDaily: z.boolean(),
    what3words: z.string(),
    parishGiving: z.string().optional(),
    photo,
    sidePhotos: z.array(photo).length(2),
    intro: z.string(),
    history: z.string(),
    blurb: z.string(),
    notes: z.string().optional(),
    map: z.url().optional(),
    pages: z.array(link),
  }),
});

const rotas = defineCollection({
  loader: file('src/data/rotas.yaml'),
  schema: z.object({
    month: z.string(),
    year: z.number(),
    season: z.string(),
    cycle: z.string(),
    href: z.url(),
  }),
});

const events = defineCollection({
  loader: file('src/data/events.yaml'),
  schema: z.object({
    date: z.coerce.date(),
    parish: z.enum(['Benefice', 'Cowlinge', 'Denston', 'Lidgate', 'Ousden', 'Stansfield', 'Stradishall', 'Wickhambrook']),
    place: z.string(),
    time: z.string(),
    title: z.string(),
    note: z.string().optional(),
    link: z.string().optional(),
    linkText: z.string().default('Details'),
  }),
});

export const collections = { pages, churches, rotas, events };
