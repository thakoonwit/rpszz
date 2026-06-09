import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("reviews").order("desc").collect();
  },
});

export const add = mutation({
  args: {
    customer_name: v.string(),
    rating: v.number(),
    comment: v.optional(v.string()),
    facebook_url: v.optional(v.string()),
    avatar_url: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("reviews", args);
  },
});

export const update = mutation({
  args: {
    id: v.id("reviews"),
    customer_name: v.string(),
    rating: v.number(),
    comment: v.optional(v.string()),
    facebook_url: v.optional(v.string()),
    avatar_url: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...data } = args;
    await ctx.db.patch(id, data);
  },
});

export const deleteReview = mutation({
  args: { id: v.id("reviews") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
