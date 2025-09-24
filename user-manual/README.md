# RSVP AI Seminar - Complete User Manual

Welcome to the RSVP AI Seminar application! This comprehensive guide will help you navigate and use every feature of the system, whether you're an administrator managing events or a business owner responding to invitations.

## 📋 Table of Contents

1. [Getting Started](#getting-started)
2. [For Event Organizers (Admin Panel)](#for-event-organizers-admin-panel)
3. [For Business Owners (RSVP Process)](#for-business-owners-rsvp-process)
4. [Troubleshooting](#troubleshooting)
5. [Frequently Asked Questions](#frequently-asked-questions)

---

## Getting Started

### What is this application?
The RSVP AI Seminar application is a comprehensive event management system designed specifically for AI seminars and business events. It helps you:

- **Manage business contacts** from LeadMine database
- **Create and send email campaigns** to invite businesses to events
- **Track RSVP responses** and manage attendee lists
- **Automate follow-up communications** and reminders
- **Analyze campaign performance** and response rates

### System Requirements
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Internet connection
- Admin access (for event organizers)

---

## For Event Organizers (Admin Panel)

### 🔐 Logging In

1. **Navigate to the admin panel**: Go to `yoursite.com/admin/login`
2. **Enter your credentials**:
   - Username: Your admin username
   - Password: Your admin password
3. **Click "Sign In"** to access the dashboard

> **Note**: If you forget your password, contact your system administrator.

### 🏠 Dashboard Overview

The main dashboard is your command center with four main tabs:

#### **Campaigns Tab**
- View all your email campaigns
- Create new campaigns
- Monitor campaign performance
- Duplicate successful campaigns

#### **Audience Groups Tab**
- Manage business contact lists
- Organize contacts by industry or category
- Add/remove businesses from groups
- Create custom audience segments

#### **Templates Tab**
- Design email templates
- Create professional-looking invitations
- Manage template versions
- Preview templates before sending

#### **Automation Tab**
- Set up automated workflows
- Configure reminder systems
- Manage RSVP follow-ups
- Monitor automation performance

---

### 📧 Managing Email Campaigns

#### Creating a New Campaign

1. **Go to the Campaigns tab**
2. **Click "New Campaign"**
3. **Fill in campaign details**:
   - **Campaign Name**: Give your campaign a descriptive name
   - **Description**: Brief description of the campaign purpose
   - **Status**: Choose Draft, Active, or Paused
4. **Click "Create Campaign"**

#### Setting Up Campaign Steps

Each campaign consists of steps that define when and how emails are sent:

1. **Add a Step**:
   - Click "Add Step" in your campaign
   - Choose the audience group
   - Select an email template
   - Set the send time

2. **Configure Timing**:
   - **Immediate**: Send right away
   - **Scheduled**: Set a specific date and time
   - **Smart Window**: Let the system choose optimal send times

3. **Set Throttling**:
   - Control how many emails are sent per minute
   - Default: 60 emails per minute (recommended)

#### Sending Your Campaign

1. **Preview your campaign**:
   - Click "Preview" to see how emails will look
   - Test with a small group first

2. **Send the campaign**:
   - Click "Send Campaign"
   - Monitor progress in real-time
   - Check delivery status

---

### 👥 Managing Audience Groups

#### Understanding Audience Groups

Audience groups help you organize your business contacts by:
- **Industry type** (Healthcare, Food Service, etc.)
- **Business size** (Small, Medium, Large)
- **Geographic location**
- **Custom categories** you create

#### Creating a New Group

1. **Go to Audience Groups tab**
2. **Click "Create New Group"**
3. **Fill in group details**:
   - **Group Name**: Descriptive name (e.g., "Healthcare & Wellness")
   - **Description**: What businesses belong in this group
   - **Color**: Choose a color to identify this group
4. **Click "Create Group"**

#### Adding Businesses to Groups

**Method 1: Browse and Add**
1. **Select your group** from the list
2. **Click "Browse Businesses"**
3. **Search for businesses** using the search bar
4. **Click "Add"** next to businesses you want to include
5. **Use "Move to"** to transfer businesses between groups

**Method 2: Manual Entry**
1. **Click "Add Manual Entry"**
2. **Fill in business details**:
   - Business Name
   - Primary Email
   - Contact Person
   - Phone Number
3. **Click "Add to Group"**

#### Managing Group Members

- **View members**: Click on a group to see all members
- **Remove members**: Click "Remove" next to any member
- **Move members**: Use "Move to" dropdown to transfer between groups
- **Search members**: Use the search bar to find specific businesses

---

### 📝 Creating Email Templates

#### Template Editor

1. **Go to Templates tab**
2. **Click "Create New Template"**
3. **Fill in template details**:
   - **Template Name**: Descriptive name
   - **Subject Line**: Email subject (use {{business_name}} for personalization)
   - **From Name**: Your name or organization
   - **From Email**: Your email address

#### Writing Your Email Content

**Subject Line Tips**:
- Keep it under 50 characters
- Use action words: "Join us for...", "Reserve your spot..."
- Personalize with {{business_name}}

**Email Body Structure**:
1. **Opening**: Warm greeting and event introduction
2. **Event Details**: Date, time, location, cost
3. **Value Proposition**: What attendees will learn/gain
4. **Call to Action**: Clear RSVP instructions
5. **Closing**: Professional signature

**Personalization Variables**:
- `{{business_name}}` - Business name
- `{{contact_person}}` - Contact person's name
- `{{event_date}}` - Event date
- `{{event_time}}` - Event time
- `{{event_location}}` - Event location

#### Previewing and Testing

1. **Click "Preview"** to see how your email looks
2. **Test with sample data** to check personalization
3. **Send test email** to yourself before using in campaigns

---

### 🤖 Setting Up Automation

#### Understanding Automation

Automation helps you:
- **Send reminder emails** to non-responders
- **Auto-confirm RSVPs** and send calendar invites
- **Monitor capacity** and manage waitlists
- **Track response rates** and send alerts

#### Creating Workflows

1. **Go to Automation tab**
2. **Click "New Workflow"**
3. **Choose trigger type**:
   - **RSVP Reminder**: Send reminders to non-responders
   - **RSVP Received**: Auto-confirm when someone RSVPs
   - **Event Approaching**: Send final details
   - **Capacity Reached**: Handle waitlist management
   - **Low Response Rate**: Alert when response rates are low

4. **Configure the workflow**:
   - Set conditions (when to trigger)
   - Define actions (what to do)
   - Choose timing and frequency

5. **Enable the workflow** to start automation

#### Global Automation Settings

Access advanced settings by clicking the "Settings" button:

**Reminder Automation**:
- Auto-send reminder emails
- Set reminder frequency (fixed or escalating)
- Enable timezone-aware reminders

**RSVP Management**:
- Auto-confirm RSVPs
- Send calendar invites automatically
- Enable waitlist management

**Monitoring & Alerts**:
- Capacity alerts
- Response rate monitoring
- Low response alerts
- Event details reminders

---

### 📊 Analytics and Reporting

#### Campaign Performance

View key metrics for each campaign:
- **Total Sends**: How many emails were sent
- **Open Rate**: Percentage of emails opened
- **Click Rate**: Percentage of links clicked
- **RSVP Rate**: Percentage who responded
- **Success Rate**: Overall campaign effectiveness

#### Visitor Analytics

Track website visitors:
- **Total Visitors**: People who visited your RSVP page
- **Business Connections**: Which businesses visitors came from
- **Geographic Data**: Where visitors are located
- **Device Information**: Desktop vs mobile usage

#### Tracking Links Performance

Monitor individual tracking links:
- **Link Status**: Active, clicked, expired
- **Click Count**: How many times each link was clicked
- **Business Assignment**: Which business each link was sent to
- **Response Tracking**: Whether the business RSVP'd

---

## For Business Owners (RSVP Process)

### 📧 Receiving an Invitation

When you receive an email invitation:

1. **Read the email carefully** for event details
2. **Click the "Reserve Your Seat" button** or link
3. **You'll be taken to the RSVP page**

### 🎯 RSVP Process

#### Step 1: Event Information
- Review event details (date, time, location, cost)
- Read about what you'll learn
- Check if the event fits your schedule

#### Step 2: Fill Out RSVP Form
**Required Information**:
- **Full Name**: Your complete name
- **Organization**: Your business name
- **Email Address**: Your business email
- **Phone Number**: Contact number (optional but recommended)

**Attendance Details**:
- **Attendance Status**: 
  - ✅ **Yes, I'll attend** - Confirmed attendance
  - ❌ **No, I can't attend** - Declined invitation
  - 🤔 **Maybe** - Uncertain, will decide later
- **Number of Attendees**: How many people from your organization

**Additional Information**:
- **Dietary Preferences**: Any food restrictions or preferences
- **Accessibility Needs**: Any special accommodations needed
- **Referral Source**: How you heard about the event

#### Step 3: Learning Goals (Optional)
- Share what you hope to learn
- Help organizers tailor content to your needs

#### Step 4: Submit RSVP
- **Review your information** before submitting
- **Click "Submit RSVP"** to confirm
- **You'll receive a confirmation email**

### ✅ After RSVP

#### Confirmation Email
You'll receive an email confirming:
- Your RSVP status
- Event details and location
- Calendar invite (if applicable)
- Contact information for questions

#### Calendar Invite
- Check your email for calendar invitation
- Add the event to your calendar
- Set reminders for the event date

#### Event Updates
- You may receive additional emails with:
  - Event reminders
  - Updated information
  - Parking instructions
  - Last-minute changes

---

## Troubleshooting

### Common Issues

#### Can't Access Admin Panel
**Problem**: Login page not loading or credentials not working
**Solutions**:
- Check your internet connection
- Verify the correct URL
- Contact your system administrator
- Try a different browser

#### Emails Not Sending
**Problem**: Campaign emails stuck in "sending" status
**Solutions**:
- Check your email service configuration
- Verify recipient email addresses are valid
- Check spam/junk folders
- Contact technical support

#### RSVP Form Not Working
**Problem**: Can't submit RSVP or form errors
**Solutions**:
- Refresh the page and try again
- Check that all required fields are filled
- Try a different browser
- Disable browser extensions temporarily

#### Missing Business Contacts
**Problem**: Can't find specific businesses in audience groups
**Solutions**:
- Use the search function
- Check if business is in a different group
- Add business manually if not in database
- Contact admin to verify business data

### Getting Help

#### For Technical Issues
- Check this manual first
- Contact your system administrator
- Provide specific error messages
- Include screenshots if possible

#### For Event Questions
- Contact the event organizer directly
- Check event details in your confirmation email
- Look for updates in your email inbox

---

## Frequently Asked Questions

### General Questions

**Q: How do I change my admin password?**
A: Contact your system administrator to reset your password.

**Q: Can I send emails to businesses outside the database?**
A: Yes, you can add businesses manually through the Audience Groups tab.

**Q: How many emails can I send at once?**
A: The system is configured to send 60 emails per minute by default to prevent spam issues.

**Q: Can I schedule campaigns for later?**
A: Yes, when creating campaign steps, choose "Scheduled" and set your desired date and time.

### RSVP Questions

**Q: I RSVP'd but didn't get a confirmation email.**
A: Check your spam/junk folder first. If not there, contact the event organizer.

**Q: Can I change my RSVP after submitting?**
A: Yes, you can submit a new RSVP with updated information.

**Q: What if I need to bring additional people?**
A: Update your RSVP with the correct number of attendees, or contact the organizer directly.

**Q: Is there a deadline for RSVP?**
A: Check the original invitation email for RSVP deadlines.

### Technical Questions

**Q: What browsers are supported?**
A: The application works with Chrome, Firefox, Safari, and Edge (latest versions).

**Q: Can I use this on mobile devices?**
A: Yes, the application is mobile-responsive and works on smartphones and tablets.

**Q: How is my data protected?**
A: The application uses secure connections and follows data protection best practices.

---

## Contact Information

### For Event Organizers
- **Technical Support**: Contact your system administrator
- **Training**: Request additional training sessions
- **Feature Requests**: Submit suggestions for improvements

### For Business Owners
- **Event Questions**: Contact the event organizer directly
- **Technical Issues**: Use the contact information provided in your invitation email

---

*This manual is regularly updated. For the latest version, check the application's help section or contact your administrator.*

**Last Updated**: December 2024
**Version**: 1.0




