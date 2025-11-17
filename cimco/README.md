# Cimco Equipment Tracker MVP

> QR-based equipment maintenance tracking system for Cimco Resources scrapyard in Sterling, Illinois.

## 🎯 Project Overview

This is a **weekend MVP** built for a Monday management demo to prove ROI before budget approval for metal QR tags. The system enables:

- ✅ QR code scanning for instant equipment lookup
- ✅ Complete maintenance history tracking
- ✅ Photo documentation of work performed
- ✅ Knowledge preservation when workers leave
- ✅ Mobile-first design for field workers

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ installed
- Supabase account (free tier works)
- Modern web browser
- Mobile device with camera for testing

### 1. Clone and Install

```bash
cd cimco-equipment-tracker
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to SQL Editor and run the entire `database/schema.sql` file
3. This will create:
   - All tables (qr_codes, equipment, maintenance_logs, parts_inventory)
   - Demo data (5 equipment items, 14 maintenance logs)
   - Storage bucket for photos
   - Indexes for performance

### 3. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` and add your Supabase credentials:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

Find these in Supabase Dashboard → Settings → API

### 4. Run Development Server

```bash
npm run dev
```

App will open at `http://localhost:3000`

### 5. Print QR Codes for Demo

1. Open `http://localhost:3000/qr-codes.html` in browser
2. Click "🖨️ Print QR Codes" button
3. Print on paper for demo (metal tags come after approval)

## 📱 Demo Flow (Monday Presentation)

### Setup Before Demo
1. Have app running on phone
2. Print QR codes on paper
3. Tape QR codes to sample equipment (or just hold them)
4. Ensure phone has internet connection

### Demo Script

**1. Show the Problem (30 seconds)**
> "We have zero maintenance tracking. When Mike leaves, his 20 years of knowledge leaves with him. Equipment breaks down and we don't know what was done last time."

**2. Scan QR Code (15 seconds)**
- Open app on phone
- Tap "Scan Equipment QR Code"
- Scan CIMCO001 (Main Shredder)
- Equipment info loads instantly

**3. Show Knowledge Preservation (30 seconds)**
- Scroll through maintenance history
- Click on a log to expand details
- Show: "Look - Mike logged a hydraulic repair 45 days ago. Parts used, hours spent, cost - all documented."

**4. Log New Maintenance (60 seconds)**
- Tap "Log New Maintenance"
- Fill out form:
  - Worker: "Sarah Williams"
  - Type: "Inspection"
  - Description: "Quarterly safety inspection - all systems operational"
- Take a photo with phone camera
- Submit
- Show it instantly appears in history

**5. Show the Value (30 seconds)**
> "Total maintenance cost on this shredder: $1,675. We can now track downtime, plan preventive maintenance, and preserve knowledge. When Mike retires, we have everything documented."

**6. Close with Budget Ask**
> "This is working on paper QR codes. For $700, we can get 100 metal QR tags from Brady that will last 10+ years in our harsh environment. I'm requesting approval to proceed."

## 🏗️ Architecture

### Frontend
- **React 18** - UI framework
- **Vite** - Build tool (fast!)
- **html5-qrcode** - QR scanning
- **Supabase JS Client** - Database/storage

### Backend
- **Supabase** (PostgreSQL + Storage + Auth)
- **Row Level Security** disabled for MVP (enable for production)

### Database Schema

```
qr_codes
  - qr_code_id (PK)
  - status (available|assigned|retired)
  - date_created, date_assigned, notes

equipment
  - equipment_id (PK UUID)
  - qr_code_id (FK to qr_codes, unique)
  - equipment_name, equipment_type, manufacturer
  - model_number, serial_number, year_manufactured
  - location_zone, status, purchase_price, notes

maintenance_logs
  - log_id (PK UUID)
  - equipment_id (FK to equipment)
  - work_date, worker_name, work_type
  - work_description, parts_used
  - hours_spent, cost
  - photo_urls (text[])

parts_inventory (for future)
  - part_id, part_number, part_name
  - manufacturer, unit_cost, current_stock
  - minimum_stock, storage_location
```

## 📁 Project Structure

```
cimco-equipment-tracker/
├── public/
│   └── qr-codes.html          # Printable QR codes
├── src/
│   ├── components/
│   │   ├── QRScanner.jsx      # Camera QR scanning
│   │   ├── EquipmentDetail.jsx # Equipment info + history
│   │   ├── EquipmentList.jsx   # Browse all equipment
│   │   └── MaintenanceLogForm.jsx # Log maintenance work
│   ├── lib/
│   │   └── supabase.js        # Supabase client + helpers
│   ├── App.jsx                # Main app component
│   ├── App.css                # Styles
│   ├── main.jsx               # Entry point
│   └── index.css              # Global styles
├── database/
│   └── schema.sql             # Complete DB schema + demo data
├── package.json
├── vite.config.js
└── README.md
```

## 🔧 Key Features

### QR Code Scanning
- Uses device camera to scan QR codes
- Fallback manual entry if camera fails
- Instant equipment lookup from database

### Equipment Detail View
- Full equipment information
- Complete maintenance history (newest first)
- Total maintenance cost calculation
- Expandable log details with photos

### Maintenance Logging
- Mobile-optimized form
- Photo upload (max 5 photos)
- Automatic image compression
- Parts, hours, cost tracking

### Photo Handling
- Take photo with camera OR choose from gallery
- Auto-compress to save bandwidth/storage
- Upload to Supabase storage
- Display thumbnails in history

## 🚀 Deployment

### Deploy to Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Deploy!

```bash
npm run build        # Test build locally
vercel --prod        # Deploy to production
```

### Deploy to Netlify

```bash
npm run build
netlify deploy --prod --dir=dist
```

## 📊 Demo Data Included

The schema includes 5 equipment items:

1. **CIMCO001** - Main Shredder (American Pulverizer) - 3 logs
2. **CIMCO002** - Crane #2 (Manitowoc) - 2 logs
3. **CIMCO003** - Conveyor Belt A (Flexco) - 2 logs
4. **CIMCO004** - Baler (Harris) - 2 logs
5. **CIMCO005** - Forklift #1 (Toyota) - 3 logs

Total: **14 maintenance logs** with realistic data

## 🔐 Security Notes

**FOR MVP DEMO:**
- RLS (Row Level Security) is **disabled**
- Anyone with URL can access data
- This is OK for demo with fake data

**FOR PRODUCTION:**
- Enable RLS policies (commented in schema.sql)
- Add authentication
- Set storage bucket to private
- Add user roles (worker, manager, admin)

## 🎨 Mobile Optimization

- Touch-friendly buttons (min 44px)
- Large, clear typography
- Thumb-friendly navigation
- Fast-loading pages
- Image compression
- Offline-tolerant (with service worker - future)

## 📝 What's NOT in MVP

These are for Phase 2 after budget approval:

- ❌ User authentication/login
- ❌ Parts inventory management
- ❌ Preventive maintenance scheduling
- ❌ Advanced search/filters
- ❌ Reporting/analytics dashboard
- ❌ Email notifications
- ❌ Offline sync
- ❌ Multi-location support

## 💰 Next Steps After Approval

1. **Order metal QR tags** - Brady Corporation ($600-800 for 100 tags)
2. **Tag all equipment** - Physical QR tags on every machine
3. **Train workers** - 30-minute training session
4. **Add authentication** - Worker accounts
5. **Expand features** - Parts inventory, scheduling, analytics
6. **Scale to other facilities** - Multi-tenant SaaS

## 🏋️ Future: Lifetime Fitness Version

This codebase is designed to be adapted for:
- Lifetime Fitness corporate gym maintenance
- World model AI integration (LeCun's JEPA)
- Multi-tenant SaaS product for industrial facilities

## 🤝 Support

Built by: Cimco Resources Team
For questions: [your-email@cimco.com]
Demo date: Monday, [Date]

## 📄 License

MIT License - Internal use only for Cimco Resources

---

**Ready to preserve knowledge and reduce downtime! 🏭**
