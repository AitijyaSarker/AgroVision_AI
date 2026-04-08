# Vercel Deployment Guide

## Prerequisites
- Vercel account (https://vercel.com)
- GitHub repository with your code pushed
- MongoDB Atlas connection string

## Environment Variables to Set in Vercel

In your Vercel project settings, add these environment variables:

```
MONGODB_URI=mongodb+srv://aitijyasarker_db_user:wtLpEZNasdRcTFnN@agrovision.11t3bdv.mongodb.net/
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-agrovision-2024
FRONTEND_URL=https://your-vercel-domain.vercel.app
NODE_ENV=production
```

## Deployment Steps

### 1. Push Code to GitHub
```bash
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main
```

### 2. Deploy to Vercel
Option A: Using Vercel CLI
```bash
npm i -g vercel
vercel
```

Option B: Using GitHub Integration
1. Go to https://vercel.com/new
2. Select your GitHub repository
3. Vercel will automatically detect Next.js/Vite configuration
4. Add environment variables in the "Environment Variables" section
5. Click "Deploy"

### 3. Update Environment Variables

After deployment, go to:
- Vercel Dashboard → Your Project → Settings → Environment Variables
- Add the variables listed above

### 4. Monitor Deployment

Check the deployment status in:
- Vercel Dashboard → Deployments
- Look for build logs and function logs

## Project Structure

```
├── dist/                 # Frontend build output
├── api/
│   └── index.js         # Backend API (Vercel Serverless Function)
├── src/                 # Frontend React code
├── vercel.json          # Vercel configuration
├── vite.config.ts       # Vite build configuration
└── package.json         # Dependencies
```

## Key Features

- ✅ Frontend hosted on Vercel
- ✅ Backend API runs as Vercel Serverless Functions
- ✅ MongoDB Atlas for database
- ✅ CORS enabled for frontend-backend communication
- ✅ JWT authentication configured
- ✅ Automatic deployments on git push

## Troubleshooting

### CORS Errors
- Make sure `FRONTEND_URL` is set correctly in environment variables
- Check that CORS origins in `api/index.js` include your Vercel domain

### MongoDB Connection Issues
- Verify `MONGODB_URI` is correct
- Check MongoDB Atlas IP whitelist includes Vercel IPs
- Add `0.0.0.0/0` to allow all IPs (for development)

### Build Failures
- Check build logs in Vercel dashboard
- Ensure all dependencies are in `package.json`
- Run `npm run build` locally to test

## API Endpoints

All API endpoints are available at:
```
https://your-vercel-domain.vercel.app/api/
```

Examples:
- POST `/api/auth/register` - User registration
- POST `/api/auth/login` - User login
- GET `/api/specialists` - Get available specialists
- GET `/api/users/profile/:id` - Get user profile
- POST `/api/messages` - Send message
- POST `/api/scans` - Create disease scan

## Notes

- Backend timeout is set to 60 seconds
- Memory limit is 3008 MB
- Vercel automatically rebuilds on git push to main branch
- All sensitive data should be in environment variables, not in code
