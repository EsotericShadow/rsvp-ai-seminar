-- CreateTable
CREATE TABLE "global_template_settings" (
    "id" TEXT NOT NULL,
    "global_hero_title" TEXT NOT NULL DEFAULT 'Welcome to Evergreen AI',
    "global_hero_message" TEXT NOT NULL DEFAULT 'Thank you for your interest in our upcoming informational session about practical AI tools for Northern BC businesses.',
    "global_signature_name" TEXT NOT NULL DEFAULT 'Gabriel Lacroix',
    "global_signature_title" TEXT NOT NULL DEFAULT 'AI Solutions Specialist',
    "global_signature_company" TEXT NOT NULL DEFAULT 'Evergreen Web Solutions',
    "global_signature_location" TEXT NOT NULL DEFAULT 'Terrace, BC',
    "global_event_title" TEXT NOT NULL DEFAULT 'Event Details',
    "global_event_date" TEXT NOT NULL DEFAULT 'October 23rd, 2025',
    "global_event_time" TEXT NOT NULL DEFAULT '6:00 PM - 8:00 PM',
    "global_event_location" TEXT NOT NULL DEFAULT 'Terrace, BC',
    "global_event_cost" TEXT NOT NULL DEFAULT 'Free',
    "global_event_includes" TEXT NOT NULL DEFAULT 'Coffee, refreshments, networking, and actionable AI insights',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "global_template_settings_pkey" PRIMARY KEY ("id")
);
