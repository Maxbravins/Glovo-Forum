const { z } = require("zod");

const postTypes = [
  "DISCUSSION",
  "QUESTION",
  "TIP",
  "EXPERIENCE",
  "PROBLEM",
  "IDEA",
  "ANNOUNCEMENT",
];

const createPostSchema = z.object({
  title: z.string().trim().min(3).max(200),
  content: z.string().trim().min(1).max(20000),
  categoryId: z.coerce.number().int().positive(),
  type: z.enum(postTypes).default("DISCUSSION"),
  tags: z.array(z.string().trim().min(1).max(30)).max(10).optional(),
});

const createCommentSchema = z.object({
  content: z.string().trim().min(1).max(10000),
  parentId: z.coerce.number().int().positive().nullable().optional(),
});

const reactionSchema = z.object({
  type: z.enum(["LIKE", "LOVE", "HELPFUL", "FUNNY"]).default("LIKE"),
});

const reportSchema = z.object({
  reason: z.enum([
    "SPAM",
    "HARASSMENT",
    "ABUSE",
    "MISINFORMATION",
    "FRAUD",
    "INAPPROPRIATE",
    "OTHER",
  ]),
  description: z.string().trim().max(1000).optional(),
});

module.exports = {
  createPostSchema,
  createCommentSchema,
  reactionSchema,
  reportSchema,
};
