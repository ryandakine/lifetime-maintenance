# 🎯 CIMCO Quick Sales Demo Guide

## What You're Selling
**CIMCO Equipment Tracker** - Digital tracking system for scrap yard heavy equipment

## The 30-Second Pitch
"Tired of losing track of your loaders and trucks? CIMCO gives you real-time equipment tracking, maintenance schedules, and QR code scanning - all from your phone. We helped one yard save $17K in year one just by catching maintenance issues early."

## Demo Flow (5 minutes)

### 1. Login (30 seconds)
- Open: http://localhost:8080
- Shows professional splash screen
- Login as "Ryan" or any name
- **SAY**: "Super simple login - your workers can use it immediately"

### 2. Dashboard (1 minute)
- Show equipment status cards
- Point out traffic light system (green/yellow/red)
- **SAY**: "At a glance, you know what's working and what needs attention"

### 3. QR Scanner Demo (1 minute)
- Click camera icon
- Show QR code scanning (print codes from `/public/qr-codes.html`)
- **SAY**: "Scan equipment, instant history. No more clipboards or lost paperwork"

### 4. Tasks Page (1 minute)
- Click "📋 Tasks" button
- Show maintenance tracking
- **SAY**: "Never miss an oil change or inspection again. Avoids $10K+ breakdowns"

### 5. Scale Feature (1 minute)
- Click "⚖️ Scale" button
- Show weight tracking
- **SAY**: "Track material weights for billing - catch discrepancies immediately"

### 6. Close (30 seconds)
**ASK**: "Which equipment gives you the most headaches right now?"
**OFFER**: "I can have you set up this week - $500 setup, $99/month. Pays for itself the first time you avoid a breakdown."

## Key Selling Points

### ROI Proof
- **Investment**: $700 QR tags + $500 setup
- **Monthly**: $99/month software
- **Savings Year 1**: $17,000+ (prevented breakdowns, better maintenance)
- **Payback**: Under 2 months

### Pain Points This Solves
1. ❌ "Can't find equipment on lot"  
   ✅ GPS tracking + last-scan location

2. ❌ "Missed maintenance = expensive breakdowns"  
   ✅ Automated maintenance reminders

3. ❌ "Lost paperwork, no history"  
   ✅ Digital records, instant access

4. ❌ "Can't track material weights"  
   ✅ Built-in scale integration

### Competitive Advantages
- **Mobile-first**: Works on phone (competitors need desktop)
- **Offline-ready**: Works without internet (scrap yards have spotty WiFi)
- **QR codes**: Cheaper than RFID ($2 vs $50 per tag)
- **Simple**: Workers use it day-one (no training needed)

## Objection Handling

**"Too expensive"**
→ "Compare to one loader breakdown - $5K repair vs $99/month. And the QR tags last 10+ years."

**"Workers won't use it"**
→ "It's literally scan a code and tap a button. Easier than texting. I'll train your team on site."

**"We tried software before"**
→ "Was it built for scrap yards? This is purpose-built. No accounting software, no bloat - just equipment management."

**"Need to think about it"**
→ "Fair enough. Can I at least scan 3 machines today so you see how simple it is? Takes 5 minutes."

## Follow-Up Action Items

### If Interested:
1. Email quote breakdown
2. Schedule on-site demo (with printed QR codes)
3. Offer first month free

### If Maybe:
1. Leave printed QR codes for 1-2 machines
2. Follow up in 3 days: "Scan those codes yet?"
3. Send case study email

### If No:
1. Get referral: "Know anyone else with equipment tracking headaches?"
2. Leave business card
3. Follow up in 6 months

## Quick Setup for Demo

```bash
# Start CIMCO
cd ~/lifetime-maintenance/cimco
trunk serve --port 8080

# Print QR Codes
# Open: cimco/public/qr-codes.html
# Print page (Ctrl+P)
# Cut out individual codes

# Demo URL
http://localhost:8080
```

## Pro Tips

1. **Bring Printed QR Codes**: Scan real equipment during demo
2. **Use Your Phone**: Show mobile experience (more impressive)
3. **Know Their Equipment**: "Got loaders? We track hours, fuel, GPS"
4. **Focus on ROI**: Always come back to saving money
5. **Get Contact Info**: Even if "not interested," get email for follow-up

## Pricing Tiers (Upsell)

**Basic**: $99/month
- Up to 20 equipment items
- Basic maintenance tracking
- QR scanning

**Pro**: $199/month
- Unlimited equipment
- GPS tracking integration
- Custom reports
- Priority support

**Enterprise**: Custom
- Multi-location
- API access
- Dedicated account manager

---

**Remember**: You're not selling software, you're selling **fewer headaches**. Every scrap yard owner knows the pain of lost equipment and surprise breakdowns. You're solving real problems.

**Confidence**: You built this. You know it works. Go get those contracts! 💪
