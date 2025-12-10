# Complete Setup Instructions

## Quick Start Guide

Follow these steps to get the E-Commerce Review Sentiment Analysis application running.

## Step 1: Prerequisites

Ensure you have the following installed:
- **Node.js** (version 16 or higher) - [Download](https://nodejs.org/)
- **Python** (version 3.8 or higher) - [Download](https://www.python.org/downloads/)
- **pip** (comes with Python)
- **Git** (optional, for cloning)

## Step 2: Supabase Setup

1. Go to [Supabase](https://supabase.com) and create a free account
2. Create a new project
3. Wait for the project to be provisioned (takes ~2 minutes)
4. Go to Project Settings > API
5. Copy the following:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon/public key** (starts with `eyJ...`)

## Step 3: Backend Setup

### 3.1 Create Virtual Environment

Open terminal/command prompt and navigate to the project directory:

```bash
cd backend
```

Create a Python virtual environment:

**On macOS/Linux:**
```bash
python3 -m venv venv
source venv/bin/activate
```

**On Windows:**
```bash
python -m venv venv
venv\Scripts\activate
```

You should see `(venv)` in your terminal prompt.

### 3.2 Install Python Dependencies

With the virtual environment activated:

```bash
pip install -r requirements.txt
```

This will install:
- Flask (web framework)
- Flask-CORS (enable cross-origin requests)
- Transformers (HuggingFace library for BERT)
- PyTorch (deep learning framework)
- Supabase client
- Other dependencies

**Note**: First installation will take 5-10 minutes as it downloads the BERT model (~250MB).

### 3.3 Configure Environment Variables

Create a `.env` file in the `backend/` directory:

```bash
# On macOS/Linux
touch .env

# On Windows
type nul > .env
```

Edit the `.env` file and add your Supabase credentials:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

Replace with your actual Supabase URL and key from Step 2.

### 3.4 Start Flask Server

```bash
python app.py
```

You should see:
```
Loading model: distilbert-base-uncased-finetuned-sst-2-english
Flask server starting...
 * Running on http://0.0.0.0:5000
```

**Keep this terminal window open.** The backend server is now running.

## Step 4: Frontend Setup

Open a **new terminal window** (keep the backend running in the first one).

### 4.1 Navigate to Project Root

```bash
cd /path/to/project
```

(Not the backend folder, but the main project folder)

### 4.2 Install Node Dependencies

```bash
npm install
```

This installs React, TypeScript, Tailwind CSS, Chart.js, and other frontend dependencies.

### 4.3 Configure Environment Variables

Edit the `.env` file in the **project root** (not in backend folder):

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

Use the same credentials from Step 2.

### 4.4 Start Development Server

```bash
npm run dev
```

You should see:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

## Step 5: Access the Application

Open your web browser and go to:
```
http://localhost:5173
```

You should see the E-Commerce Review Analyzer interface with four tabs:
1. Single Review
2. Aspect Analysis
3. Batch Analysis
4. Dashboard

## Step 6: Test the Application

### Test Single Review Analysis
1. Click on "Single Review" tab
2. Enter a sample review:
   ```
   This product is amazing! The battery life is excellent and the camera quality is superb. Highly recommend!
   ```
3. Click "Analyze Sentiment"
4. You should see results showing Positive sentiment with confidence scores

### Test Aspect Analysis
1. Click on "Aspect Analysis" tab
2. Enter a detailed review:
   ```
   The battery life is incredible and lasts all day. The camera takes beautiful photos. However, the build quality feels cheap and the screen brightness is poor in sunlight.
   ```
3. Click "Extract Aspects"
4. You should see strengths (battery, camera) and weaknesses (quality, screen)

### Test Batch Analysis
1. Click on "Batch Analysis" tab
2. Enter multiple reviews (one per line):
   ```
   Great product! Love it.
   Terrible quality, very disappointed.
   Good value for money.
   Fast delivery and excellent packaging.
   ```
3. Click "Analyze All Reviews"
4. View results in the table with summary statistics

### Test Dashboard
1. Click on "Dashboard" tab
2. View analytics from all previously analyzed reviews
3. See pie chart and bar chart visualizations

## Troubleshooting

### Backend Issues

**Issue: "Module not found" error**
- Solution: Make sure virtual environment is activated
- Run: `pip install -r requirements.txt` again

**Issue: "Port 5000 already in use"**
- Solution: Kill the process using port 5000 or change the port
- On macOS/Linux: `lsof -ti:5000 | xargs kill -9`
- On Windows: `netstat -ano | findstr :5000` then `taskkill /PID <PID> /F`

**Issue: Model download fails**
- Solution: Check internet connection
- Manually download model:
  ```python
  from transformers import AutoTokenizer, AutoModelForSequenceClassification
  AutoTokenizer.from_pretrained("distilbert-base-uncased-finetuned-sst-2-english")
  AutoModelForSequenceClassification.from_pretrained("distilbert-base-uncased-finetuned-sst-2-english")
  ```

### Frontend Issues

**Issue: "Failed to analyze review" error**
- Solution: Ensure Flask backend is running on port 5000
- Check browser console for CORS errors
- Verify `.env` file has correct Supabase credentials

**Issue: Charts not displaying**
- Solution: Clear browser cache
- Open browser console and check for JavaScript errors
- Ensure you have analyzed some reviews first

**Issue: Port 5173 already in use**
- Solution: Kill the process or change port
- Vite will automatically suggest an alternative port

## Verifying Everything Works

### Check Backend Health
Open in browser or use curl:
```bash
curl http://localhost:5000/health
```

Should return:
```json
{
  "status": "healthy",
  "model": "distilbert-base-uncased-finetuned-sst-2-english"
}
```

### Check Frontend Connection
In browser console (F12), check for:
- No CORS errors
- Successful API calls to `http://localhost:5000`

### Check Database Connection
After analyzing a review:
1. Go to Supabase dashboard
2. Navigate to Table Editor
3. Open `reviews` table
4. You should see your analyzed reviews

## Production Deployment

### Backend Deployment
For production, use a WSGI server:

```bash
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

### Frontend Deployment
Build the React app:

```bash
npm run build
```

Deploy the `dist/` folder to:
- Vercel
- Netlify
- AWS S3 + CloudFront
- GitHub Pages
- Any static hosting service

Update API_BASE_URL in `src/services/api.ts` to your production backend URL.

## Architecture Overview

```
User Browser (http://localhost:5173)
         ↓
    React Frontend
         ↓
    API Calls (Axios)
         ↓
    Flask Backend (http://localhost:5000)
         ↓
    BERT Model (Transformers)
         ↓
    Predictions
         ↓
    Supabase Database
         ↓
    Dashboard Analytics
```

## Common Commands Reference

### Backend
```bash
# Activate virtual environment
source venv/bin/activate  # macOS/Linux
venv\Scripts\activate     # Windows

# Install dependencies
pip install -r requirements.txt

# Run server
python app.py

# Deactivate virtual environment
deactivate
```

### Frontend
```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Run linter
npm run lint

# Type check
npm run typecheck
```

## Need Help?

- Check the logs in both terminal windows
- Review the browser console (F12) for errors
- Ensure all environment variables are set correctly
- Verify both backend and frontend are running simultaneously
- Check that Supabase project is active and credentials are correct

## Next Steps

- Try analyzing real product reviews
- Customize aspect keywords in `backend/app.py`
- Fine-tune the model on your domain-specific data
- Add new features like sentiment trends
- Deploy to production

Enjoy using your AI-powered review analyzer!
