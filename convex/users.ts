import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Query to get user by ID
export const getUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.userId);
  },
});

// Query to get user by email
export const getUserByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();
  },
});

// Query to get user by polar customer ID
export const getUserByPolarCustomerId = query({
  args: { polarCustomerId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_polar_customer_id", (q) => q.eq("polarCustomerId", args.polarCustomerId))
      .first();
  },
});

// Mutation to add credits to user
export const addCredits = mutation({
  args: {
    userId: v.string(), // BetterAuth user ID (string)
    credits: v.number(),
    polarCustomerId: v.string(),
  },
  handler: async (ctx, args) => {
    // First, try to find user by polarCustomerId
    const user = await ctx.db
      .query("users")
      .withIndex("by_polar_customer_id", (q) => q.eq("polarCustomerId", args.polarCustomerId))
      .first();

    // If not found by polar customer ID, try to find by the userId (assuming it might be stored in a custom field)
    if (!user) {
      // You might need to adjust this based on how BetterAuth stores user IDs
      // This assumes you have a way to map BetterAuth user IDs to Convex user records
      throw new Error(`User not found with polarCustomerId: ${args.polarCustomerId}`);
    }

    // Update the user's credits (add to existing credits)
    const updatedCredits = user.credits + args.credits;

    await ctx.db.patch(user._id, {
      credits: updatedCredits,
      polarCustomerId: args.polarCustomerId, // Ensure this is set
    });

    return {
      success: true,
      userId: user._id,
      newCredits: updatedCredits,
      addedCredits: args.credits,
    };
  },
});

// Mutation to deduct credits from user
export const deductCredits = mutation({
  args: {
    userId: v.id("users"),
    credits: v.number(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);

    if (!user) {
      throw new Error("User not found");
    }

    if (user.credits < args.credits) {
      throw new Error("Insufficient credits");
    }

    const newCredits = user.credits - args.credits;

    await ctx.db.patch(args.userId, {
      credits: newCredits,
    });

    return {
      success: true,
      newCredits,
      deductedCredits: args.credits,
    };
  },
});

// Mutation to create a new user (for BetterAuth integration)
export const createUser = mutation({
  args: {
    email: v.string(),
    name: v.optional(v.string()),
    image: v.optional(v.string()),
    hashedPassword: v.optional(v.string()),
    isVerified: v.boolean(),
    verifyToken: v.optional(v.string()),
    credits: v.optional(v.number()),
    polarCustomerId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("users", {
      email: args.email,
      emailVerified: false, // Will be updated when email is verified
      name: args.name,
      image: args.image,
      hashedPassword: args.hashedPassword,
      isVerified: args.isVerified,
      verifyToken: args.verifyToken,
      credits: args.credits ?? 10, // Default credits for new users
      polarCustomerId: args.polarCustomerId,
    });
  },
});

// Mutation to update user verification status
export const updateUserVerification = mutation({
  args: {
    userId: v.id("users"),
    isVerified: v.boolean(),
    emailVerified: v.boolean(),
    verifyToken: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, {
      isVerified: args.isVerified,
      emailVerified: args.emailVerified,
      verifyToken: args.verifyToken,
    });

    return { success: true };
  },
});

// Mutation to update polar customer ID
export const updatePolarCustomerId = mutation({
  args: {
    userId: v.id("users"),
    polarCustomerId: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, {
      polarCustomerId: args.polarCustomerId,
    });

    return { success: true };
  },
});

// Query to check user credits
export const getUserCredits = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    return user ? { credits: user.credits } : null;
  },
});

// Query to get user by verify token
export const getUserByVerifyToken = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_verify_token", (q) => q.eq("verifyToken", args.token))
      .first();
  },
});

// Mutation to update verification token
export const updateVerificationToken = mutation({
  args: {
    userId: v.id("users"),
    verifyToken: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, {
      verifyToken: args.verifyToken,
    });

    return { success: true };
  },
});
