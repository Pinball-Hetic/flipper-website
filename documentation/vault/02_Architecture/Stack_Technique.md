# 🛠 Architecture & Stack

## 💻 Stack Frontend
- **Next.js 15** (App Router)
- **Leaflet** via `react-leaflet` (Dynamic Import)
- **Tailwind CSS** + **Framer Motion**
- **Jost Font** (Google Fonts)

## 🗄️ Base de Données
- **Prisma ORM** v7.5.0
- **Supabase** (PostgreSQL + PostGIS)
- Singleton Pattern dans `src/lib/prisma.js`

## 🏗️ Infrastructure
- **Docker** (Multi-stage build)
- **Docker Compose** pour le développement
- Déploiement standalone
