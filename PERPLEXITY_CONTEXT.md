# 🏋️ Lifetime Fitness Maintenance System - Project Context

## 1. Project Overview
This repository (`lifetime-maintenance`) contains two distinct applications:

1.  **Lifetime Fitness Maintenance System** (`/lifetime-fitness`): A comprehensive facility management platform with advanced AI, social features, and voice control.
2.  **Cimco Equipment Tracker** (`/cimco`): A specialized QR-code based equipment tracking app for Cimco Resources.

## 2. Tech Stack
-   **Frontend**: React 18, Vite, Redux Toolkit
-   **UI Framework**: Kendo UI for React, Custom CSS (Glassmorphism)
-   **Backend**: Supabase (PostgreSQL, Auth, Storage, Edge Functions)
-   **AI Integration**: Perplexity Pro API, OpenAI (planned), Anthropic (planned)
-   **Deployment**: Vercel (PWA capability)

## 3. Key Features (Lifetime Fitness App)

### 🤖 AI Training Center (`AITraining.jsx`)
-   **Purpose**: Train custom AI models for equipment recognition and damage detection.
-   **Functionality**:
    -   Users submit photos and feedback to improve model accuracy.
    -   Visualizes model performance (Accuracy, F1 Score, Precision).
    -   Gamified training process.

### 🏋️ Gym Buddy Finder (`GymBuddyFinder.jsx`)
-   **Purpose**: Social feature for members to find workout partners.
-   **Functionality**:
    -   "Looking for Spotter/Partner" status toggle.
    -   Filter by workout type (Strength, Cardio) and duration.
    -   Safety features (Member verification, Privacy controls).

### 🎤 Voice Assistant (`VoiceAssistant.jsx`)
-   **Purpose**: Hands-free operation for maintenance staff.
-   **Functionality**:
    -   Wake word detection ("Hey Lifetime").
    -   Commands: "Log maintenance for treadmill", "Order cleaning supplies".
    -   Voice-to-text for logging notes.

### 📊 Advanced Analytics (`AdvancedAnalytics.jsx`)
-   **Purpose**: Data visualization for facility management.
-   **Functionality**:
    -   Equipment uptime/downtime tracking.
    -   Maintenance cost analysis.
    -   Predictive maintenance alerts.

### 🛒 Intelligent Shopping (`Shopping.jsx`)
-   **Purpose**: Automated inventory management.
-   **Functionality**:
    -   Auto-categorization of supplies.
    -   One-click ordering (integration with vendors).
    -   Budget tracking.

## 4. Database Schema (Supabase)

### Tables
-   `equipment`: Stores equipment details (ID, Name, Type, Status, QR Code).
-   `maintenance_logs`: History of all maintenance actions.
-   `tasks`: To-do list for maintenance staff.
-   `shopping_lists`: Items needed for purchase.
-   `photos`: Metadata for uploaded photos (linked to Storage).
-   `user_profiles`: User data, gamification stats, roles.

## 5. Project Structure

```
lifetime-maintenance/
├── lifetime-fitness/       # MAIN APP
│   ├── src/
│   │   ├── components/     # Feature Components
│   │   │   ├── AITraining.jsx
│   │   │   ├── GymBuddyFinder.jsx
│   │   │   ├── VoiceAssistant.jsx
│   │   │   └── ...
│   │   ├── store/          # Redux State
│   │   ├── lib/            # Supabase Client
│   │   └── App.jsx         # Main Entry (Router/Tabs)
│   └── package.json
│
├── cimco/                  # SECONDARY APP (Cimco)
│   ├── src/
│   └── package.json
```

## 6. Current Status
-   **Lifetime Fitness**: Feature-complete MVP. Ready for AI model integration and real-time data hookup.
-   **Cimco**: Production-ready for equipment tracking. Deployed and tested.

## 7. Deployment
-   Hosted on Vercel.
-   CI/CD via GitHub Actions.
-   PWA enabled (installable on mobile).
