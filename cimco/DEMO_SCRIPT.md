# Monday Demo Script - Cimco Equipment Tracker

## Pre-Demo Checklist ✅

### Friday/Saturday Setup
- [ ] Run database schema on Supabase (creates all tables + demo data)
- [ ] Deploy app to Vercel/Netlify
- [ ] Test deployment URL on your phone
- [ ] Print QR codes from `/qr-codes.html`
- [ ] Cut out QR codes and laminate (or tape to cardboard)
- [ ] Test QR scanning with your phone camera

### Sunday Night Final Prep
- [ ] Fully charge your phone
- [ ] Clear browser cache on phone
- [ ] Test complete flow one more time
- [ ] Have backup manual entry ready (type "CIMCO001")
- [ ] Screenshot the working app as backup

### Monday Morning
- [ ] Arrive 15 minutes early
- [ ] Connect phone to WiFi or ensure strong cell signal
- [ ] Test QR scan one final time
- [ ] Have QR codes organized and accessible
- [ ] Open app in phone browser, keep it ready

---

## Demo Script (4 minutes)

### Opening - The Problem (30 seconds)

> "Good morning. I want to show you something that will save us thousands in equipment downtime and prevent knowledge loss when workers leave."

> "Right now, we have **zero tracking** of equipment maintenance. When Mike retires next year, his 20 years of knowledge about our shredders, cranes, and conveyors walks out the door. We don't know what was done, when it was done, or what parts were used."

**Key stats to mention:**
- Zero maintenance records = repeated mistakes
- Average 4 hours downtime per breakdown
- $200-500/hour in lost productivity
- Knowledge loss when workers leave

---

### Act 1 - Instant Equipment Lookup (45 seconds)

**ACTION:** Pull out phone, open app

> "Here's the solution. Watch this."

**ACTION:** Tap "Scan Equipment QR Code"

**ACTION:** Scan CIMCO001 QR code (or type manually if scan fails)

> "I scan the QR code on the equipment... and instantly get all the information."

**Point out on screen:**
- Equipment name: "Main Shredder"
- Manufacturer, model, serial number
- Location: "North Yard"
- Status: "Active"

> "Everything we need to know about this $85,000 piece of equipment, right at my fingertips."

---

### Act 2 - Knowledge Preservation (60 seconds)

**ACTION:** Scroll down to maintenance history

> "But here's the real value - the complete maintenance history."

**ACTION:** Tap on a maintenance log to expand it

> "Look - Mike Johnson logged a hydraulic repair 45 days ago. Let me read what he documented:"

**READ from screen:**
- Work type: Repair
- Description: "Fixed hydraulic leak in main cylinder. Replaced damaged seal."
- Parts used: "Hydraulic seal kit, Hydraulic fluid (5 gal)"
- Hours spent: 3.0 hours
- Cost: $425

> "When Mike retires, this knowledge stays with us. The next technician knows exactly what was done and what parts to order."

**ACTION:** Scroll through other logs

> "We have 3 maintenance logs here totaling $1,675 in work. Every repair, every inspection, every part - documented."

---

### Act 3 - Live Demo - Log Maintenance (90 seconds)

**ACTION:** Tap "Log New Maintenance"

> "Now watch how easy it is to log new work. This takes less than a minute."

**ACTION:** Fill out form while narrating:

**Work Date:** (Today's date - auto-filled)
> "Date is auto-filled to today."

**Worker Name:** Type "Sarah Williams"
> "I enter who did the work."

**Work Type:** Select "Inspection"
> "Type of work - in this case, a routine inspection."

**Description:** Type "Quarterly safety inspection - all systems operational"
> "Quick description of what was done."

**ACTION:** Tap "Take Photo" button

**ACTION:** Take a photo of the QR code (or any equipment-looking thing)

> "I can take a photo right from my phone - before and after shots, parts used, whatever we need to document."

**ACTION:** Tap "Submit Maintenance Log"

**Wait for success**

> "Submitted. Now watch..."

**ACTION:** Tap back to equipment detail

> "It's instantly in the history. Anyone with access can see what Sarah just did."

---

### Act 4 - The ROI Pitch (45 seconds)

> "Here's what this system gives us:"

**Benefits (count on fingers):**
1. **Knowledge preservation** - "Workers can retire, knowledge stays"
2. **Reduced downtime** - "We know what failed before and how to fix it"
3. **Cost tracking** - "We can see which equipment costs us the most"
4. **Compliance** - "OSHA wants maintenance records? We have them"
5. **Better planning** - "We can schedule preventive maintenance instead of emergency repairs"

> "This works right now with paper QR codes. For production, we need metal QR tags that can survive our environment - grease, weather, impacts."

---

### Closing - The Ask (30 seconds)

> "Here's my request:"

**Show the numbers:**
- 100 metal QR tags from Brady Corporation: **$700-800**
- Implementation time: **1 week to tag all equipment**
- Training time: **30 minutes per worker**
- Total cost: **Under $1,000**

> "We'll recoup this investment the first time we avoid a 4-hour shutdown because someone knew exactly what part to order."

> "I'm asking for approval to purchase the metal tags and roll this out to our entire facility."

**Pause for questions**

---

## Handling Questions

### "What if the phone breaks or we lose internet?"

> "We can also browse equipment manually in the app. And once we log maintenance, it's permanently stored in the cloud - accessible from any device."

### "What if workers don't want to use their phones?"

> "We can get cheap Android tablets dedicated to the shop floor. Or workers can text the equipment code to a supervisor who logs it. But in practice, everyone has a phone already."

### "Can we track parts inventory?"

> "Yes! That's Phase 2. Right now I focused on the highest-value feature - maintenance tracking. Parts inventory is already in the database design, just needs a UI."

### "What about security? Can anyone access this?"

> "For the demo, yes - it's open. For production, we'll add worker logins. Each person has their own account, and we can control who sees what."

### "How much does the software cost monthly?"

> "The database and hosting are free up to 500MB of data and 1GB of photos. We won't hit that for years. If we do, it's $25/month. There's no per-user fee."

### "What happens when we buy new equipment?"

> "We have spare QR codes already generated. Just stick a tag on the new equipment and register it in the system - takes 2 minutes."

### "Can we export data for reports?"

> "Yes - the database can export to Excel, CSV, or PDF. We can also build custom reports in Phase 2."

---

## Demo Failure Backups

### If QR Scanner Fails
> "The camera's having trouble - let me just type the code manually."
- Tap manual entry field
- Type: CIMCO001
- Tap "Load Equipment"
- Continue demo

### If Internet is Down
- Have screenshots ready on your phone
- Walk through the screenshots
- "Here's what it looks like when it's working..."

### If App Crashes
- Refresh the page
- "Let me reload this..."
- Continue from where you left off

### If Database is Empty
- "Looks like the demo data didn't load - but I can show you the interface..."
- Walk through the UI
- Show the printable QR codes page instead

---

## Post-Demo Follow-Up

### If They Approve
1. Order metal tags immediately
2. Tag all equipment (North Yard first, then Main Building)
3. Schedule 30-minute training sessions
4. Go live within 1 week

### If They Want More Info
1. Offer to do individual walkthroughs
2. Share cost breakdown in email
3. Show similar systems at other industrial facilities
4. Calculate potential ROI based on last year's downtime

### If They Say No
1. Ask what concerns they have
2. Offer to start with just one department (North Yard)
3. Propose a 30-day trial with paper QR codes
4. Get feedback and iterate

---

## Key Talking Points to Memorize

1. **"Knowledge preservation"** - say this phrase at least 3 times
2. **"Under $1,000 total"** - emphasize low cost
3. **"Less than 1 minute to log maintenance"** - emphasize simplicity
4. **"Workers already have phones"** - no new hardware needed
5. **"Pays for itself after one prevented breakdown"** - ROI focus

---

## Confidence Boosters

✅ The app works - you've tested it
✅ The demo data is realistic - it looks professional
✅ The QR codes scan reliably - you've practiced
✅ The pitch is solid - you're solving a real problem
✅ The ask is small - under $1,000 is easy to approve

**You've got this! 🚀**

---

## Time Management

| Section | Time | Cumulative |
|---------|------|------------|
| Opening - The Problem | 30s | 0:30 |
| Act 1 - Equipment Lookup | 45s | 1:15 |
| Act 2 - Knowledge Preservation | 60s | 2:15 |
| Act 3 - Live Demo | 90s | 3:45 |
| Act 4 - ROI Pitch | 45s | 4:30 |
| Closing - The Ask | 30s | 5:00 |
| **Total** | **5:00** | |

Leave 5-10 minutes for questions.

---

**Break a leg! This demo will get you the budget you need. 💪**
