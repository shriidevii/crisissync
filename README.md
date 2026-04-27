#  CrisisSync — AI-Powered Emergency Response Platform

> **Solution Challenge 2026 | Build with AI | Hack2Skill**  
> Problem: Rapid Crisis Response — Accelerated Emergency Response 
> and Crisis Coordination in Hospitality

[![Live Demo](https://img.shields.io/badge/Live-Demo-red)](https://your-vercel-url.vercel.app)
[![GitHub](https://img.shields.io/badge/GitHub-Repository-blue)](https://github.com/shriidevii/crisissync)

---

##  What is CrisisSync?

CrisisSync is a **real-time AI-powered emergency coordination 
platform** for hospitality venues. It creates an intelligent 
bridge between distressed guests, hotel staff, and emergency 
services — eliminating fragmented communication permanently.

**The problem:** When a crisis occurs in a hotel, information 
is siloed. A guest calls the front desk. Staff call the manager. 
The manager calls security. By the time everyone is coordinated, 
precious minutes are lost. Lives are at risk.

**Our solution:** One tap from a guest triggers an AI-classified 
alert that reaches every staff member simultaneously in under 
500 milliseconds.

---

##  Live Demo

** Live App:** https://your-vercel-url.vercel.app

**Demo credentials:**
| Role | Email | Password |
|------|-------|----------|
| Guest | Click "I am a Guest" | No login needed |
| Staff | staff@crisissync.com | test1234 |
| Admin | admin@crisissync.com | test1234 |

**Test the AI triage — send these SOS messages:**
- `"fire smoke on floor 3"` → type: fire, severity: 5, confidence: 100%
- `"guest collapsed not breathing"` → type: medical, severity: 5
- `"gas leak smell in corridor"` → type: other, severity: 4

---

##  Key Features

| Feature | Description |
|---------|-------------|
|  One-Tap SOS | Anonymous guest alert — no login needed |
|  Voice SOS | Speak emergency — Web Speech API transcribes |
|  Gemini AI Triage | Auto-classifies type, severity, team — 100% confidence |
|  Panic Mode | Severity 4-5 turns guest screen red and pulses |
|  Live Timer | Escalation badge at 5 minutes unresolved |
|  Audio Alerts | Sound alert when new SOS arrives on staff dashboard |
|  Tab Counter | (3) live incident count in browser tab |
|  Staff Chat | WhatsApp-style per-incident coordination |
|  Broadcast | Instant message to all guests simultaneously |
|  Floor Heatmap | Hotel floors glow red by incident severity |
|  Live Map | Google Maps — incident pins + staff locations |
|  Offline-First | Firebase queues alerts when WiFi fails |
|  Analytics | Real-time severity charts and type breakdown |

---

##  Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React.js 18 + Tailwind CSS + Vite 5 |
| Database | Firebase Realtime Database |
| Auth | Firebase Authentication |
| AI | Google Gemini Flash-Lite-Latest API |
| Maps | Google Maps JavaScript API |
| Voice | Web Speech API (browser native) |
| Sound | Web Audio API (browser native) |
| Deploy | Vercel + GitHub CI/CD |

---

##  Setup Guide

### 1. Clone and install
```bash
git clone https://github.com/shriidevii/crisissync.git
cd crisissync
npm install
```

### 2. Create .env.local
```env
VITE_FIREBASE_API_KEY=your_value
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://your_project-rtdb.firebaseio.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_GEMINI_API_KEY=your_gemini_key
VITE_MAPS_API_KEY=your_maps_key
```

### 3. Run locally
```bash
npm run dev
# Open http://localhost:5173
```

### 4. Deploy to Vercel
```bash
git push  # Vercel auto-deploys from GitHub
```

---

##  Project Structure
crisissync/
├── src/
│   ├── pages/
│   │   ├── Login.jsx          # Role selector
│   │   ├── GuestPortal.jsx    # SOS + Panic Mode
│   │   ├── StaffDashboard.jsx # Live feed + AI triage + Chat
│   │   └── CommandCenter.jsx  # Floor map + Analytics
│   ├── components/
│   │   ├── IncidentCard.jsx   # Live timer + escalation
│   │   ├── IncidentChat.jsx   # Staff coordination chat
│   │   ├── FloorPlanMap.jsx   # Severity heatmap
│   │   ├── ResponderMap.jsx   # Google Maps
│   │   ├── BroadcastBar.jsx   # Guest alert banner
│   │   └── SeverityBadge.jsx  # Color-coded badge
│   ├── services/
│   │   ├── geminiService.js   # Gemini Flash-Lite-Latest
│   │   └── incidentService.js # Firebase CRUD
│   ├── hooks/
│   │   └── useIncidents.js    # Real-time Firebase listener
│   └── context/
│       └── AuthContext.jsx    # Global auth state
├── vercel.json                # SPA routing fix
└── .env.example               # Environment template

---

##  Google Technologies Used

- **Google Gemini Flash-Lite-Latest** — AI incident triage 
  (confirmed Status 200, confidence 1.0)
- **Firebase Realtime Database** — Sub-500ms real-time sync
- **Firebase Authentication** — Anonymous + email auth
- **Google Maps JavaScript API** — Live responder tracking
- **Google Cloud Platform** — Hosting infrastructure

---

##  Team

**Team:** CrisisSync  
**Challenge:** Rapid Crisis Response — Hospitality Emergency Coordination  
**Hackathon:** Solution Challenge 2026 | Build with AI | Hack2Skill  
**Submission Deadline:** 28 April 2026
