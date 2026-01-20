# 🏆 Tournament Manager (Next.js + Supabase)

A professional tournament management platform designed for real-time interaction and automated bracket generation.

## 🚀 Overview
This system allows organizers to create and manage tournaments with automated seeding based on player rankings. It features a real-time interactive ladder, secure email-verified registration, and complex concurrency management to handle participant limits and score submission.

## 🛠 Tech Stack
- **Framework:** Next.js 14+ (App Router)
- **Database:** PostgreSQL via Supabase
- **ORM:** Prisma
- **Styling:** Tailwind CSS
- **Real-time:** Supabase Realtime (WebSockets)
- **Deployment:** Vercel

## ✨ Key Features
- **Secure Authentication:** User registration with 24-hour expiring email confirmation links.
- **Automated Seeding:** High-logic seeding algorithm that pairs players by rank after the deadline passes.
- **Interactive Ladder:** Real-time visual bracket (SVG/Canvas) that updates instantly when scores are submitted.
- **Concurrency Control:** Atomic database transactions to handle participant limits and conflicting result entries.
- **Maps Integration:** Google Maps API for tournament location visualization.

## 🛠 Installation & Setup
1. **Clone the repo:**
   git clone https://github.com/jesiekjakub/tournament-manager-nextjs.git <br>
   cd tournament-manager-nextjs
