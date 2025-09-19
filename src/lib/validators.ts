// src/lib/validators.ts
import { z } from "zod";

export const phoneRegex = /^\d{3}-\d{3}-\d{4}$/;

export const rsvpSchema = z.object({
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
}).superRefine((val, ctx) => {
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
