import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const home = defineCollection({
  loader: glob({ pattern: "home.md", base: "./vault" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    tagline: z.string(),
    jobhunt: z.string().optional(),
  }),
});

const pages = defineCollection({
  loader: glob({ pattern: ["*.md", "!home.md"], base: "./vault" }),
  schema: z
    .object({
      title: z.string().optional(),
      description: z.string().optional(),
      publish: z.boolean().default(false),
    })
    .superRefine((data, ctx) => {
      if (data.publish && !data.title) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "title ist Pflicht, wenn publish: true",
        });
      }
    }),
});

export const collections = { home, pages };
