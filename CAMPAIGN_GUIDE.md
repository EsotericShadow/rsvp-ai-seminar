# Your Guide to the Campaign Control Center

Welcome to the guide for the Campaign Control Center! This document will walk you through everything you need to know to create, manage, and understand email campaigns, even if you have no technical background.

Think of a "campaign" as a specific email marketing effort. For example, sending a "Happy Holidays" message to your customers, or announcing a new product to a specific group of people.

---

## 1. The Core Concepts (The Building Blocks)

Before you create your first campaign, let's understand the main parts of the system.

*   **Campaign:** This is the main container for your entire effort. It's like a folder for a specific marketing push (e.g., "2025 Q4 Newsletter"). It links together your audience, your email design, and your sending schedule.

*   **Audience (Businesses & Groups):** This is **WHO** you are sending emails to.
    *   **Business Directory:** This is your master list of all contacts (or "businesses").
    *   **Groups:** These are smaller, filtered lists of your contacts. For example, you could have a group for "New Customers" or "Located in New York". This allows you to send targeted messages.

*   **Email Template:** This is **WHAT** you are sending. It's the design and content of the email itself. You can create different templates for different purposes (e.g., a newsletter template, a promotional offer template).

*   **Schedule:** This is **WHEN** your emails will be sent. You can define a schedule to send emails at a specific time, or spread them out over a period (e.g., "send 50 emails per hour").

---

## 2. How to Create Your First Campaign (Step-by-Step)

Let's walk through creating a campaign from scratch.

### Step 1: Go to the Campaign Creation Page

Navigate to the `/admin/campaign` section of your application. This is where the magic begins.

### Step 2: Create a New Campaign

1.  Click the **"New Campaign"** button.
2.  Give your campaign a clear, descriptive name. For example, `Fall 2025 Promotion`. This is just for your own organization.

### Step 3: Build Your Audience

Now, you need to decide who will receive the emails.

1.  **Select a Group:** In the "Groups" panel, you will see a list of your pre-defined audience groups. Select the group you want to target for this campaign. For instance, you might select the "Active Subscribers" group.
2.  **Refine Your List (Optional):** You can further refine the list of businesses from the selected group in the "Business Directory" panel.

### Step 4: Choose Your Message

Select the email you want to send.

1.  **Select a Template:** Choose one of your existing email templates from the list. This will be the content that your audience receives.

### Step 5: Set the Schedule

Decide when the emails should go out.

1.  **Define Sending Times:** Set the start and end dates, and the times of day when emails are allowed to be sent (e.g., only during business hours).
2.  **Set the Pace:** You can specify how many emails to send per hour or per day. This is useful for large lists to avoid being marked as spam.

### Step 6: Launch!

Once you've reviewed everything, you can save and launch the campaign. The system will now automatically start sending emails according to the schedule you defined.

---

## 3. Managing an Active Campaign

Once a campaign is live, you can monitor and control it from its dashboard.

### Accessing the Campaign Dashboard

Go to the `/admin/campaigns` page and click on the campaign you want to view.

### What You Can See:

*   **Overview:** A summary of the campaign's performance: how many emails have been sent, opened, and clicked.
*   **Queue:** A list of all the emails that are scheduled to be sent.

### What You Can Do:

*   **Pause:** If you need to stop the campaign for any reason (e.g., you found a typo in the email), you can hit **Pause**. No more emails will be sent until you resume.
*   **Resume:** This will restart a paused campaign. It will pick up right where it left off.
*   **Send Next Batch:** If you want to manually trigger the next batch of emails to be sent immediately instead of waiting for the schedule, you can use this action.

---

## A Simple Example: Putting It All Together

Let's say you want to send a "Happy New Year" email to all your customers in California.

1.  **Group:** First, you would create a **Group** called "California Customers".
2.  **Template:** You would design an email **Template** with your "Happy New Year" message.
3.  **Campaign:** You would create a new **Campaign** called "New Year 2026 - California".
4.  **Audience:** Inside the campaign, you would select the "California Customers" **Group**.
5.  **Schedule:** You would set the **Schedule** to start sending on December 31st.
6.  **Launch:** You'd launch the campaign and let the system do the work!

That's it! You are now ready to manage your own email campaigns.

---

## 4. Understanding the Dashboard & Status (In-Depth)

This section breaks down the specific numbers and statuses you see on the campaign dashboard. The dashboard gives you a real-time view of your campaign's health and progress.

### A. The Main Campaign State: "Running" vs. "Paused"

At the top of your dashboard, you see the primary status: **Running** or **Paused**. This is the main control switch for your campaign.

*   **Running:** The campaign is active. The system is working to send emails according to the schedule you've set. If it's within a sending window, emails are going out. If it's outside a window, it's waiting for the next available time.
*   **Paused:** You have manually hit the "Pause" button. The campaign is frozen. No emails will be sent, even if you are within a scheduled sending window. The campaign will not resume until you manually press the "Resume" button.

### B. The Dashboard Metrics Explained

Here is a breakdown of each metric you see on the dashboard.

*   **Next send in:** This is a countdown to the next scheduled email batch. It is based on the `nextSendAt` time of the next email job in the queue. If no emails are currently scheduled, this will show "—".

*   **Progress (Sent / Total):** This shows you how many emails have been successfully sent out of the total number of emails generated for the entire campaign.
    *   `Sent`: The count of individual emails with the status `sent`.
    *   `Total`: The total count of all emails (`scheduled`, `processing`, `sent`, `failed`) in the campaign.

*   **Avg throughput (per min):** This tells you your sending speed. It's calculated by counting the number of emails sent in the **last 15 minutes**. This number helps you understand how quickly your campaign is progressing.

*   **ETA:** This is the **Estimated Time of Arrival** for campaign completion. It's calculated by taking the number of remaining emails and dividing it by the `Avg throughput`. If your throughput is zero, no ETA can be calculated.

### C. The Email Queue Table

The Queue Table shows the status of every single email in your campaign. You can filter this table to see specific types of emails (e.g., only the ones that have `failed`).

Here is what each column means:

*   **Recipient:** The email address the message is being sent to.

*   **Status:** The current state of that specific email. This is the most important column for diagnostics:
    *   `scheduled`: The email is in the queue, waiting for its designated `sendAt` time. This is the default starting state.
    *   `processing`: The system has picked up the email and is currently attempting to send it. This is a temporary state.
    *   `sent`: The email has been successfully handed off to the email provider (e.g., Resend). It does not mean the user has opened it, only that it was sent successfully from our end.
    *   `failed`: The system's attempt to send the email failed. This could be due to a configuration issue or a problem with the email provider. The `Error` column will have more details.

*   **Send At:** The exact time and date when the system is scheduled to *attempt* sending this email.

*   **Attempts:** The number of times the system has tried to send this email. A high number here on a `failed` email indicates a persistent problem.

*   **Error:** If the status is `failed`, this column will contain the specific error message we received. This is crucial for debugging.

*   **Provider ID:** Once an email is successfully `sent`, this column will show the unique ID given to it by our email provider. This is useful for cross-referencing and tracking with the provider directly.
