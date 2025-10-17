# Manual Test Plan - RSVP Form Phone Validation Fix

**URL:** https://rsvp.evergreenwebsolutions.ca/
**Date:** October 17, 2025

## Test Scenarios

### ✅ Test 1: Partial Phone Number Should Allow Progression

**Steps:**
1. Navigate to https://rsvp.evergreenwebsolutions.ca/
2. Fill in:
   - First Name: "John"
   - Last Name: "Doe"
   - Email: "john@example.com"
   - Phone: "250-" (just type 2-5-0 and the dash)
3. Click "Next Step"

**Expected Result:** ✅ Should progress to Step 2 (Attendance Details)
**Previous Behavior:** ❌ Would show error and stay on Step 1

---

### ✅ Test 2: Navigate Through All Steps with Partial Phone

**Steps:**
1. Continue from Test 1
2. Select "Yes, I'll be there" and enter attendee count: 1
3. Click "Next Step"
4. Select dietary preference and click "Next Step"
5. Select referral source and click "Next Step"
6. Fill optional info (or leave blank) and click "Complete RSVP"

**Expected Result:** ❌ Should show error message: "Please complete your phone number (format: 250-635-1234)"
**Should:** Return to Step 1 with phone field highlighted

---

### ✅ Test 3: Complete Submission with Full Phone

**Steps:**
1. On Step 1, complete the phone number: "250-635-1234"
2. Navigate through all steps again
3. Click "Complete RSVP"

**Expected Result:** ✅ Success message should appear
**Server Logs:** Should see POST request to /api/rsvp with 200 status

---

### ✅ Test 4: Various Phone Number Formats

Test these phone numbers at Step 1 and verify you can click "Next Step":

| Phone Input | Should Progress? |
|-------------|-----------------|
| "250-" | ✅ Yes |
| "250-635-" | ✅ Yes |
| "250-635-1234" | ✅ Yes |
| "" (empty) | ❌ No - "Phone number is required" |
| "abc-def-ghij" | ❌ No - format error |

---

## What Changed

### Before Fix:
- Phone validation blocked progression with partial input
- Users got stuck on Step 1
- No POST requests reached server

### After Fix:
- Users can progress with partial phone numbers
- Validation only blocks on final submission if incomplete
- Helpful error messages guide users to complete the phone number
- Complete phone numbers are still required for submission

---

## Monitoring After Tests

Check server logs for:
```
POST /api/rsvp 200  ← Successful submissions
POST /api/rsvp 400  ← Should decrease (was high due to validation issues)
```

Check database for new entries with complete phone numbers.

---

**Status:** Ready for testing
**Deployed:** Yes (commit 2e74b23)
**Build Hash:** 117-b3e422b3aaec10bb (new)

