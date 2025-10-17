// src/lib/validators.ts
import { z } from "zod";

export const phoneRegex = /^\d{3}-\d{3}-\d{4}$/;

// Input sanitization function to prevent XSS
function sanitizeString(input: string): string {
  return input
    .replace(/[<>\"'&]/g, (match) => {
      const escapeMap: Record<string, string> = {
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        '&': '&amp;'
      };
      return escapeMap[match];
    })
    .trim()
    .slice(0, 255); // Limit length to prevent buffer overflow
}

// Custom string validation with sanitization
const sanitizedString = (minLength?: number) => {
  if (minLength !== undefined) {
    return z.string()
      .min(minLength, `Minimum length is ${minLength} characters`)
      .transform(sanitizeString);
  }
  return z.string().transform(sanitizeString);
};

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
  
  // Performance metrics - can be objects or primitives
  connection: z.union([z.record(z.any()), z.string(), z.number()]).optional(),
  storage: z.union([z.record(z.any()), z.number()]).optional(),
  navigation: z.union([z.record(z.any()), z.number()]).optional(),
  paint: z.union([z.record(z.any()), z.number()]).optional(),
  performance: z.union([z.record(z.any()), z.number()]).optional(),
  
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
  firstName: sanitizedString(1),
  lastName: sanitizedString(1),
  organization: sanitizedString().optional(),
  email: z.string().email("Enter a valid email").transform((email) => email.toLowerCase().trim()),
  phone: z.string()
    .min(1, "Phone number is required")
    .refine((val) => {
      // Allow partial input for form validation (during step progression)
      // Must be in format: NNN-NNN-NNNN or partial like "250-" or "250-635-"
      const digitsOnly = val.replace(/\D/g, '');
      // Accept if less than 10 digits (partial) or exactly 10 digits (complete)
      return (digitsOnly.length <= 10 && val.match(/^\d{1,3}(-\d{0,3}(-\d{0,4})?)?$/)) || phoneRegex.test(val);
    }, "Enter phone number in format: 250-635-1234"),

  attendanceStatus: z.enum(["YES", "NO", "MAYBE"]),
  attendeeCount: z.number().int().min(1).max(20).optional(),

  dietaryPreference: z.enum(["NONE", "VEGETARIAN", "VEGAN", "GLUTEN_FREE", "DAIRY_FREE", "NUT_ALLERGY", "OTHER"]),
  dietaryOther: sanitizedString().optional(),
  accessibilityNeeds: sanitizedString().optional(),

  referralSource: z.enum(["RADIO", "RADIO_AD", "CHAMBER", "FACEBOOK", "FACEBOOK_EVENT", "LINKEDIN", "WORD_OF_MOUTH", "SOCIAL_MEDIA", "EMAIL", "WEBSITE", "BUSINESS_NETWORK", "TERRACE_STANDARD", "OTHER"]),
  referralOther: sanitizedString().optional(),

  wantsResources: z.boolean().default(false),
  wantsAudit: z.boolean().default(false),
  learningGoal: sanitizedString().optional(),
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
  // Require complete phone number for backend submission
  if (!phoneRegex.test(val.phone)) {
    ctx.addIssue({ code: "custom", message: "Complete phone number required (format: 250-635-1234)", path: ["phone"] });
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
