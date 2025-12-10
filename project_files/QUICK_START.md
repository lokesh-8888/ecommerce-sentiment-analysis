# Quick Start Guide

## ✅ What's Already Done

1. ✅ Backend dependencies installed (Python virtual environment created)
2. ✅ Frontend dependencies installed (npm packages)
3. ✅ Environment variable templates created (.env.example files)

## 📋 Next Steps

### Step 1: Set Up Supabase

1. Go to [https://supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Fill in:
   - Project name (e.g., "review-analyzer")
   - Database password (save this!)
   - Region (choose closest to you)
4. Wait 2-3 minutes for project to be created
5. Go to **Project Settings** → **API**
6. Copy:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon/public key** (starts with `eyJ...`)

### Step 2: Create .env Files

**Backend .env file:**
1. Navigate to `backend` folder
2. Copy `.env.example` to `.env`:
   ```powershell
   Copy-Item .env.example .env
   ```
3. Open `.env` in a text editor
4. Replace `https://your-project-id.supabase.co` with your actual Supabase URL
5. Replace `your-anon-key-here` with your actual anon key

**Frontend .env file (optional, but recommended):**
1. Navigate to project root folder
2. Copy `.env.example` to `.env`:
   ```powershell
   Copy-Item .env.example .env
   ```
3. Fill in the same Supabase credentials

### Step 3: Run Database Migration

1. Go to your Supabase project dashboard
2. Click on **SQL Editor** in the left sidebar
3. Click **New Query**
4. Open the file: `supabase/migrations/20251129191859_create_reviews_table.sql`
5. Copy the entire SQL content
6. Paste it into the SQL Editor
7. Click **Run** (or press Ctrl+Enter)
8. You should see "Success. No rows returned"

### Step 4: Start the Backend Server

Open a **new PowerShell terminal**:

```powershell
cd C:\Desktop\project\backend
.\venv\Scripts\Activate.ps1
python app.py
```

You should see:
```
Loading model: distilbert-base-uncased-finetuned-sst-2-english
Flask server starting...
 * Running on http://0.0.0.0:5000
```

**Keep this terminal open!** The backend needs to stay running.

**Note:** The first time you run this, it will download the BERT model (~250MB). This may take a few minutes depending on your internet speed.

### Step 5: Start the Frontend Server

Open **another new PowerShell terminal**:

```powershell
cd C:\Desktop\project
npm run dev
```

You should see:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
```

### Step 6: Open the Application

Open your web browser and go to:
```
http://localhost:5173
```

You should see the E-Commerce Review Analyzer interface!

## 🧪 Test the Application

1. Click on "Single Review" tab
2. Enter a sample review: "This product is amazing! Great quality and fast delivery."
3. Click "Analyze Sentiment"
4. You should see results showing Positive sentiment with confidence scores

## 🐛 Troubleshooting

### Backend Issues

**"Module not found" error:**
- Make sure virtual environment is activated: `.\venv\Scripts\Activate.ps1`
- Reinstall: `pip install -r requirements.txt`

**"Port 5000 already in use":**
- Find and kill the process:
  ```powershell
  netstat -ano | findstr :5000
  taskkill /PID <PID_NUMBER> /F
  ```

**Model download fails:**
- Check your internet connection
- The model will be cached after first download

### Frontend Issues

**"Failed to analyze review" error:**
- Make sure Flask backend is running on port 5000
- Check browser console (F12) for errors
- Verify `.env` file has correct Supabase credentials

**Port 5173 already in use:**
- Vite will automatically suggest an alternative port
- Or kill the process using the port

### Database Issues

**"Database insert error" in backend logs:**
- Verify Supabase credentials in `backend/.env`
- Make sure you ran the database migration (Step 3)
- Check Supabase project is active (not paused)

## 📝 Important Notes

- **Keep both terminals open** - Backend and frontend need to run simultaneously
- **First run takes longer** - The BERT model downloads on first startup
- **Supabase free tier** - Works perfectly for development and testing
- **Environment variables** - Never commit `.env` files to git (they're already in .gitignore)

## 🎉 You're All Set!

Once both servers are running, you can:
- Analyze single reviews
- Extract product aspects
- Process batch reviews
- View analytics dashboard

Enjoy your AI-powered review analyzer!


