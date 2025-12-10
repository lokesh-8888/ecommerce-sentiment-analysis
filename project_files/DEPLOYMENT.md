# Deployment Guide for Render

This guide will help you deploy your E-Commerce Review Analyzer to Render.

## Prerequisites

1. GitHub account with your code pushed to: https://github.com/seeramyash/gen_ai
2. Render account (sign up at https://render.com)
3. Supabase credentials (already set up)

## Step 1: Push Your Code to GitHub

If you haven't pushed your code yet, run these commands:

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - E-Commerce Review Analyzer"

# Add your GitHub remote
git remote add origin https://github.com/seeramyash/gen_ai.git

# Push to GitHub
git branch -M main
git push -u origin main
```

## Step 2: Deploy Backend (Flask API)

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository: `seeramyash/gen_ai`
4. Configure the service:
   - **Name**: `review-analyzer-backend`
   - **Environment**: `Python 3`
   - **Region**: Choose closest to you
   - **Branch**: `main`
   - **Root Directory**: Leave empty (or `backend` if you want)
   - **Build Command**: `pip install -r backend/requirements.txt`
   - **Start Command**: `cd backend && gunicorn app:app --bind 0.0.0.0:$PORT --workers 2 --timeout 120`
   - **Plan**: Free

5. **Environment Variables**:
   - `VITE_SUPABASE_URL` = Your Supabase URL
   - `VITE_SUPABASE_ANON_KEY` = Your Supabase anon key
   - `PYTHON_VERSION` = `3.11.0`

6. Click **"Create Web Service"**

7. **Note**: The first deployment will take 10-15 minutes as it downloads the BERT model (~250MB)

8. Once deployed, copy the service URL (e.g., `https://review-analyzer-backend.onrender.com`)

## Step 3: Deploy Frontend (React App)

1. In Render Dashboard, click **"New +"** → **"Web Service"**
2. Connect the same GitHub repository: `seeramyash/gen_ai`
3. Configure the service:
   - **Name**: `review-analyzer-frontend`
   - **Environment**: `Node`
   - **Region**: Same as backend
   - **Branch**: `main`
   - **Root Directory**: Leave empty
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run serve`
   - **Plan**: Free

4. **Environment Variables**:
   - `VITE_SUPABASE_URL` = Your Supabase URL
   - `VITE_SUPABASE_ANON_KEY` = Your Supabase anon key
   - `VITE_API_BASE_URL` = Your backend URL from Step 2 (e.g., `https://review-analyzer-backend.onrender.com`)

5. Click **"Create Web Service"**

## Step 4: Update CORS in Backend (if needed)

If you get CORS errors, the Flask app already has CORS enabled, but you can verify in `backend/app.py`:

```python
from flask_cors import CORS
CORS(app)  # This allows all origins
```

## Step 5: Verify Deployment

1. **Backend Health Check**: Visit `https://your-backend-url.onrender.com/health`
   - Should return: `{"status": "healthy", "model": "distilbert-base-uncased-finetuned-sst-2-english"}`

2. **Frontend**: Visit your frontend URL
   - Should load the application
   - Test by analyzing a review

## Important Notes

### Free Tier Limitations

- **Sleep after inactivity**: Free services sleep after 15 minutes of inactivity
- **Cold starts**: First request after sleep takes 30-60 seconds
- **Build time**: First build takes longer due to model download

### Performance Tips

1. **Keep services awake**: Use a service like [UptimeRobot](https://uptimerobot.com) to ping your backend every 5 minutes
2. **Upgrade plan**: For production, consider Render's paid plans for better performance

### Troubleshooting

**Backend Issues:**
- Check build logs in Render dashboard
- Verify environment variables are set correctly
- Ensure Supabase credentials are correct
- Check that the model downloads successfully

**Frontend Issues:**
- Verify `VITE_API_BASE_URL` points to your backend URL
- Check browser console for CORS errors
- Ensure all environment variables are set

**CORS Errors:**
- The backend already has CORS enabled for all origins
- If issues persist, check that backend URL is correct in frontend env vars

## Alternative: Using render.yaml (Blueprints)

You can also use the `render.yaml` file for easier deployment:

1. Go to Render Dashboard
2. Click **"New +"** → **"Blueprint"**
3. Connect your GitHub repository
4. Render will automatically detect `render.yaml` and create both services
5. You'll still need to set environment variables manually

## Environment Variables Summary

### Backend:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `PYTHON_VERSION` (optional, defaults to 3.11.0)

### Frontend:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_API_BASE_URL` (your backend URL)

## URLs After Deployment

- **Backend**: `https://review-analyzer-backend.onrender.com`
- **Frontend**: `https://review-analyzer-frontend.onrender.com`

Update the frontend's `VITE_API_BASE_URL` to point to your backend URL!

## Next Steps

1. Set up custom domains (optional, paid feature)
2. Configure auto-deploy on git push
3. Set up monitoring and alerts
4. Consider upgrading to paid plan for production use

Good luck with your deployment! 🚀

