# EventEra 📍

EventEra is a modern web application designed to help communities discover, share, and enjoy free events happening nearby. It features a responsive React frontend with a brutalist-inspired design, powered by a Node.js Express backend and a Supabase PostgreSQL database.

## Project Structure

This repository contains both the frontend and backend applications:

- `/frontend`: A Vite + React application styled with Tailwind CSS. Includes user authentication, event exploration, and a map view.
- `/backend`: A Node.js + Express API server that handles business logic and interacts with the Supabase database.

## Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- A Supabase account and a new project

### Environment Setup

1. **Backend Configuration:**
   Navigate to `/backend` and create a `.env` file based on `.env.example`.
   ```env
   SUPABASE_URL=your_supabase_project_url
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   SUPABASE_ANON_KEY=your_supabase_anon_key
   PORT=5000
   FRONTEND_ORIGIN=http://localhost:5173
   ```

2. **Frontend Configuration:**
   Navigate to `/frontend` and create a `.env` file based on `.env.example`.
   ```env
   VITE_API_URL=http://localhost:5000
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

3. **Database Setup:**
   Run the SQL scripts located in `backend/src/migration.sql` and `backend/src/migration_v2.sql` in your Supabase SQL Editor. Also, create a public storage bucket named `avatars`.

### Running Locally

You'll need to run both the frontend and backend servers simultaneously.

**Start the Backend:**
```bash
cd backend
npm install
npm run dev
```

**Start the Frontend:**
```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at `http://localhost:5173`.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
