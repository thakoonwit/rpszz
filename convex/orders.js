import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const orders = await ctx.db.query("orders").order("desc").collect();
    // Fetch products dynamically to simulate SQL join
    const enrichedOrders = [];
    for (const order of orders) {
      let product = null;
      if (order.product_id) {
        try {
          product = await ctx.db.get(order.product_id);
        } catch (e) {
          // ignore invalid IDs
        }
      }
      enrichedOrders.push({
        ...order,
        product,
        // compatibility fields
        products: product
      });
    }
    return enrichedOrders;
  },
});

export const getByPhone = query({
  args: { phone: v.string() },
  handler: async (ctx, args) => {
    const orders = await ctx.db
      .query("orders")
      .filter((q) => q.eq(q.field("customer_phone"), args.phone))
      .collect();

    const enrichedOrders = [];
    for (const order of orders) {
      let product = null;
      if (order.product_id) {
        try {
          product = await ctx.db.get(order.product_id);
        } catch (e) {
          // ignore
        }
      }
      enrichedOrders.push({
        ...order,
        product,
        products: product
      });
    }
    return enrichedOrders;
  },
});

export const add = mutation({
  args: {
    customer_name: v.string(),
    customer_phone: v.string(),
    product_id: v.optional(v.string()),
    status: v.string(),
    tracking_number: v.optional(v.string()),
    note: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("orders", args);
  },
});

export const update = mutation({
  args: {
    id: v.id("orders"),
    customer_name: v.string(),
    customer_phone: v.string(),
    product_id: v.optional(v.string()),
    status: v.string(),
    tracking_number: v.optional(v.string()),
    note: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...data } = args;
    await ctx.db.patch(id, data);
  },
});

export const deleteOrder = mutation({
  args: { id: v.id("orders") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
