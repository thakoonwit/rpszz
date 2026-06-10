import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  products: defineTable({
    name: v.string(),
    title: v.string(),
    description: v.optional(v.string()),
    price: v.number(),
    category: v.optional(v.string()),
    image_url: v.optional(v.string()),
    status: v.string(), // "available", "reserved", "sold"
    is_hot: v.optional(v.boolean()),
  }),
  orders: defineTable({
    customer_name: v.string(),
    customer_phone: v.string(),
    product_id: v.optional(v.string()),
    status: v.string(), // "preparing", "shipped", "delivered"
    tracking_number: v.optional(v.string()),
    note: v.optional(v.string()),
    delivery_image_url: v.optional(v.string()),
  }),
  reviews: defineTable({
    customer_name: v.string(),
    rating: v.number(),
    comment: v.optional(v.string()),
    facebook_url: v.optional(v.string()),
    avatar_url: v.optional(v.string()),
  }),
});
