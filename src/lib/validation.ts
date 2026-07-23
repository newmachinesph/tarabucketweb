import { z } from "zod";
import { CATEGORY_KEYS } from "./categories";

export const postSchema = z.object({
  title: z.string().trim().min(3, "Title is too short").max(160),
  slug: z
    .string()
    .trim()
    .regex(/^[a-z0-9-]*$/, "Use lowercase letters, numbers, and dashes")
    .max(160)
    .optional()
    .or(z.literal("")),
  excerpt: z.string().trim().max(320).default(""),
  content: z.string().default(""),
  coverImage: z.string().trim().url("Must be a valid URL").or(z.literal("")).optional(),
  category: z.enum(CATEGORY_KEYS as [string, ...string[]]),
  tags: z.array(z.string().trim().min(1)).max(12).default([]),
  status: z.enum(["draft", "published"]).default("draft"),
  featured: z.boolean().default(false),
});

export type PostInput = z.infer<typeof postSchema>;

export const newsletterSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
});

export const storySchema = z.object({
  name: z.string().trim().min(2, "Tell us your name").max(80),
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
  location: z.string().trim().max(80).default(""),
  title: z.string().trim().min(3, "Give your story a title").max(160),
  story: z.string().trim().min(30, "Share a little more (min 30 chars)").max(6000),
});
