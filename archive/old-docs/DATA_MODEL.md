# Data Model & Tracking Overview

This document provides a comprehensive overview of the data models used in this application, explaining what data is tracked and how the different models are interconnected.

## Core Concepts

The application is designed to manage RSVP's for events and to run email campaigns to a target audience. The core concepts are:

-   **Audience**: A collection of businesses or individuals that we want to reach out to.
-   **Campaigns**: Email campaigns that are sent to the audience.
-   **RSVPs**: RSVPs to events.
-   **Visits**: Website visits and user interactions.

## External Services

### LeadMine

The application is integrated with an external service called "LeadMine". This service is the primary source for business and lead information. The `AudienceMember` table in the local database is synchronized with this service, especially for retrieving `inviteToken`s. When a campaign is being sent, if an `AudienceMember` does not have an `inviteToken`, the application will fetch it from LeadMine.

## Data Models

Here is a detailed breakdown of each data model and its fields.

### 1. `AudienceMember`

This is the central model representing a business or individual in your audience. It is a synchronized subset of the data in the LeadMine service.

-   `id`: Unique identifier.
-   `groupId`: The ID of the `AudienceGroup` it belongs to.
-   `businessId`: A specific ID for the business.
-   `businessName`: The name of the business.
-   `primaryEmail`: The primary email address for the business.
-   `secondaryEmail`: An optional secondary email.
-   `tagsSnapshot`: A list of tags associated with the business at a point in time.
-   `inviteToken`: A token for invitations, synchronized from LeadMine.
-   `meta`: A flexible field for storing any other data in JSON format.
-   `unsubscribed`: A boolean indicating if they have unsubscribed from communications.
-   `createdAt`: The timestamp when the record was created.

**Relations:**
- Belongs to one `AudienceGroup`.

### 2. `AudienceGroup`

A group of `AudienceMember` records.

-   `id`: Unique identifier.
-   `name`: Name of the group.
-   `description`: Description of the group.
-   `criteria`: JSON field to store criteria for dynamic groups.
-   `createdAt`: The timestamp when the record was created.
-   `updatedAt`: The timestamp when the record was last updated.

**Relations:**
- Has many `AudienceMember` records.
- Can be associated with many `CampaignSchedule` records.

### 3. `Campaign`, `CampaignTemplate`, and `CampaignSettings`

-   `Campaign`: Represents a marketing campaign.
    -   `id`, `name`, `description`, `status`, `createdAt`, `updatedAt`
-   `CampaignTemplate`: The content of the email.
    -   `id`, `name`, `subject`, `htmlBody`, `textBody`, `createdAt`, `updatedAt`
-   `CampaignSettings`: Stores rules for sending emails, such as time windows, throttling, and quiet hours. This is configured via the "Smart Window" editor in the campaign dashboard.
    -   `campaignId`, `windows`, `throttlePerMinute`, `maxConcurrent`, `perDomain`, `quietHours`, `updatedAt`, `paused`

### 4. `CampaignSchedule`

This model connects a `Campaign` and `CampaignTemplate` to an `AudienceGroup` and defines when the campaign should be sent.

-   `id`, `name`, `templateId`, `groupId`, `campaignId`, `status`, `sendAt`, `timeZone`, `throttlePerMinute`, `repeatIntervalMins`, `lastRunAt`, `nextRunAt`, `stepOrder`, `smartWindowStart`, `smartWindowEnd`, `createdAt`, `updatedAt`

**Relations:**
- Belongs to one `CampaignTemplate`.
- Belongs to one `AudienceGroup`.
- Belongs to one `Campaign`.
- Has many `CampaignSend` records.

### 5. `CampaignSend`

This model tracks the status of each individual email sent as part of a campaign. This is where the direct link between a campaign and a business is made.

-   `id`: Unique identifier.
-   `scheduleId`: The ID of the `CampaignSchedule`.
-   `groupId`: The ID of the `AudienceGroup`.
-   `templateId`: The ID of the `CampaignTemplate`.
-   `businessId`: The ID of the `AudienceMember` (the business).
-   `businessName`: The name of the business.
-   `email`: The email address the campaign was sent to.
-   `inviteToken`: The invitation token.
-   `inviteLink`: The invitation link.
-   `resendMessageId`: The ID of the message from the email provider.
-   `status`: The delivery status of the email (`PENDING`, `SENDING`, `SENT`, `FAILED`, `SKIPPED`).
-   `error`: Any error message if the email failed to send.
-   `meta`: Stores the rendered HTML and text of the email that was sent.
-   `sentAt`: When the email was sent.
-   `openedAt`: When the recipient opened the email.
-   `visitedAt`: When the recipient clicked a link in the email and visited your website.
-   `rsvpAt`: When the recipient submitted an RSVP after clicking through from the campaign.
-   `createdAt`: The timestamp when the record was created.
-   `updatedAt`: The timestamp when the record was last updated.

**Relations:**
- Belongs to one `CampaignSchedule`.

### 6. `EmailJob` and `EmailEvent`

These models are used for the internal processing of email campaigns.

-   `EmailJob`: Represents a single email to be sent as part of a campaign. The campaign dashboard's analytics (throughput, ETA) are based on this model.
    -   `id`, `campaignId`, `recipientEmail`, `recipientId`, `sendAt`, `status`, `attempts`, `error`, `processingStartedAt`, `sentAt`, `providerMessageId`, `createdAt`, `updatedAt`
-   `EmailEvent`: Logs events related to an `EmailJob`, such as send attempts, failures, and bounces.
    -   `id`, `jobId`, `type`, `meta`, `createdAt`
    -   **Event Types**: `send_attempt`, `sent`, `failed`, `bounce`, `complaint`, `opened`, `clicked`, `paused`, `resumed`, `schedule_updated`

### 7. `Visit`

This model captures detailed analytics for every visit to your website. The data is collected by the `AnalyticsBeacon.tsx` component on the client-side and sent to the `/api/track/visit` endpoint.

**Identification**
- `visitorId`: A unique ID for the visitor, stored in a long-lived cookie (`vid`).
- `sessionId`: A unique ID for the session, stored in a session cookie (`sid`).

**Page**
- `path`: The path of the visited page (`window.location.pathname`).
- `query`: The query string of the visited page (`window.location.search`).
- `referrer`: The referrer URL (`document.referrer`).

**Marketing**
- `eid`: The engagement ID from the URL or cookie.
- `utmSource`, `utmMedium`, `utmCampaign`, `utmTerm`, `utmContent`: UTM parameters from the URL or cookies.
- `gclid`, `fbclid`, `msclkid`: Ad click IDs from the URL or cookies.

**Client & Device**
- `userAgent`: The user agent string (`navigator.userAgent`).
- `language`: The user's preferred language (`navigator.language`).
- `languages`: A list of the user's preferred languages (`navigator.languages`).
- `tz`: The user's timezone (`Intl.DateTimeFormat().resolvedOptions().timeZone`).
- `screenW`, `screenH`: The screen width and height (`window.screen.width`, `window.screen.height`).
- `viewportW`, `viewportH`: The viewport width and height (`window.innerWidth`, `window.innerHeight`).
- `orientation`: The screen orientation (`window.screen.orientation.type`).
- `dpr`: The device pixel ratio (`window.devicePixelRatio`).
- `platform`: The operating system (`navigator.platform` or `navigator.userAgentData.platform`).
- `device`: The device type (e.g., 'desktop', 'mobile'), parsed from the user agent.
- `browser`: The browser name, parsed from the user agent.
- `deviceMemory`: The device's memory in gigabytes (`navigator.deviceMemory`).
- `hardwareConcurrency`: The number of logical processor cores (`navigator.hardwareConcurrency`).
- `maxTouchPoints`: The maximum number of touch points supported by the device (`navigator.maxTouchPoints`).

**Connection & Performance**
- `connection`: Information about the user's network connection (`navigator.connection`), including `downlink`, `effectiveType`, `rtt`, and `saveData`.
- `storage`: Information about the browser's storage capacity (`navigator.storage.estimate()`), including `quota` and `usage`.
- `navigation`: Detailed performance timings for the page load from the Navigation Timing API.
- `paint`: Timings for `first-paint` and `first-contentful-paint` from the Paint Timing API.
- `performance`: Other performance metrics like `timeOrigin` and `now` from the Performance API.
- `scrollDepth`: The maximum percentage of the page that the user has scrolled.
- `timeOnPageMs`: The time the user has spent on the page, in milliseconds.

**User Interaction**
- `interactionCounts`: A count of user interactions, including `clicks`, `keypresses`, `copies`, and `pointerMoves`.
- `visibility`: A timeline of the page's visibility state (e.g., `visible`, `hidden`).

**Geolocation**
- `country`, `region`, `city`: The user's approximate location, derived from their IP address by Vercel.
- `ipHash`: A SHA256 hash of the user's IP address.

### 8. `RSVP`

This model stores the information submitted through the RSVP form. It can be linked to a `Visit` record.

-   `id`, `fullName`, `organization`, `email`, `phone`, `attendanceStatus`, `attendeeCount`, `dietaryPreference`, `dietaryOther`, `accessibilityNeeds`, `referralSource`, `referralOther`, `wantsResources`, `wantsAudit`, `learningGoal`, `createdAt`
-   **Analytics Enrichments**: `visitorId`, `sessionId`, `referrer`, `eid`, `utmSource`, `utmMedium`, `utmCampaign`, `utmTerm`, `utmContent`, `userAgent`, `language`, `tz`, `country`, `region`, `city`, `ipHash`, `screenW`, `screenH`, `dpr`, `platform`, `device`, `browser`, `meta` (stores the local submission time).

## Database Indexes and Constraints

The integrity and performance of the data model rely on several key unique constraints and indexes:

-   **`AudienceMember`**: Unique on (`groupId`, `businessId`) to prevent duplicate members in the same group.
-   **`CampaignSend`**: Unique on (`scheduleId`, `businessId`) to ensure a business receives a campaign from a specific schedule only once.
-   **`RSVP`**: Unique on `email` to prevent duplicate RSVPs from the same email address.
-   **Indexes**: Various fields like `status`, `nextRunAt`, `visitorId`, and `sessionId` are indexed to ensure efficient querying for campaign processing and analytics.

## How It’s All Interconnected

Here’s how you can trace the journey of a business through the system:

1.  **Audience Creation**: You start by creating an `AudienceMember` record for a business. This business is added to an `AudienceGroup`. The business data, including the `inviteToken`, is synchronized from the external "LeadMine" service.

2.  **Campaigning**:
    -   You create a `Campaign`, a `CampaignTemplate`, and configure `CampaignSettings` (like "Smart Windows").
    -   When a `CampaignSchedule` is activated, the system expands the target `AudienceGroup` into individual `CampaignSend` records, one for each member (excluding those who have unsubscribed).
    -   These `CampaignSend` records are then used to create `EmailJob` records, which are placed in a queue for processing by the email sending service.

3.  **Website Visit**:
    -   If the business clicks a link in the email, they are taken to your website. A `Visit` record is created, capturing a wide range of analytics data about their session. The `CampaignSend` record is updated with the `visitedAt` timestamp.

4.  **RSVP Submission**:
    -   If the business submits an RSVP, an `RSVP` record is created.
    -   This `RSVP` record is enriched with analytics data from the `Visit` record, including the `visitorId` and `sessionId`. This allows you to connect the RSVP to the entire visit history.
    -   The `CampaignSend` record is updated with the `rsvpAt` timestamp.

**Lifecycle Example:**
> *AudienceMember is added → included in a CampaignSchedule → expanded to CampaignSend → queued as EmailJob → logged in EmailEvent → click generates Visit → RSVP links back to Visit and CampaignSend.*

## Unsubscribe Flow

A user can unsubscribe from communications by clicking an unsubscribe link in an email. Here’s how the process works:

1.  The user is directed to the `/unsubscribe` page with their email address in the URL parameters.
2.  The page sends a request to the `/api/unsubscribe` endpoint.
3.  The API finds the corresponding `AudienceMember` by their email address and sets the `unsubscribed` flag to `true`.
4.  To protect privacy, the API returns a success message even if the email is not found, preventing anyone from using the feature to check for the existence of an email in the database.

The `unsubscribed` flag is enforced at two key points:
-   **Schedule Expansion**: When a campaign schedule is being processed, unsubscribed members are filtered out, and no `CampaignSend` record is created for them.
-   **Pre-send Check**: As an additional safeguard, the email sending queue performs a final check and will not send an email to anyone who has unsubscribed.
