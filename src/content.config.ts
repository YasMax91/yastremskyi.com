import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
// `z` re-exported from astro:content is deprecated; astro:schema is the module now.
import { z } from 'astro:schema';

/**
 * Case studies follow one fixed spine (brief §5), and the spine is enforced
 * here rather than left to discipline: a case study missing "the subtle part"
 * fails the build instead of shipping as a feature list.
 *
 * Each section is its own frontmatter field. That is deliberate — putting the
 * narrative in the markdown body would make the structure a convention that a
 * future edit can quietly drop.
 */
const work = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/work' }),
  schema: z.object({
    /** Reading order on /work. Lower comes first. */
    order: z.number().int().positive(),
    title: z.string().min(3),
    /** One line for the card on the home page and the index. */
    summary: z.string().min(20).max(220),

    /** 1. Context — the domain, in one honest paragraph. Unnamed, but concrete. */
    context: z.string().min(80),
    /** 2. The constraint — what made it hard. The real one, not a generic one. */
    constraint: z.string().min(80),
    /** 3. The decision — what was chosen, what was rejected, and the trade-off. */
    decision: z.object({
      chosen: z.string().min(60),
      rejected: z.string().min(40),
      tradeoff: z.string().min(40),
    }),
    /** 4. The subtle part — the detail a mid-level engineer would have got wrong. */
    subtle: z.string().min(80),
    /** 5. Outcome — what it does in production now. */
    outcome: z.string().min(40),
    /** 6. Stack — chips, never prose. */
    stack: z.array(z.string().min(1)).min(3).max(12),

    /**
     * Groundwork is the single project on this site that may be named and
     * linked. Everything else is under NDA and is described generically, so a
     * link here on any other entry is a mistake worth failing the build over.
     */
    repo: z.url().optional(),

    /** Set once Max has personally cleared the wording against his NDAs. */
    ndaReviewed: z.boolean().default(false),
  }),
});

export const collections = { work };
