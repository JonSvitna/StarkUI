# StarkUI - Quick Start Guide

## 🚀 Local Development (Quick Start)

### Prerequisites
- Python 3.11+
- Node.js 18+
- PostgreSQL 14+

### 1. Start PostgreSQL
```bash
# macOS
brew services start postgresql@15

# Linux
sudo systemctl start postgresql

# Create database
createdb starkui
# OR: psql -U postgres -c "CREATE DATABASE starkui;"
```

### 2. Start Backend
```bash
cd backend

# Create and activate virtual environment
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set up environment (or use defaults)
export DATABASE_URL="postgresql://postgres:postgres@localhost:5432/starkui"
export BACKEND_CORS_ORIGINS="http://localhost:3000,http://127.0.0.1:3000"

# Run migrations
alembic upgrade head

# Start server
uvicorn app.main:app --reload
```

Backend available at: http://localhost:8000

### 3. Start Frontend
```bash
# New terminal
cd frontend

# Install dependencies
npm install

# Set environment (or use defaults)
export NEXT_PUBLIC_API_BASE_URL="http://localhost:8000"

# Start dev server
npm run dev
```

Frontend available at: http://localhost:3000

---

## 🧪 Testing the System

### Test Backend API
```bash
# Health check
curl http://localhost:8000/health

# Create a run
curl -X POST http://localhost:8000/api/runs \
  -H "Content-Type: application/json" \
  -d '{"title":"My First Run","description":"Testing StarkUI"}'

# List runs
curl http://localhost:8000/api/runs

# Create an event for run ID 1
curl -X POST http://localhost:8000/api/runs/1/events \
  -H "Content-Type: application/json" \
  -d '{"event_type":"success","message":"System initialized successfully!"}'

# Stream events (Server-Sent Events)
curl -N http://localhost:8000/api/runs/1/stream
```

### Test CORS
```bash
curl -H "Origin: http://localhost:3000" \
  -H "Access-Control-Request-Method: GET" \
  -X OPTIONS \
  http://localhost:8000/api/runs
```

Expected: Response includes `access-control-allow-origin: http://localhost:3000`

### Test SSE in Browser Console
Open http://localhost:3000 and run in browser console:
```javascript
const es = new EventSource('http://localhost:8000/api/runs/1/stream');
es.onmessage = (e) => console.log('Event:', JSON.parse(e.data));
es.onerror = (err) => console.error('Error:', err);
```

---

## ☁️ Railway Deployment

### Environment Variables to Set in Railway
```bash
DATABASE_URL=<automatically-set-by-railway-postgres>
BACKEND_CORS_ORIGINS=https://your-app.vercel.app,http://localhost:3000
JWT_SECRET_KEY=<generate-strong-secret>
ENABLE_JWT_PROTECTION=false
PORT=<automatically-set-by-railway>
```

### Generate JWT Secret
```bash
python3 -c "import secrets; print(secrets.token_urlsafe(32))"
```

### Railway Commands
```bash
# Deploy backend
railway up

# View logs
railway logs

# Get deployment URL
railway status
```

---

## 🔷 Vercel Deployment

### Environment Variables to Set in Vercel
```
NEXT_PUBLIC_API_BASE_URL=https://your-backend.railway.app
```

### Vercel Commands
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Deploy to production
vercel --prod
```

---

## 🔧 Quick Troubleshooting

### Backend won't start
```bash
# Check PostgreSQL is running
psql -U postgres -c "SELECT 1"

# Check database exists
psql -U postgres -l | grep starkui

# Re-run migrations
cd backend && alembic upgrade head
```

### Frontend can't connect
```bash
# Verify backend is running
curl http://localhost:8000/health

# Check environment variable
echo $NEXT_PUBLIC_API_BASE_URL

# Restart frontend
npm run dev
```

### CORS errors
```bash
# Check backend CORS config
curl http://localhost:8000/ | grep -i cors

# Verify BACKEND_CORS_ORIGINS includes your frontend URL
echo $BACKEND_CORS_ORIGINS
```

### SSE disconnects
- This is normal behavior - connections auto-reconnect
- Check browser Network tab for actual errors
- Verify no ad-blocker is blocking EventSource

---

## 📚 Useful Links

- Backend API Docs: http://localhost:8000/docs
- Frontend: http://localhost:3000
- PostgreSQL Shell: `psql -U postgres starkui`

---

## 💡 Key Features to Try

1. **Create a Run**: Click "Create New Run" button
2. **View Live Events**: Click on a run to see detail page
3. **Watch SSE**: Events appear in real-time in the right panel
4. **Create Tasks**: Use API to add tasks to a run
5. **System Map**: Visualize runs and tasks in the center panel

---

## 📝 Common Commands

### Backend
```bash
# Create new migration
alembic revision --autogenerate -m "description"

# Apply migrations
alembic upgrade head

# Rollback
alembic downgrade -1

# Start with custom port
uvicorn app.main:app --port 8080
```

### Frontend
```bash
# Build for production
npm run build

# Start production build
npm start

# Lint
npm run lint
```

### Database
```bash
# Connect to database
psql -U postgres starkui

# View tables
\dt

# View runs
SELECT * FROM runs;

# View events
SELECT * FROM events ORDER BY created_at DESC LIMIT 10;
```
