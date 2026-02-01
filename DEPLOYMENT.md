# StarkUI Deployment Guide

This guide provides step-by-step instructions for deploying StarkUI with the frontend on Vercel and the backend on Railway.

## Prerequisites

- GitHub account
- Vercel account (sign up at https://vercel.com)
- Railway account (sign up at https://railway.app)
- Your repository pushed to GitHub

## Deployment Steps

### Step 1: Deploy Backend to Railway

1. **Sign in to Railway**
   - Go to https://railway.app
   - Sign in with your GitHub account

2. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Authorize Railway to access your GitHub account if needed
   - Select the `StarkUI` repository

3. **Configure the Service**
   - Railway will automatically detect the configuration from `railway.toml`
   - Alternatively, you can select "Deploy from Dockerfile" to use Docker
   - Wait for the deployment to complete (usually takes 2-5 minutes)

4. **Get Your Backend URL**
   - Once deployed, click on your service
   - Go to "Settings" → "Networking"
   - Click "Generate Domain" if not already generated
   - Copy your Railway URL (e.g., `https://your-app.railway.app`)
   - **Save this URL** - you'll need it for the frontend deployment

5. **Configure Environment Variables (Optional)**
   - Go to "Variables" tab
   - Railway automatically sets `PORT`
   - Add any additional variables from `backend/.env.example` if needed

6. **Verify Deployment**
   - Visit your Railway URL in a browser
   - You should see: `{"message":"Welcome to StarkUI Backend API","status":"online",...}`
   - Test the health endpoint: `https://your-app.railway.app/api/health`

### Step 2: Deploy Frontend to Vercel

1. **Sign in to Vercel**
   - Go to https://vercel.com
   - Sign in with your GitHub account

2. **Import Project**
   - Click "Add New..." → "Project"
   - Import your `StarkUI` GitHub repository
   - Authorize Vercel to access your GitHub account if needed

3. **Configure Build Settings**
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `./` (leave as default)
   - **Build Command**: Auto-detected from `vercel.json`
   - **Output Directory**: Auto-detected from `vercel.json`

4. **Set Environment Variables**
   - Before deploying, add environment variables:
   - Click "Environment Variables"
   - Add the following:
     ```
     Name: NEXT_PUBLIC_API_URL
     Value: https://your-app.railway.app (use your Railway URL from Step 1)
     ```
   - Apply to: Production, Preview, and Development

5. **Deploy**
   - Click "Deploy"
   - Wait for the deployment to complete (usually takes 2-3 minutes)
   - Vercel will provide you with a deployment URL (e.g., `https://your-app.vercel.app`)

6. **Verify Deployment**
   - Visit your Vercel URL
   - You should see the StarkUI interface
   - Check that "Backend Status" shows as online
   - Verify that "Jarvis System" displays capabilities

## Post-Deployment Configuration

### Custom Domains (Optional)

**For Vercel (Frontend):**
1. Go to your project settings in Vercel
2. Navigate to "Domains"
3. Add your custom domain
4. Follow DNS configuration instructions

**For Railway (Backend):**
1. Go to your service settings in Railway
2. Navigate to "Settings" → "Networking"
3. Add your custom domain
4. Configure DNS records as instructed

### CORS Configuration

If you use a custom domain for your frontend, update the backend CORS settings:

1. Edit `backend/src/index.js`
2. Update the CORS configuration to include your domain:
   ```javascript
   app.use(cors({
     origin: ['https://your-custom-domain.com', 'https://your-app.vercel.app']
   }));
   ```
3. Commit and push changes
4. Railway will automatically redeploy

## Monitoring and Logs

### Railway Backend Logs
1. Go to Railway dashboard
2. Click on your service
3. View real-time logs in the "Deployments" tab

### Vercel Frontend Logs
1. Go to Vercel dashboard
2. Click on your project
3. Navigate to "Deployments"
4. Click on a deployment to view logs

## Troubleshooting

### Backend Not Responding
- Check Railway logs for errors
- Verify environment variables are set correctly
- Ensure the PORT variable is not manually set (Railway sets it automatically)

### Frontend Can't Connect to Backend
- Verify `NEXT_PUBLIC_API_URL` is set correctly in Vercel
- Check that Railway backend is running
- Verify CORS is configured correctly
- Check browser console for errors

### Build Failures

**Frontend:**
- Check Vercel build logs
- Ensure all dependencies are in `package.json`
- Verify TypeScript types are correct

**Backend:**
- Check Railway build logs
- Ensure `package.json` scripts are correct
- Verify Node.js version compatibility

## Environment Variables Reference

### Frontend (Vercel)
| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | `https://your-app.railway.app` |

### Backend (Railway)
| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Server port (auto-set by Railway) | `3001` |
| `NODE_ENV` | Environment | `production` |

## Continuous Deployment

Both Vercel and Railway support automatic deployments:

- **Vercel**: Automatically deploys on push to your main branch
- **Railway**: Automatically deploys on push to your main branch

To deploy changes:
1. Make changes locally
2. Commit and push to GitHub
3. Both services will automatically deploy the updates

## Cost Considerations

- **Vercel**: Free tier includes hobby projects with reasonable limits
- **Railway**: Free trial with $5 credit, then pay-as-you-go pricing

Monitor your usage in each platform's dashboard to avoid unexpected charges.

## Support

- **Vercel Documentation**: https://vercel.com/docs
- **Railway Documentation**: https://docs.railway.app
- **Next.js Documentation**: https://nextjs.org/docs
- **Express.js Documentation**: https://expressjs.com

For project-specific issues, please open an issue on the GitHub repository.
