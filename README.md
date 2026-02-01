# StarkUI
Jarvis Completion System

A modern full-stack application with a Next.js frontend deployed on Vercel and an Express.js backend deployed on Railway.

## 🏗️ Architecture

- **Frontend**: Next.js (React) - Deployed on Vercel
- **Backend**: Express.js (Node.js) - Deployed on Railway

## 📦 Project Structure

```
StarkUI/
├── frontend/          # Next.js frontend application
│   ├── src/
│   │   └── app/      # App router pages and components
│   ├── public/       # Static assets
│   └── package.json
├── backend/          # Express.js backend API
│   ├── src/
│   │   └── index.js # Main server file
│   └── package.json
├── vercel.json       # Vercel deployment configuration
├── railway.toml      # Railway deployment configuration
└── Dockerfile        # Docker configuration for Railway
```

## 🚀 Deployment

### Frontend (Vercel)

1. **Connect Repository to Vercel**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "Add New Project"
   - Import your GitHub repository

2. **Configure Build Settings**
   - Framework Preset: Next.js
   - Root Directory: `./` (Vercel will use the vercel.json configuration)
   - Build Command: Auto-detected from vercel.json
   - Output Directory: Auto-detected

3. **Environment Variables**
   - Add `NEXT_PUBLIC_API_URL` with your Railway backend URL
   - Example: `https://your-app.railway.app`

4. **Deploy**
   - Click "Deploy" and Vercel will automatically build and deploy your frontend

### Backend (Railway)

1. **Connect Repository to Railway**
   - Go to [Railway Dashboard](https://railway.app/dashboard)
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository

2. **Configure Deployment**
   - Railway will automatically detect the `railway.toml` configuration
   - Alternatively, it can use the `Dockerfile` for containerized deployment

3. **Environment Variables**
   - Railway will automatically set `PORT` variable
   - Add any additional environment variables from `backend/.env.example`

4. **Deploy**
   - Railway will automatically build and deploy your backend
   - Note your Railway deployment URL

5. **Update Frontend Environment**
   - Go back to Vercel and update `NEXT_PUBLIC_API_URL` with your Railway URL
   - Redeploy frontend if needed

## 💻 Local Development

### Prerequisites
- Node.js 18 or higher
- npm or yarn

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/JonSvitna/StarkUI.git
   cd StarkUI
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   # Frontend
   cp frontend/.env.example frontend/.env.local
   
   # Backend
   cp backend/.env.example backend/.env
   ```

4. **Run development servers**
   ```bash
   # Run both frontend and backend
   npm run dev
   
   # Or run individually
   npm run dev --workspace=frontend  # Frontend on http://localhost:3000
   npm run dev --workspace=backend   # Backend on http://localhost:3001
   ```

### Individual Commands

**Frontend:**
```bash
cd frontend
npm run dev    # Start development server
npm run build  # Build for production
npm run start  # Start production server
```

**Backend:**
```bash
cd backend
npm run dev    # Start development server with hot reload
npm start      # Start production server
```

## 📝 API Endpoints

### Backend API

- `GET /` - Welcome message and status
- `GET /api/health` - Health check endpoint
- `GET /api/jarvis` - Jarvis system information and capabilities

## 🔧 Configuration Files

### vercel.json
Configuration for Vercel deployment, specifying build commands and framework settings.

### railway.toml
Configuration for Railway deployment, specifying build and start commands.

### Dockerfile
Alternative deployment method for Railway using Docker containers.

## 📄 License

MIT
