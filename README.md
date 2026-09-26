# 🌿 Green Campus — Reporting & Sustainability Management System

> **“Report. Resolve. Sustain.”**  
> A full-stack university environmental issue reporting and facilities remediation platform built as an academic Continuous Assessment / Capstone project.

---

## 📌 Project Overview

**Green Campus** empowers university students, faculty, and administrative staff to identify, report, track, and remediate environmental problems across all campus zones. From water pipeline leaks and unneeded lighting in empty classrooms to overflowing recycling bins and damaged botanical areas, Green Campus provides end-to-end transparency and operational efficiency.

The platform eliminates traditional verbal complaint bottlenecks by providing:
- Instant photo evidence upload with automated category & severity tagging.
- Unique sequential tracking identifiers (e.g., `GC-2026-00482`).
- Public community feed with privacy protection for anonymous reporters.
- Public audit timeline with timestamps and maintenance squad signatures.
- Facilities management dispatch console with status progression (`Pending` → `Under Review` → `Assigned` → `In Progress` → `Resolved`).
- Real-time environmental impact intelligence computed directly from the relational database.

---

## ✨ Key Features

### 🎓 For Students & Campus Community
- **Quick Environmental Reporting (`/report`):**
  - Dropdown selection of 8 categories (Water Leakage, Waste / Overflowing Bin, Littering, Electricity Wastage, AC / Appliance Wastage, Green Space / Plants, Waste Segregation, Other).
  - Pre-populated campus locations + custom location entry.
  - Specific landmark / room / floor input for precision locating.
  - Urgency & severity classification (Low, Medium, High).
  - Photographic evidence upload (JPG, PNG, WEBP up to 5MB) with instant client-side preview.
  - Anonymous reporting option to protect student privacy.
  - Interactive success confirmation displaying unique tracking code and confetti micro-interaction.
- **Report Tracking (`/track`):**
  - Lookup by Report Code (e.g., `GC-2026-00482`).
  - Visual 5-stage stepper timeline (`Report Submitted` → `Under Review` → `Assigned` → `In Progress` → `Resolved`).
  - View on-site inspection notes, technician dispatch logs, and timestamps.
- **Community Reports Feed (`/reports`):**
  - Public transparency board displaying recently logged campus issues.
  - Filter by Category, Status, Campus Location, and text search.
  - Masks student identity for anonymous submissions.
- **Personal Student Dashboard (`/dashboard`):**
  - Summary metrics: My Reports, Pending, In Progress, Resolved.
  - Personal environmental contribution statement.
  - Table of recent personal reports with quick tracking links.

### 🛡️ For Facilities & Campus Administration
- **Secure Admin Portal (`/admin`):**
  - Protected by role-based JWT authentication (`requireRole('admin')`).
  - Top-level operational metrics: Total Reports, Pending Triage, Active Dispatches, Resolved, High Priority.
  - Multi-parameter filter toolbar: Search, Category, Status, Severity, Campus Location.
  - Action modal for immediate status progression, squad assignment (`Campus Plumbing Squad`, `Campus Electrical Squad`, `Sanitation Services`, `Horticulture & Grounds`, `Estate Management`), and resolution notes.
  - In-depth Report Detail view (`/admin/reports/:id`).
  - Safe record deletion with confirmation safeguards.

### 📊 Sustainability Impact Dashboard (`/impact`)
- Live aggregations computed directly from SQL queries:
  - Total issues reported & resolved.
  - Resolution rate percentage.
  - Diverted solid waste (kg) metric.
  - Conserved water volume (liters) metric.
- Interactive Chart.js visual analytics:
  - Reports by Environmental Category (Total vs Resolved).
  - Status Breakdown Doughnut Chart.
  - Location Density / Hotspot Analysis.
  - Monthly Reporting & Resolution Trend Line Chart.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, Vite, Vanilla CSS Design System, Lucide React Icons, Chart.js, React-ChartJS-2, Canvas Confetti |
| **Backend** | Node.js (v24+), Express.js (REST API), CORS, Dotenv, Morgan |
| **Database** | SQLite3 with Promisified Query Wrapper (Relational SQL Schema with automated foreign keys and indexing) |
| **Authentication** | JSON Web Tokens (JWT) with BcryptJS password hashing (10 rounds) |
| **File Storage** | Multer local storage with MIME type validation (`image/jpeg`, `image/png`, `image/webp`) and 5MB size ceiling |

---

## 🗄️ Database Architecture

The application uses an SQLite relational database (`server/data/greencampus.db`) structured for seamless export to PostgreSQL:

```sql
-- 1. Users
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'student', -- 'student' or 'admin'
  department TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. Locations
CREATE TABLE locations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE NOT NULL,
  zone TEXT
);

-- 3. Reports
CREATE TABLE reports (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  report_code TEXT UNIQUE NOT NULL, -- e.g. GC-2026-00482
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  category TEXT NOT NULL,
  location TEXT NOT NULL,
  specific_area TEXT,
  description TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'Medium', -- 'Low', 'Medium', 'High'
  image_url TEXT,
  status TEXT NOT NULL DEFAULT 'Pending', -- 'Pending', 'Under Review', 'Assigned', 'In Progress', 'Resolved'
  assigned_to TEXT,
  anonymous INTEGER NOT NULL DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 4. Report Updates (Audit Timeline)
CREATE TABLE report_updates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  report_id INTEGER NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  note TEXT NOT NULL,
  updated_by TEXT NOT NULL DEFAULT 'Admin Staff',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

---

## 🚀 Quick Start & Installation

### Prerequisites
- Node.js (v18.0 or newer)
- npm or pnpm

### 1. Clone or Open Project Directory
```bash
cd green-campus
```

### 2. Configure Environment Variables
Inside `server/`, create a `.env` file (copied from `.env.example`):
```env
PORT=5000
JWT_SECRET=green-campus-college-project-secure-jwt-key-2026
DATABASE_PATH=./data/greencampus.db
UPLOAD_DIR=./uploads
```

### 3. Initialize & Seed Database
The project includes a comprehensive seeding script with 16 users and 30+ realistic campus reports across various categories, statuses, and locations:
```bash
cd server
node database/seed.js
cd ..
```

### 4. Run the Backend API Server
```bash
cd server
node server.js
```
The backend API will start on **http://localhost:5000**.
- Health Check: `http://localhost:5000/api/health`

### 5. Run the Frontend Client
In a separate terminal:
```bash
cd client
pnpm dev
# or npm run dev
```
The frontend application will start on **http://localhost:3000** with automatic proxying to the backend API.

---

## 🔑 Demo Credentials

To evaluate the system, pre-seeded accounts are provided with single-click prefill buttons on the login screen:

| Role | Email | Password | Scope & Privileges |
|---|---|---|---|
| **Admin** | `admin@greencampus.edu` | `admin123` | Facilities & Sustainability Office (All reports, status triage, squad assignment, deletions) |
| **Facility Mgr** | `maintenance@greencampus.edu` | `admin123` | Estate Management Division (Full administrative privileges) |
| **Student** | `aarav@campus.edu` | `student123` | Computer Science & Engineering (Submit reports, personal dashboard) |
| **Student** | `priya.singh@campus.edu` | `student123` | Environmental Studies (Submit reports, personal dashboard) |
| **New Student** | *(Self Register)* | *(Custom)* | Use `/register` to create a new student account instantly |

---

## 📂 Project Structure

```
green-campus/
├── package.json                   # Root workspace scripts
├── verify-system.cjs              # End-to-end automated API verification test
├── README.md                      # Comprehensive system documentation
│
├── server/                        # Express API & SQLite Data Layer
│   ├── package.json
│   ├── server.js                  # Express application entrypoint
│   ├── .env                       # Environment configuration
│   ├── .env.example
│   ├── database/
│   │   ├── db.js                  # Promisified SQLite wrapper
│   │   ├── init.js                # DDL table creation schema & indexes
│   │   └── seed.js                # 16 users, 30+ realistic campus reports
│   ├── middleware/
│   │   ├── auth.js                # JWT verification & role authorization
│   │   └── upload.js              # Multer file storage & MIME validation
│   ├── controllers/
│   │   ├── authController.js      # Student registration, login, profile stats
│   │   ├── reportController.js    # Create report, tracking, community feed
│   │   ├── adminController.js     # Admin triage, squad assignment, delete
│   │   └── statsController.js     # Live SQL metric calculations & chart datasets
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── reportRoutes.js
│   │   ├── adminRoutes.js
│   │   └── statsRoutes.js
│   ├── uploads/                   # Stored report evidence images
│   └── data/                      # SQLite database file (greencampus.db)
│
└── client/                        # Vite + React 19 Frontend
    ├── package.json
    ├── vite.config.js             # API proxy configuration (:3000 -> :5000)
    ├── index.html                 # Semantic HTML, Plus Jakarta Sans & Inter fonts
    └── src/
        ├── main.jsx               # React DOM root
        ├── App.jsx                # Browser history routing & layout
        ├── index.css              # Custom university sustainability design system
        ├── context/
        │   └── AuthContext.jsx    # Session management & user state
        ├── services/
        │   └── api.js             # API client with token injection
        ├── components/
        │   ├── Navbar.jsx         # Responsive navbar + mobile drawer
        │   ├── Footer.jsx         # University project footer
        │   ├── StatusBadge.jsx    # Status pill with Lucide icons
        │   ├── SeverityBadge.jsx  # Urgency tags (Low, Medium, High)
        │   ├── Timeline.jsx       # 5-stage visual progress stepper
        │   └── StatsStrip.jsx     # Live database statistics strip
        └── pages/
            ├── Home.jsx           # Landing page with live statistics
            ├── ReportIssue.jsx    # Form with image preview & confirmation
            ├── CommunityReports.jsx # Filterable public transparency feed
            ├── TrackReport.jsx    # Real-time report audit timeline
            ├── Impact.jsx         # Chart.js environmental analytics
            ├── About.jsx          # Mission, student impact, and vision
            ├── Login.jsx          # Auth with demo prefill helpers
            ├── Register.jsx       # Student registration
            ├── StudentDashboard.jsx # Personal report tracking
            ├── AdminDashboard.jsx # Admin triage and squad dispatch
            └── AdminReportDetails.jsx # In-depth admin report view
```

---

## 🔮 Future Roadmap & Enhancements

1. **IoT Sensor Ingestion:** Automatic ticket generation from smart ultrasonic water flowmeters and power monitors.
2. **Computer Vision Triage:** Automated AI identification of pipe corrosion and overflowing bin volume from uploaded photos.
3. **Push & SMS Alerts:** Web push and SMS notifications to dorm residents when maintenance in their hostel block begins.
4. **Inter-Hostel Sustainability League:** Gamified green points awarded to dormitories with the highest resolution and recycling compliance rates.
5. **PostgreSQL Cloud Deployment:** Drop-in migration via the structured relational SQL queries to AWS RDS or Supabase.

---

## 📄 License & Academic Attribution
Developed as an academic demonstration project for university facilities and student environmental bodies. Released under the MIT License.
