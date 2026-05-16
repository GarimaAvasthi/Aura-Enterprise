# Aura Enterprise Engine

A high-performance, real-time analytics and inventory management dashboard built to handle enterprise-scale operations (50,000+ SKUs).It transforms complex backend data into actionable, beautifully designed insights using modern React patterns, sophisticated data orchestration, and custom SVG visualization enhancements.

##  Key Features

  - **URL-Driven Architecture:** The entire dashboard state (filters, search queries, pagination) is synchronized with the URL. This allows executives to bookmark, share, and refresh deeply specific data views without losing context.
  - **Global Filter Pipeline:** A single centralized filtering mechanism propagates user selections to all components—from the KPI cards down to the data grid and analytics charts.
  - **Real-Time Polling:** Integrates `@tanstack/react-query` to automatically pull live updates from the backend every 10 seconds.
  - **Strict Data Integrity:** The backend simulation processes aggressive, real-time stock mutations, strictly enforcing non-negative integer boundaries (`Math.floor`) to guarantee flawless data representation.
  - **Risk Assessment (Bar Chart):** A dynamic, vertical layout highlighting the top 10 lowest stock items, featuring custom **SVG linear gradients** that transition from vibrant blue to deep navy.
  - **Portfolio Distribution (Pie Chart):** A financial-grade valuation breakdown of inventory categories, enhanced with a simulated **3D aesthetic** utilizing SVG drop-shadow filters, corner rounding, and slice beveling.
  - **Dedicated Reports View:** A focused, full-page `/reports` route that isolates the charts for executive presentations without the distraction of raw data grids.
  - **Activity Tracking:** Monitors newly added and removed inventory items.
  - **Dedicated Route:** The navigation bar's bell icon acts as an intelligent router, taking users to a full-screen `/notifications` dashboard for managing system alerts.

## Tech Stack

- **Frontend:** React 19, TypeScript, Vite 8, Tailwind CSS 4, React Router v7.
- **Data Fetching:** TanStack Query (React Query) for aggressive caching and live polling.
- **Visualizations:** Recharts (heavily customized with native SVG defs).
- **Backend:** Express.js (Node.js) with dynamic, in-memory data generation.

## 📦 Quick Start

1. **Install Dependencies:**
   ```bash
   npm install
   cd Backend && npm install
   ```

2. **Run the Backend (Port 5000):**
   ```bash
   cd Backend
   node server.js
   ```

3. **Run the Frontend (Port 5173):**
   ```bash
   npm run dev
   ```

