# 🛠 Architecture & Stack

## 💻 Stack Frontend
- **Next.js 16** (App Router)
- **Leaflet** via `react-leaflet` v5
- **Tailwind CSS v4** + **Framer Motion v12**
- **Jost Font** (Google Fonts)

## 🗄️ Base de Données
- **Prisma ORM** v7.6.0
- **Supabase** (PostgreSQL + PostGIS)
- Singleton Pattern dans `src/lib/prisma.js`

## 🏗️ Infrastructure
- **Docker** (Multi-stage build)
- **Docker Compose** pour le développement
- Déploiement standalone
