// src/lib/validators.ts
import { z } from "zod";

export const phoneRegex = /^\d{3}-\d{3}-\d{4}$/;

// Analytics schema for comprehensive tracking data
const analyticsSchema = z.object({
  // Basic device info
  language: z.string().optional(),
  languages: z.array(z.string()).optional(),
  tz: z.string().optional(),
  screenW: z.number().optional(),
  screenH: z.number().optional(),
  viewportW: z.number().optional(),
  viewportH: z.number().optional(),
  orientation: z.string().optional(),
  dpr: z.number().optional(),
  deviceMemory: z.number().optional(),
  hardwareConcurrency: z.number().optional(),
  maxTouchPoints: z.number().optional(),
  
  // Performance metrics
  connection: z.record(z.any()).optional(),
  storage: z.record(z.any()).optional(),
  navigation: z.record(z.any()).optional(),
  paint: z.record(z.any()).optional(),
  performance: z.record(z.any()).optional(),
  
  // Engagement metrics
  scrollDepth: z.number().optional(),
  timeOnPageMs: z.number().optional(),
  interactionCounts: z.record(z.number()).optional(),
  visibility: z.array(z.record(z.any())).optional(),
  engagementScore: z.number().optional(),
  pageViews: z.number().optional(),
  sessionDuration: z.number().optional(),
  bounceRate: z.number().optional(),
});

// Core RSVP form schema
const coreRsvpSchema = z.object({
  firstName: z.string().min(1, "Please enter your first name"),
  lastName: z.string().min(1, "Please enter your last name"),
  organization: z.string().optional(),
  email: z.string().email("Enter a valid email"),
  phone: z.string().regex(phoneRegex, "Use 000-000-0000"),

  attendanceStatus: z.enum(["YES", "NO", "MAYBE"]),
  attendeeCount: z.number().int().min(1).max(20).optional(),

  dietaryPreference: z.enum(["NONE", "VEGETARIAN", "VEGAN", "GLUTEN_FREE", "OTHER"]),
  dietaryOther: z.string().optional(),
  accessibilityNeeds: z.string().optional(),

  referralSource: z.enum(["RADIO", "CHAMBER", "FACEBOOK", "LINKEDIN", "WORD_OF_MOUTH", "OTHER"]),
  referralOther: z.string().optional(),

  wantsResources: z.boolean().default(false),
  wantsAudit: z.boolean().default(false),
  learningGoal: z.string().optional(),
});

// Combined schema that includes analytics
export const rsvpSchema = coreRsvpSchema.merge(analyticsSchema).superRefine((val, ctx) => {
  if (val.attendanceStatus === "YES" && (!val.attendeeCount || val.attendeeCount < 1)) {
    ctx.addIssue({ code: "custom", message: "Add attendee count", path: ["attendeeCount"] });
  }
  if (val.dietaryPreference === "OTHER" && !val.dietaryOther?.trim()) {
    ctx.addIssue({ code: "custom", message: "Describe your preference", path: ["dietaryOther"] });
  }
  if (val.referralSource === "OTHER" && !val.referralOther?.trim()) {
    ctx.addIssue({ code: "custom", message: "Tell us where you heard about us", path: ["referralOther"] });
  }
});

// Export core schema for form validation (without analytics)
export const coreRsvpFormSchema = coreRsvpSchema.superRefine((val, ctx) => {
  if (val.attendanceStatus === "YES" && (!val.attendeeCount || val.attendeeCount < 1)) {
    ctx.addIssue({ code: "custom", message: "Add attendee count", path: ["attendeeCount"] });
  }
  if (val.dietaryPreference === "OTHER" && !val.dietaryOther?.trim()) {
    ctx.addIssue({ code: "custom", message: "Describe your preference", path: ["dietaryOther"] });
  }
  if (val.referralSource === "OTHER" && !val.referralOther?.trim()) {
    ctx.addIssue({ code: "custom", message: "Tell us where you heard about us", path: ["referralOther"] });
  }
});

export type RsvpFormValues = z.infer<typeof rsvpSchema>;
