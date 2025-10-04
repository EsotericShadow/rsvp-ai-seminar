import { z } from 'zod';

// Sanitization helpers
export function sanitizeHtml(html: string): string {
  // Basic HTML sanitization - in production, use a library like DOMPurify
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .trim();
}

export function sanitizeText(text: string): string {
  return text
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '')
    .trim();
}

export function sanitizeUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    // Only allow http and https protocols
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      throw new Error('Invalid protocol');
    }
    return urlObj.toString();
  } catch {
    // If URL is invalid, return empty string
    return '';
  }
}

// Base validation schemas
export const sanitizedStringSchema = z.string()
  .transform(sanitizeText)
  .refine(val => val.length > 0, 'This field is required');

export const sanitizedHtmlSchema = z.string()
  .transform(sanitizeHtml)
  .refine(val => val.length > 0, 'This field is required');

// Helper functions for creating max-length schemas
export function createMaxLengthString(maxLength: number, message?: string) {
  return z.string()
    .max(maxLength, message || `Maximum length is ${maxLength} characters`)
    .transform(sanitizeText);
}

export function createMaxLengthHtml(maxLength: number, message?: string) {
  return z.string()
    .max(maxLength, message || `Maximum length is ${maxLength} characters`)
    .transform(sanitizeHtml);
}

export const urlSchema = z.string()
  .transform(sanitizeUrl)
  .refine(val => val.length > 0, 'Valid URL is required');

export const emailSchema = z.string()
  .email('Invalid email address')
  .transform(email => email.toLowerCase().trim());

export const phoneSchema = z.string()
  .regex(/^[\+]?[1-9][\d]{0,15}$/, 'Invalid phone number format')
  .transform(phone => phone.replace(/\s+/g, ''));

// Template validation schemas
export const templateVariableSchema = z.object({
  greeting_title: z.string().max(100, 'Title too long').optional(),
  greeting_message: z.string().max(500, 'Message too long').optional(),
  signature_name: z.string().max(100, 'Name too long').optional(),
  signature_title: z.string().max(100, 'Title too long').optional(),
  signature_company: z.string().max(100, 'Company name too long').optional(),
  signature_location: z.string().max(100, 'Location too long').optional(),
  main_content_title: z.string().max(100, 'Title too long').optional(),
  main_content_body: z.string().max(5000, 'Content too long').optional(),
  button_text: z.string().max(50, 'Button text too long').optional(),
  button_link: urlSchema.optional(),
  additional_info_title: z.string().max(100, 'Title too long').optional(),
  additional_info_body: z.string().max(2000, 'Content too long').optional(),
  closing_title: z.string().max(100, 'Title too long').optional(),
  closing_message: z.string().max(1000, 'Message too long').optional(),
});

export const campaignTemplateSchema = z.object({
  name: createMaxLengthString(100, 'Template name too long'),
  subject: createMaxLengthString(200, 'Subject line too long'),
  htmlBody: createMaxLengthHtml(10000, 'HTML content too long'),
  textBody: z.string().max(5000, 'Text content too long').optional(),
}).merge(templateVariableSchema);

export const globalTemplateSettingsSchema = z.object({
  global_hero_title: z.string().max(100, 'Title too long').optional(),
  global_hero_message: z.string().max(500, 'Message too long').optional(),
  global_signature_name: z.string().max(100, 'Name too long').optional(),
  global_signature_title: z.string().max(100, 'Title too long').optional(),
  global_signature_company: z.string().max(100, 'Company name too long').optional(),
  global_signature_location: z.string().max(100, 'Location too long').optional(),
  global_event_title: z.string().max(100, 'Event title too long').optional(),
  global_event_date: z.string().max(50, 'Date too long').optional(),
  global_event_time: z.string().max(50, 'Time too long').optional(),
  global_event_location: z.string().max(200, 'Location too long').optional(),
  global_event_cost: z.string().max(50, 'Cost too long').optional(),
  global_event_includes: z.string().max(500, 'Includes too long').optional(),
});

// RSVP validation schemas
export const rsvpFormSchema = z.object({
  firstName: createMaxLengthString(50, 'First name too long'),
  lastName: createMaxLengthString(50, 'Last name too long'),
  email: emailSchema,
  phone: phoneSchema.optional(),
  attendanceStatus: z.enum(['YES', 'NO', 'MAYBE'], {
    errorMap: () => ({ message: 'Please select an attendance status' })
  }),
  attendeeCount: z.number().int().min(1).max(10).optional(),
  dietaryPreference: z.enum(['None', 'Vegetarian', 'Vegan', 'Gluten-Free', 'Other']).optional(),
  dietaryOther: z.string().max(200, 'Dietary note too long').optional(),
  accessibilityNeeds: z.string().max(500, 'Accessibility note too long').optional(),
  referralSource: z.enum(['Website', 'Social Media', 'Email', 'Friend', 'Radio Ad', 'Facebook Event', 'Other']).optional(),
  referralOther: z.string().max(200, 'Referral note too long').optional(),
  wantsResources: z.boolean().optional(),
  wantsAudit: z.boolean().optional(),
  learningGoal: z.string().max(1000, 'Learning goal too long').optional(),
  organization: z.string().max(200, 'Organization name too long').optional(),
});

// Analytics validation schema
export const analyticsSchema = z.object({
  language: z.string().max(10).optional(),
  languages: z.array(z.string()).optional(),
  tz: z.string().max(50).optional(),
  screenW: z.number().int().min(1).max(10000).optional(),
  screenH: z.number().int().min(1).max(10000).optional(),
  viewportW: z.number().int().min(1).max(10000).optional(),
  viewportH: z.number().int().min(1).max(10000).optional(),
  orientation: z.string().max(20).optional(),
  dpr: z.number().min(0.1).max(10).optional(),
  deviceMemory: z.number().int().min(1).max(100).optional(),
  hardwareConcurrency: z.number().int().min(1).max(100).optional(),
  maxTouchPoints: z.number().int().min(0).max(10).optional(),
  connection: z.union([z.record(z.any()), z.string(), z.number()]).optional(),
  storage: z.union([z.record(z.any()), z.string(), z.number()]).optional(),
  navigation: z.union([z.record(z.any()), z.string(), z.number()]).optional(),
  paint: z.union([z.record(z.any()), z.string(), z.number()]).optional(),
  performance: z.union([z.record(z.any()), z.string(), z.number()]).optional(),
  scrollDepth: z.number().min(0).max(100).optional(),
  timeOnPageMs: z.number().int().min(0).optional(),
  interactionCounts: z.record(z.number()).optional(),
  visibility: z.array(z.record(z.any())).optional(),
  engagementScore: z.number().min(0).max(100).optional(),
  pageViews: z.number().int().min(1).optional(),
  sessionDuration: z.number().int().min(0).optional(),
  bounceRate: z.number().min(0).max(100).optional(),
});

// Combined RSVP schema
export const rsvpSchema = rsvpFormSchema.merge(analyticsSchema);

// Campaign validation schemas
export const campaignSchema = z.object({
  name: createMaxLengthString(100, 'Campaign name too long'),
  description: z.string().max(500, 'Description too long').optional(),
  status: z.enum(['DRAFT', 'ACTIVE', 'PAUSED', 'COMPLETED']),
  targetAudience: z.number().int().min(1).max(100000),
  emailLimit: z.number().int().min(1).max(1000).optional(),
  throttleHours: z.number().int().min(1).max(168).optional(),
});

export const campaignScheduleSchema = z.object({
  campaignId: z.string().min(1, 'Campaign ID required'),
  templateId: z.string().min(1, 'Template ID required'),
  scheduledAt: z.string().datetime('Invalid date format'),
  status: z.enum(['PENDING', 'SENDING', 'COMPLETED', 'FAILED']),
  variant: z.enum(['A', 'B', 'C', 'D']).optional(),
  percentage: z.number().min(0).max(100).optional(),
});

// Business validation schemas
export const businessSchema = z.object({
  name: createMaxLengthString(200, 'Business name too long'),
  email: emailSchema.optional(),
  phone: phoneSchema.optional(),
  website: urlSchema.optional(),
  industry: z.string().max(100, 'Industry too long').optional(),
  location: z.string().max(200, 'Location too long').optional(),
  tags: z.array(z.string().max(50)).optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED']).optional(),
});

// Validation helper functions
export function validateTemplate(data: unknown) {
  try {
    return {
      success: true,
      data: campaignTemplateSchema.parse(data),
      error: null,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        data: null,
        error: error.flatten().fieldErrors,
      };
    }
    return {
      success: false,
      data: null,
      error: { general: ['Validation failed'] },
    };
  }
}

export function validateRSVP(data: unknown) {
  try {
    return {
      success: true,
      data: rsvpSchema.parse(data),
      error: null,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        data: null,
        error: error.flatten().fieldErrors,
      };
    }
    return {
      success: false,
      data: null,
      error: { general: ['Validation failed'] },
    };
  }
}

export function validateGlobalTemplateSettings(data: unknown) {
  try {
    return {
      success: true,
      data: globalTemplateSettingsSchema.parse(data),
      error: null,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        data: null,
        error: error.flatten().fieldErrors,
      };
    }
    return {
      success: false,
      data: null,
      error: { general: ['Validation failed'] },
    };
  }
}

// Type exports
export type CampaignTemplateData = z.infer<typeof campaignTemplateSchema>;
export type RSVPData = z.infer<typeof rsvpSchema>;
export type GlobalTemplateSettingsData = z.infer<typeof globalTemplateSettingsSchema>;
export type CampaignData = z.infer<typeof campaignSchema>;
export type BusinessData = z.infer<typeof businessSchema>;
