# Database Schema Documentation

This document outlines the database schema as defined in `prisma/schema.prisma`.

**Scope Disclaimer:** This documentation is generated based on the `prisma/schema.prisma` file within the current `rsvp-app` project. It reflects the database schema as understood by this application.

**Regarding "Shared" Schemas:** Without access to the schemas and data models of "Lead Mine" and "Evergreen Portfolio" projects, and an understanding of their direct database interactions with this `rsvp-app` project, it is not possible to accurately categorize parts of this schema as "shared" or to document external database parameters. This document focuses solely on the `rsvp-app`'s internal database definitions.

## Datasource

- **Provider**: `postgresql`
- **URL**: `env("DATABASE_URL")`

## Models

### RSVP

| Field                | Type      | Attributes                               |
| :------------------- | :-------- | :--------------------------------------- |
| `id`                 | `String`  | `@id @default(cuid())`                   |
| `fullName`           | `String`  |                                          |
| `organization`       | `String?` |                                          |
| `email`              | `String`  | `@unique`                                |
| `phone`              | `String?` |                                          |
| `attendanceStatus`   | `String`  |                                          |
| `attendeeCount`      | `Int`     |                                          |
| `dietaryPreference`  | `String`  |                                          |
| `dietaryOther`       | `String?` |                                          |
| `accessibilityNeeds` | `String?` |                                          |
| `referralSource`     | `String`  |                                          |
| `referralOther`      | `String?` |                                          |
| `wantsResources`     | `Boolean` | `@default(false)`                        |
| `wantsAudit`         | `Boolean` | `@default(false)`                        |
| `learningGoal`       | `String?` |                                          |
| `createdAt`          | `DateTime`| `@default(now())`                        |
| `visitorId`          | `String?` |                                          |
| `sessionId`          | `String?` |                                          |
| `referrer`           | `String?` |                                          |
| `eid`                | `String?` |                                          |
| `utmSource`          | `String?` |                                          |
| `utmMedium`          | `String?` |                                          |
| `utmCampaign`        | `String?` |                                          |
| `utmTerm`            | `String?` |                                          |
| `utmContent`         | `String?` |                                          |
| `userAgent`          | `String?` |                                          |
| `language`           | `String?` |                                          |
| `tz`                 | `String?` |                                          |
| `country`            | `String?` |                                          |
| `region`             | `String?` |                                          |
| `city`               | `String?` |                                          |
| `ipHash`             | `String?` |                                          |
| `screenW`            | `Int?`    |                                          |
| `screenH`            | `Int?`    |                                          |
| `dpr`                | `Float?`  |                                          |
| `platform`           | `String?` |                                          |
| `device`             | `String?` |                                          |
| `browser`            | `String?` |                                          |
| `meta`               | `String?` |                                          |

**Note:** The `RSVP` model corresponds to the `rsvpSchema` defined in `src/lib/validators.ts`, which is used for input validation.

### Visit

| Field                 | Type      | Attributes                               |
| :-------------------- | :-------- | :--------------------------------------- |
| `id`                  | `String`  | `@id @default(cuid())`                   |
| `createdAt`           | `DateTime`| `@default(now())`                        |
| `visitorId`           | `String`  |                                          |
| `sessionId`           | `String`  |                                          |
| `path`                | `String`  |                                          |
| `query`               | `String?` |                                          |
| `referrer`            | `String?` |                                          |
| `eid`                 | `String?` |                                          |
| `utmSource`           | `String?` |                                          |
| `utmMedium`           | `String?` |                                          |
| `utmCampaign`         | `String?` |                                          |
| `utmTerm`             | `String?` |                                          |
| `utmContent`          | `String?` |                                          |
| `gclid`               | `String?` |                                          |
| `fbclid`              | `String?` |                                          |
| `msclkid`             | `String?` |                                          |
| `userAgent`           | `String?` |                                          |
| `language`            | `String?` |                                          |
| `languages`           | `Json?`   |                                          |
| `tz`                  | `String?` |                                          |
| `screenW`             | `Int?`    |                                          |
| `screenH`             | `Int?`    |                                          |
| `dpr`                 | `Float?`  |                                          |
| `platform`            | `String?` |                                          |
| `device`              | `String?` |                                          |
| `browser`             | `String?` |                                          |
| `viewportW`           | `Int?`    |                                          |
| `viewportH`           | `Int?`    |                                          |
| `orientation`         | `String?` |                                          |
| `deviceMemory`        | `Float?`  |                                          |
| `hardwareConcurrency` | `Int?`    |                                          |
| `maxTouchPoints`      | `Int?`    |                                          |
| `connection`          | `Json?`   |                                          |
| `storage`             | `Json?`   |                                          |
| `navigation`          | `Json?`   |                                          |
| `paint`               | `Json?`   |                                          |
| `performance`         | `Json?`   |                                          |
| `scrollDepth`         | `Int?`    |                                          |
| `timeOnPageMs`        | `Int?`    |                                          |
| `interactionCounts`   | `Json?`   |                                          |
| `visibility`          | `Json?`   |                                          |
| `country`             | `String?` |                                          |
| `region`              | `String?` |                                          |
| `city`                | `String?` |                                          |
| `ipHash`              | `String?` |                                          |

### CampaignTemplate

| Field       | Type      | Attributes               |
| :---------- | :-------- | :----------------------- |
| `id`        | `String`  | `@id @default(cuid())`   |
| `name`      | `String`  |                          |
| `subject`   | `String`  |                          |
| `htmlBody`  | `String`  |                          |
| `textBody`  | `String?` |                          |
| `createdAt` | `DateTime`| `@default(now())`        |
| `updatedAt` | `DateTime`| `@updatedAt`             |
| `schedules` | `CampaignSchedule[]` |                          |

### Campaign

| Field       | Type      | Attributes               |
| :---------- | :-------- | :----------------------- |
| `id`        | `String`  | `@id @default(cuid())`   |
| `name`      | `String`  |                          |
| `description` | `String?` |                          |
| `status`    | `CampaignStatus` | `@default(DRAFT)`        |
| `createdAt` | `DateTime`| `@default(now())`        |
| `updatedAt` | `DateTime`| `@updatedAt`             |
| `schedules` | `CampaignSchedule[]` |                          |
| `settings`  | `CampaignSettings?` |                          |

### AudienceGroup

| Field       | Type      | Attributes               |
| :---------- | :-------- | :----------------------- |
| `id`        | `String`  | `@id @default(cuid())`   |
| `name`      | `String`  |                          |
| `description` | `String?` |                          |
| `criteria`  | `Json?`   |                          |
| `createdAt` | `DateTime`| `@default(now())`        |
| `updatedAt` | `DateTime`| `@updatedAt`             |
| `members`   | `AudienceMember[]` |                          |
| `schedules` | `CampaignSchedule[]` |                          |

### AudienceMember

| Field          | Type      | Attributes                               |
| :------------- | :-------- | :--------------------------------------- |
| `id`           | `String`  | `@id @default(cuid())`                   |
| `groupId`      | `String`  |                                          |
| `businessId`   | `String`  |                                          |
| `businessName` | `String?` |                                          |
| `primaryEmail` | `String`  |                                          |
| `secondaryEmail` | `String?` |                                          |
| `tagsSnapshot` | `String[]`|                                          |
| `inviteToken`  | `String?` |                                          |
| `meta`         | `Json?`   |                                          |
| `unsubscribed` | `Boolean` | `@default(false)`                        |
| `createdAt`    | `DateTime`| `@default(now())`                        |
| `group`        | `AudienceGroup` | `@relation(fields: [groupId], references: [id], onDelete: Cascade)` |

### CampaignSchedule

| Field              | Type      | Attributes                               |
| :----------------- | :-------- | :--------------------------------------- |
| `id`               | `String`  | `@id @default(cuid())`                   |
| `name`             | `String`  |                                          |
| `templateId`       | `String`  |                                          |
| `groupId`          | `String`  |                                          |
| `campaignId`       | `String?` |                                          |
| `status`           | `CampaignStatus` | `@default(DRAFT)`                        |
| `sendAt`           | `DateTime?` |                                          |
| `timeZone`         | `String?` | `@default("America/Vancouver")`          |
| `throttlePerMinute`| `Int?`    | `@default(60)`                           |
| `repeatIntervalMins`| `Int?`    |                                          |
| `lastRunAt`        | `DateTime?` |                                          |
| `nextRunAt`        | `DateTime?` |                                          |
| `stepOrder`        | `Int`     | `@default(1)`                            |
| `smartWindowStart` | `DateTime?` |                                          |
| `smartWindowEnd`   | `DateTime?` |                                          |
| `createdAt`        | `DateTime`| `@default(now())`                        |
| `updatedAt`        | `DateTime`| `@updatedAt`                             |
| `template`         | `CampaignTemplate` | `@relation(fields: [templateId], references: [id], onDelete: Restrict)` |
| `group`            | `AudienceGroup` | `@relation(fields: [groupId], references: [id], onDelete: Restrict)` |
| `campaign`         | `Campaign?` | `@relation(fields: [campaignId], references: [id], onDelete: SetNull)` |
| `sends`            | `CampaignSend[]` |                                          |

### CampaignSend

| Field           | Type      | Attributes                               |
| :-------------- | :-------- | :--------------------------------------- |
| `id`            | `String`  | `@id @default(cuid())`                   |
| `scheduleId`    | `String`  |                                          |
| `groupId`       | `String`  |                                          |
| `templateId`    | `String`  |                                          |
| `businessId`    | `String`  |                                          |
| `businessName`  | `String?` |                                          |
| `email`         | `String`  |                                          |
| `inviteToken`   | `String?` |                                          |
| `inviteLink`    | `String?` |                                          |
| `resendMessageId`| `String?` |                                          |
| `status`        | `CampaignSendStatus` | `@default(PENDING)`                      |
| `error`         | `String?` |                                          |
| `meta`          | `Json?`   |                                          |
| `sentAt`        | `DateTime?` |                                          |
| `openedAt`      | `DateTime?` |                                          |
| `visitedAt`     | `DateTime?` |                                          |
| `rsvpAt`        | `DateTime?` |                                          |
| `createdAt`     | `DateTime`| `@default(now())`                        |
| `updatedAt`     | `DateTime`| `@updatedAt`                             |
| `schedule`      | `CampaignSchedule` | `@relation(fields: [scheduleId], references: [id], onDelete: Cascade)` |

### CampaignSettings

| Field             | Type      | Attributes                               |
| :---------------- | :-------- | :--------------------------------------- |
| `campaignId`      | `String`  | `@id`                                    |
| `windows`         | `Json`    |                                          |
| `throttlePerMinute`| `Int`     | `@default(60)`                           |
| `maxConcurrent`   | `Int`     | `@default(50)`                           |
| `perDomain`       | `Json?`   |                                          |
| `quietHours`      | `Json?`   |                                          |
| `updatedAt`       | `DateTime`| `@updatedAt`                             |
| `paused`          | `Boolean` | `@default(false)`                        |
| `campaign`        | `Campaign`| `@relation(fields: [campaignId], references: [id], onDelete: Cascade)` |

### EmailJob

| Field               | Type      | Attributes                               |
| :------------------ | :-------- | :--------------------------------------- |
| `id`                | `String`  | `@id @default(cuid())`                   |
| `campaignId`        | `String`  |                                          |
| `recipientEmail`    | `String`  |                                          |
| `recipientId`       | `String?` |                                          |
| `sendAt`            | `DateTime`|                                          |
| `status`            | `EmailJobStatus` | `@default(scheduled)`                    |
| `attempts`          | `Int`     | `@default(0)`                            |
| `error`             | `String?` |                                          |
| `processingStartedAt`| `DateTime?` |                                          |
| `sentAt`            | `DateTime?` |                                          |
| `providerMessageId` | `String?` |                                          |
| `createdAt`         | `DateTime`| `@default(now())`                        |
| `updatedAt`         | `DateTime`| `@updatedAt`                             |
| `events`            | `EmailEvent[]` |                                          |

### EmailEvent

| Field       | Type      | Attributes                               |
| :---------- | :-------- | :--------------------------------------- |
| `id`        | `String`  | `@id @default(cuid())`                   |
| `jobId`     | `String`  |                                          |
| `type`      | `EmailEventType` |                                          |
| `meta`      | `Json?`   |                                          |
| `createdAt` | `DateTime`| `@default(now())`                        |
| `job`       | `EmailJob`| `@relation(fields: [jobId], references: [id], onDelete: Cascade)` |

## Enums

### CampaignStatus

- `DRAFT`
- `SCHEDULED`
- `SENDING`
- `PAUSED`
- `COMPLETED`
- `CANCELLED`

### CampaignSendStatus

- `PENDING`
- `SENDING`
- `SENT`
- `FAILED`
- `SKIPPED`

### EmailJobStatus

- `scheduled`
- `processing`
- `sent`
- `failed`

### EmailEventType

- `send_attempt`
- `sent`
- `failed`
- `bounce`
- `complaint`
- `opened`
- `clicked`
- `paused`
- `resumed`
- `schedule_updated`