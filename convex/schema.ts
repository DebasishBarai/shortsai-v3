import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// Define enums as union types

const contentType = v.union(
  v.literal("customPrompt"),
  v.literal("randomAiStory"),
  v.literal("scaryStay"),
  v.literal("historicalFacts"),
  v.literal("bedTimeStory"),
  v.literal("motivational"),
  v.literal("funFacts")
);

const videoStyle = v.union(
  v.literal("realistic"),
  v.literal("cartoon"),
  v.literal("watercolor"),
  v.literal("sketch")
);

const videoDuration = v.union(
  v.literal("15 sec"),
  v.literal("30 sec"),
  v.literal("60 sec")
);

const voiceType = v.union(
  v.literal("Joanna"),
  v.literal("Salli"),
  v.literal("Kimberly"),
  v.literal("Kendra"),
  v.literal("Ivy"),
  v.literal("Matthew"),
  v.literal("Justin"),
  v.literal("Joey")
);

const aspectRatio = v.union(
  v.literal("9:16"),
  v.literal("16:9"),
  v.literal("4:3"),
  v.literal("3:4"),
  v.literal("1:1")
);

export default defineSchema({
  users: defineTable({
    name: v.optional(v.string()),
    email: v.string(),
    emailVerified: v.boolean(),
    image: v.optional(v.string()),
    // Custom fields from your Prisma schema
    hashedPassword: v.optional(v.string()),
    isVerified: v.boolean(),
    verifyToken: v.optional(v.string()),
    credits: v.number(),
    polarCustomerId: v.optional(v.string()),
  })
    .index("by_email", ["email"])
    .index("by_verify_token", ["verifyToken"])
    .index("by_polar_customer_id", ["polarCustomerId"]),

  accounts: defineTable({
    accountId: v.string(),
    userId: v.id("users"),
    providerId: v.string(),
    accessToken: v.optional(v.string()),
    refreshToken: v.optional(v.string()),
    idToken: v.optional(v.string()),
    accessTokenExpiresAt: v.optional(v.number()), // Convex uses timestamps as numbers
    refreshTokenExpiresAt: v.optional(v.number()),
    scope: v.optional(v.string()),
    password: v.optional(v.string()),
  })
    .index("by_user", ["userId"])
    .index("by_provider_account", ["providerId", "accountId"]),

  sessions: defineTable({
    userId: v.id("users"),
    token: v.string(),
    expiresAt: v.number(), // Timestamp as number
    ipAddress: v.optional(v.string()),
    userAgent: v.optional(v.string()),
  })
    .index("by_user", ["userId"])
    .index("by_token", ["token"]),

  verifications: defineTable({
    identifier: v.string(),
    value: v.string(),
    expiresAt: v.number(), // Timestamp as number
  })
    .index("by_identifier_value", ["identifier", "value"]),

  videos: defineTable({
    url: v.optional(v.string()),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    userId: v.id("users"),
    contentType: v.optional(contentType),
    prompt: v.optional(v.string()),
    style: v.optional(videoStyle),
    voiceType: v.optional(voiceType),
    aspectRatio: v.optional(aspectRatio),
    duration: v.optional(videoDuration),
    frames: v.optional(v.any()), // JSON equivalent
    audioUrl: v.optional(v.string()),
    imagesUrl: v.array(v.string()),
    videoSnippetsUrl: v.optional(v.any()), // JSON equivalent
    script: v.optional(v.string()),
    caption: v.optional(v.any()), // JSON equivalent
    error: v.boolean(),
    completed: v.boolean(),
    renderId: v.optional(v.string()),
    bucketName: v.optional(v.string()),
  })
    .index("by_user", ["userId"])
    .index("by_completed", ["completed"])
    .index("by_error", ["error"])
    .index("by_render_id", ["renderId"]),
});

// Export types for use in your application
export type ContentType = "customPrompt" | "randomAiStory" | "scaryStay" | "historicalFacts" | "bedTimeStory" | "motivational" | "funFacts";
export type VideoStyle = "realistic" | "cartoon" | "watercolor" | "sketch";
export type VideoDuration = "15 sec" | "30 sec" | "60 sec";
export type VoiceType = "Joanna" | "Salli" | "Kimberly" | "Kendra" | "Ivy" | "Matthew" | "Justin" | "Joey";
export type AspectRatio = "9:16" | "16:9" | "4:3" | "3:4" | "1:1";
