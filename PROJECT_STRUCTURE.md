# StarkUI - Project Structure

## 📁 Complete File Tree

```
StarkUI/
├── backend/                          # FastAPI Backend
│   ├── alembic/                     # Database Migrations
│   │   ├── versions/
│   │   │   └── 001_initial.py      # Initial DB schema
│   │   ├── env.py                  # Alembic environment
│   │   └── script.py.mako          # Migration template
│   ├── app/
│   │   ├── api/
│   │   │   └── routes.py           # All API endpoints
│   │   ├── core/
│   │   │   ├── config.py           # Settings & configuration
│   │   │   ├── events.py           # SSE event broadcaster
│   │   │   └── jwt.py              # JWT utilities
│   │   ├── db/
│   │   │   └── session.py          # Database session management
│   │   ├── models/
│   │   │   └── models.py           # SQLAlchemy models
│   │   ├── schemas/
│   │   │   └── schemas.py          # Pydantic schemas
│   │   └── main.py                 # FastAPI application
│   ├── alembic.ini                 # Alembic configuration
│   ├── requirements.txt            # Python dependencies
│   ├── package.json                # Metadata for Railway
│   └── .env.example                # Environment variables template
│
├── frontend/                        # Next.js Frontend
│   ├── src/
│   │   ├── app/
│   │   │   ├── runs/
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx    # Run detail page
│   │   │   ├── globals.css         # Global styles + Tailwind
│   │   │   ├── layout.tsx          # Root layout
│   │   │   └── page.tsx            # Dashboard home page
│   │   ├── components/
│   │   │   ├── LiveFeed.tsx        # SSE event feed component
│   │   │   ├── RunsList.tsx        # Runs sidebar list
│   │   │   └── SystemMap.tsx       # Visual run/task map
│   │   └── lib/
│   │       ├── api.ts              # API client wrapper
│   │       └── types.ts            # TypeScript type definitions
│   ├── next.config.js              # Next.js configuration
│   ├── postcss.config.js           # PostCSS configuration
│   ├── tailwind.config.js          # Tailwind CSS configuration
│   ├── tsconfig.json               # TypeScript configuration
│   ├── package.json                # Node dependencies
│   └── .env.example                # Environment variables template
│
├── .github/
│   └── workflows/
│       └── build.yml               # CI/CD validation workflow
│
├── .gitignore                      # Git ignore rules
├── Dockerfile                      # Docker build (Railway alt)
├── railway.toml                    # Railway configuration
├── vercel.json                     # Vercel configuration
├── package.json                    # Root workspace config
├── README.md                       # Main documentation
├── QUICKSTART.md                   # Quick start guide
└── PROJECT_STRUCTURE.md            # This file
```

## 📄 Key Files Explained

### Backend

**`backend/app/main.py`** (70 lines)
- FastAPI application entry point
- CORS middleware configuration
- Health check endpoint
- Startup logging

**`backend/app/api/routes.py`** (230 lines)
- All REST API endpoints:
  - Runs: POST, GET list, GET detail
  - Tasks: POST, GET list
  - Events: POST, GET stream (SSE)
  - Patches: POST preview, POST apply
- SSE event streaming implementation
- Database session management

**`backend/app/core/config.py`** (50 lines)
- Pydantic settings management
- Environment variable parsing
- CORS origins parsing
- JWT configuration

**`backend/app/core/events.py`** (60 lines)
- In-memory pub/sub for SSE
- Event broadcaster with queue management
- Automatic cleanup of dead connections

**`backend/app/models/models.py`** (110 lines)
- SQLAlchemy ORM models:
  - Run (with status enum)
  - Task (with status enum)
  - Event (with type enum)
  - Patch (with status enum)
- Relationships and foreign keys
- Automatic timestamps

**`backend/app/schemas/schemas.py`** (80 lines)
- Pydantic request/response schemas
- Data validation
- Type safety for API

**`backend/alembic/versions/001_initial.py`** (90 lines)
- Initial database migration
- Creates all tables
- Sets up indexes and foreign keys

### Frontend

**`frontend/src/app/page.tsx`** (120 lines)
- Main dashboard layout
- Three-panel design:
  - Left: Runs sidebar
  - Center: System map
  - Right: Live feed
- Run creation functionality

**`frontend/src/app/runs/[id]/page.tsx`** (240 lines)
- Run detail page
- SSE connection for live updates
- Task list display
- Event timeline
- Auto-reconnecting EventSource

**`frontend/src/components/LiveFeed.tsx`** (170 lines)
- SSE event feed component
- Event type color coding
- Connection status indicator
- Auto-scroll to latest
- Reconnection logic

**`frontend/src/components/RunsList.tsx`** (85 lines)
- Runs sidebar component
- Status badges
- Navigation to run details
- Create button

**`frontend/src/components/SystemMap.tsx`** (200 lines)
- Visual system map
- SVG-based visualization
- Run and task nodes
- Statistics display

**`frontend/src/lib/api.ts`** (80 lines)
- API client wrapper
- Fetch with error handling
- EventSource factory
- TypeScript generics

**`frontend/src/lib/types.ts`** (50 lines)
- TypeScript type definitions
- Matches backend schemas
- Run, Task, Event, Patch interfaces

### Configuration

**`railway.toml`**
- Railway-specific deployment config
- Build and start commands
- Automatic migration execution

**`vercel.json`**
- Vercel deployment configuration
- Build settings for Next.js

**`Dockerfile`**
- Alternative deployment method
- Python 3.11 base image
- Backend-only container

**`.github/workflows/build.yml`**
- CI/CD pipeline
- Backend tests with PostgreSQL service
- Frontend build validation
- Linting checks

## 🔢 Code Statistics

- **Total Lines of Code**: ~2,500
- **Backend**: ~900 lines (Python)
- **Frontend**: ~1,200 lines (TypeScript/React)
- **Config/Docs**: ~400 lines

## 🎯 Data Flow

1. **User Action** (Frontend)
   - User clicks "Create Run"
   - `apiClient.post('/api/runs', data)`

2. **API Request** (Backend)
   - FastAPI receives request
   - Validates with Pydantic schema
   - Creates database record
   - Returns response

3. **Database** (PostgreSQL)
   - SQLAlchemy persists data
   - Relationships maintained
   - Timestamps auto-updated

4. **Real-time Events** (SSE)
   - Event created via POST
   - Saved to database
   - Broadcast to subscribers
   - Frontend receives update
   - UI updates automatically

## 🔐 Security Features

- CORS with explicit origin allowlist
- JWT utilities (ready, not enforced)
- SQL injection protection (SQLAlchemy)
- XSS protection (React escaping)
- Environment-based secrets
- No hardcoded credentials

## 🚀 Deployment Architecture

```
[User Browser]
      ↓
[Vercel - Frontend]
      ↓ HTTP/SSE
[Railway - Backend]
      ↓
[Railway - PostgreSQL]
```

All communication secured via HTTPS in production.
