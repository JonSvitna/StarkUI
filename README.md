# StarkUI - Tony Stark Cockpit Dashboard

A production-ready orchestration dashboard with a **FastAPI backend on Railway** and a **Next.js frontend on Vercel**. Real-time event streaming, PostgreSQL persistence, and a dark glassmorphism "Tony Stark cockpit" aesthetic.

## 🏗️ Architecture

- **Frontend**: Next.js 14 (App Router) + React + Tailwind CSS - Deployed on **Vercel**
- **Backend**: FastAPI + SQLAlchemy 2.0 + Alembic - Deployed on **Railway**
- **Database**: PostgreSQL (Railway or external)
- **Real-time**: Server-Sent Events (SSE) for live updates

## ✨ Features

### Backend Orchestration API
- ✅ **Runs**: Create and manage execution runs
- ✅ **Tasks**: Associate tasks with runs
- ✅ **Events**: Append and stream events in real-time
- ✅ **Patches**: Preview and apply code patches (placeholder for git integration)
- ✅ **SSE Streaming**: Live event feed with automatic keep-alive
- ✅ **JWT Ready**: JWT utilities included (not enforced by default)
- ✅ **CORS**: Environment-driven allowlist for secure cross-origin requests

### Frontend Dashboard
- ✅ **Tony Stark Aesthetic**: Dark glassmorphism panels with smooth animations
- ✅ **Three-Panel Layout**:
  - **Left**: Runs list with quick actions
  - **Center**: System map + Run details
  - **Right**: Live agent feed (SSE events)
- ✅ **Real-time Updates**: Auto-reconnecting SSE connections
- ✅ **TypeScript**: Full type safety

## 📦 Project Structure

```
StarkUI/
├── backend/               # FastAPI backend
│   ├── app/
│   │   ├── api/          # API routes
│   │   ├── core/         # Config, JWT, events
│   │   ├── db/           # Database session
│   │   ├── models/       # SQLAlchemy models
│   │   └── schemas/      # Pydantic schemas
│   ├── alembic/          # Database migrations
│   └── requirements.txt
├── frontend/             # Next.js frontend
│   ├── src/
│   │   ├── app/         # Pages (App Router)
│   │   ├── components/  # React components
│   │   └── lib/         # API client, types
│   └── package.json
└── README.md
```

## 🚀 Local Development Setup

### Prerequisites
- **Python 3.11+**
- **Node.js 18+**
- **PostgreSQL 14+**

### Step 1: Clone Repository

```bash
git clone https://github.com/JonSvitna/StarkUI.git
cd StarkUI
```

### Step 2: Set Up Database

```bash
# Install PostgreSQL (if not already installed)
# macOS:
brew install postgresql@15
brew services start postgresql@15

# Ubuntu/Debian:
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql

# Create database
psql -U postgres
CREATE DATABASE starkui;
\q
```

### Step 3: Set Up Backend

```bash
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Copy environment file and configure
cp .env.example .env
# Edit .env and set DATABASE_URL if needed

# Run migrations
alembic upgrade head

# Start backend server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Backend will be available at **http://localhost:8000**
- API docs: **http://localhost:8000/docs**
- Health check: **http://localhost:8000/health**

### Step 4: Set Up Frontend

```bash
# Open new terminal
cd frontend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env.local
# Default NEXT_PUBLIC_API_BASE_URL=http://localhost:8000 should work

# Start frontend dev server
npm run dev
```

Frontend will be available at **http://localhost:3000**

### Step 5: Test the System

1. **Open frontend**: http://localhost:3000
2. **Create a Run**: Click "Create New Run" button
3. **View Run Details**: Click on the run in the sidebar
4. **Watch Live Events**: Events appear in real-time in the right panel

## 🌐 Production Deployment

### Backend: Deploy to Railway

1. **Create Railway Project**:
   ```bash
   # Install Railway CLI
   npm install -g @railway/cli
   
   # Login
   railway login
   
   # Create project
   railway init
   ```

2. **Add PostgreSQL**:
   - In Railway dashboard, click "New" → "Database" → "PostgreSQL"
   - Railway will automatically set `DATABASE_URL` env var

3. **Set Environment Variables**:
   ```bash
   railway variables set BACKEND_CORS_ORIGINS="https://your-app.vercel.app,http://localhost:3000"
   railway variables set JWT_SECRET_KEY="your-production-secret-key"
   railway variables set ENABLE_JWT_PROTECTION=false
   ```

4. **Deploy**:
   ```bash
   railway up
   ```
   
   Railway will automatically:
   - Detect FastAPI
   - Install dependencies from `requirements.txt`
   - Run migrations with `alembic upgrade head`
   - Start server on dynamically assigned PORT

5. **Get Your Backend URL**:
   - Go to Railway dashboard → Your service → Settings → Networking
   - Note your Railway URL (e.g., `https://starkui-production.up.railway.app`)

### Frontend: Deploy to Vercel

1. **Connect Repository**:
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "Add New Project"
   - Import your GitHub repository

2. **Configure Build Settings**:
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `./`
   - Keep other settings as default

3. **Set Environment Variables**:
   ```
   NEXT_PUBLIC_API_BASE_URL=https://starkui-production.up.railway.app
   ```
   (Use your actual Railway URL from previous step)

4. **Deploy**:
   - Click "Deploy"
   - Vercel will build and deploy automatically

5. **Update Backend CORS**:
   - Go back to Railway
   - Update `BACKEND_CORS_ORIGINS` to include your Vercel domain:
     ```bash
     railway variables set BACKEND_CORS_ORIGINS="https://your-app.vercel.app"
     ```

## 🔧 Configuration

### Backend Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://...` | Yes |
| `PORT` | Server port | `8000` | No |
| `BACKEND_CORS_ORIGINS` | Comma-separated allowed origins | `http://localhost:3000,...` | Yes |
| `JWT_SECRET_KEY` | Secret for JWT signing | `dev-secret...` | No |
| `ENABLE_JWT_PROTECTION` | Enable JWT auth | `false` | No |
| `DEBUG` | Debug mode | `false` | No |

### Frontend Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `NEXT_PUBLIC_API_BASE_URL` | Backend API URL | `http://localhost:8000` | Yes |

## 🐛 CORS Troubleshooting

### Problem: "CORS policy: No 'Access-Control-Allow-Origin' header"

**Solution**:
1. Check backend logs for configured origins
2. Ensure `BACKEND_CORS_ORIGINS` includes your frontend URL
3. For local dev, include both:
   ```
   BACKEND_CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
   ```
4. For production, include your Vercel domain:
   ```
   BACKEND_CORS_ORIGINS=https://your-app.vercel.app
   ```

### Problem: SSE connection fails

**Solution**:
1. Verify backend is running and accessible
2. Check browser console for connection errors
3. Test endpoint directly: `curl http://localhost:8000/api/runs/1/stream`
4. Ensure no ad-blockers are blocking EventSource connections

## 🧪 Testing

### Test Backend Endpoints

```bash
# Health check
curl http://localhost:8000/health

# Create a run
curl -X POST http://localhost:8000/api/runs \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Run","description":"Testing the API"}'

# List runs
curl http://localhost:8000/api/runs

# Get run details
curl http://localhost:8000/api/runs/1

# Create event
curl -X POST http://localhost:8000/api/runs/1/events \
  -H "Content-Type: application/json" \
  -d '{"event_type":"info","message":"Test event"}'

# Stream events (SSE)
curl -N http://localhost:8000/api/runs/1/stream
```

### Test CORS

```bash
# Test from different origin
curl -H "Origin: http://localhost:3000" \
  -H "Access-Control-Request-Method: GET" \
  -H "Access-Control-Request-Headers: Content-Type" \
  -X OPTIONS \
  http://localhost:8000/api/runs
```

Should return `access-control-allow-origin: http://localhost:3000`

### Test SSE in Browser

```javascript
// Open browser console on http://localhost:3000
const eventSource = new EventSource('http://localhost:8000/api/runs/1/stream');
eventSource.onmessage = (event) => console.log('Event:', JSON.parse(event.data));
eventSource.onerror = (error) => console.error('SSE Error:', error);
```

## 📚 API Documentation

Once backend is running, visit:
- **Interactive API Docs**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### Key Endpoints

- `POST /api/runs` - Create a new run
- `GET /api/runs` - List all runs
- `GET /api/runs/{id}` - Get run details
- `POST /api/runs/{id}/tasks` - Create task
- `GET /api/runs/{id}/tasks` - List tasks
- `POST /api/runs/{id}/events` - Create event
- `GET /api/runs/{id}/stream` - SSE stream
- `POST /api/patches/preview` - Preview patch
- `POST /api/patches/apply` - Apply patch

## 🔐 JWT Setup (Optional)

JWT utilities are included but **not enforced by default**. To enable:

1. Generate a strong secret key:
   ```bash
   python -c "import secrets; print(secrets.token_urlsafe(32))"
   ```

2. Set environment variables:
   ```bash
   JWT_SECRET_KEY=<your-generated-secret>
   ENABLE_JWT_PROTECTION=true
   ```

3. The system is now JWT-ready for future auth implementation.

## 🛠️ Development Commands

### Backend
```bash
# Start server
uvicorn app.main:app --reload

# Create new migration
alembic revision --autogenerate -m "description"

# Apply migrations
alembic upgrade head

# Rollback migration
alembic downgrade -1

# Run tests (when added)
pytest
```

### Frontend
```bash
# Dev server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint
npm run lint
```

## 📝 Database Migrations

Migrations are managed with Alembic. The initial migration creates:
- `runs` table
- `tasks` table  
- `events` table
- `patches` table

To create a new migration after model changes:
```bash
cd backend
alembic revision --autogenerate -m "Add new field"
alembic upgrade head
```

## 🚨 Common Issues

### Backend won't start
- Check PostgreSQL is running
- Verify `DATABASE_URL` is correct
- Run `alembic upgrade head` to apply migrations

### Frontend can't connect to backend
- Verify backend is running on expected port
- Check `NEXT_PUBLIC_API_BASE_URL` matches backend URL
- Review CORS configuration

### SSE disconnects
- This is normal; connections auto-reconnect
- Check network tab for actual errors
- Verify no proxy/firewall is blocking SSE

## 📄 License

MIT

## 🙏 Support

- **Vercel Docs**: https://vercel.com/docs
- **Railway Docs**: https://docs.railway.app
- **FastAPI Docs**: https://fastapi.tiangolo.com
- **Next.js Docs**: https://nextjs.org/docs
