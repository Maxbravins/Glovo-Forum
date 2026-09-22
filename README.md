# Glovo Forum - Rider & Customer Community Platform 🛵

A modern, full-stack forum web application built with **Node.js (Express + JavaScript + Prisma ORM)** backend and **React (Vite + JavaScript + CSS Design System)** frontend. 

Designed specifically for Glovo riders and customers to discuss delivery experiences, ask questions, upload gear photos, and engage in threaded comment conversations.

---

## 🌟 Features

- **Nested Replies (Threaded Comments)**: Reply directly to any comment with unlimited nesting depth, visual line connectors, and inline reply forms.
- **Photo Uploads**: Attach photos to posts, comment replies, and user profiles (powered by Multer).
- **Glovo Aesthetic Design System**: Custom dark-mode UI with signature Glovo yellow/orange (`#FFC244`), rider badges, reaction counters, and glassmorphism navbar.
- **Role-Based Badges & Auth**: User, Glovo Rider, and Admin roles with JWT authentication & password hashing.
- **Admin Moderation Panel**: Real-time stats dashboard, user management, and moderation capabilities.
- **Legacy PHP Archive**: Historical PHP files are safely archived in `/legacy_php`.

---

## 📁 Directory Structure

```
Glovo_Forum/
├── backend/                  # Node.js Express & JavaScript API server
│   ├── prisma/
│   │   ├── schema.prisma     # SQLite / MySQL schema
│   │   └── seed.js           # Initial categories & demo users seed
│   ├── uploads/              # Photo attachments storage
│   └── src/                  # Controllers, Middleware, Routes & Server (JS)
│
├── frontend/                 # React + Vite Single Page Application (JS/JSX)
│   └── src/
│       ├── components/       # CommentItem (nested), PostCard, PhotoUploader, Navbar
│       ├── pages/            # Home, PostDetail, AdminDashboard, Auth pages
│       └── styles/           # CSS Design System
│
└── legacy_php/               # Archived original PHP scripts
```

---

## 🚀 Quick Start Guide

### 1. Start Backend API Server
```bash
cd backend
npm install                  # Install dependencies (if needed)
npx prisma db push           # Setup SQLite database
node prisma/seed.js          # Seed default categories & demo accounts
npm run dev                  # Starts server on http://localhost:5000
```

### 2. Start Frontend App
```bash
cd frontend
npm install                  # Install dependencies (if needed)
npm run dev                  # Starts React app on http://localhost:5173
```

---

## 🔑 Demo Login Accounts

Password for all demo accounts is **`password123`**:

| Role | Username | Email |
|---|---|---|
| **Admin** | `GlovoAdmin` | `admin@glovo.com` |
| **Rider** | `MarcoRider` | `rider@glovo.com` |
| **User** | `SarahDev` | `customer@glovo.com` |
