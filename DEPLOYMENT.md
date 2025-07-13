# 🚀 Deployment Guide for YourNxtWatch

This guide will help you deploy YourNxtWatch to production using GitHub Actions, Vercel (frontend), and Railway (backend).

## 📋 Prerequisites

1. **GitHub Account** with repository access
2. **Vercel Account** for frontend deployment
3. **Railway Account** for backend deployment
4. **TMDb API Key** (optional, for real movie data)

## 🔧 Step 1: Prepare Your Repository

### 1.1 Set up GitHub Repository Secrets

Go to your GitHub repository → Settings → Secrets and variables → Actions → Repository secrets, and add these secrets:

#### **Required Secrets**

| Secret Name | Description | How to Get |
|-------------|-------------|------------|
| `VERCEL_TOKEN` | Vercel API token for frontend deployment | [Get Vercel Token](#get-vercel-token) |
| `VERCEL_ORG_ID` | Vercel organization/team ID | [Get Vercel IDs](#get-vercel-org-and-project-ids) |
| `VERCEL_PROJECT_ID` | Vercel project ID | [Get Vercel IDs](#get-vercel-org-and-project-ids) |
| `RAILWAY_TOKEN` | Railway API token for backend deployment | [Get Railway Token](#get-railway-token) |

#### **Optional Secrets**

| Secret Name | Description | How to Get |
|-------------|-------------|------------|
| `TMDB_API_KEY` | TMDb API key for real movie data | [Get TMDb API Key](#get-tmdb-api-key) |

**Note**: Use **Repository secrets** (not Environment secrets) for this project.

### 1.2 How to Get Each Secret

#### **Get Vercel Token**

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel:**
   ```bash
   vercel login
   ```
   - This opens your browser
   - Login with your Vercel account
   - Authorize the CLI

3. **Get your token:**
   - Go to [Vercel Dashboard](https://vercel.com/account/tokens)
   - Click "Create Token"
   - Name it "YourNxtWatch"
   - Copy the token → This is your `VERCEL_TOKEN`

#### **Get Vercel Org and Project IDs**

1. **Create a Vercel project:**
   ```bash
   cd client
   vercel
   ```
   
   Follow the prompts:
   - Set up and deploy? → **Yes**
   - Which scope? → **Select your account**
   - Link to existing project? → **No**
   - What's your project's name? → **yournxtwatch**
   - In which directory is your code located? → **./**
   - Want to override the settings? → **No**

2. **Get the IDs:**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click on your project
   - Go to **Settings** tab
   - Scroll down to **General**
   - Copy:
     - **Team ID** → This is your `VERCEL_ORG_ID`
     - **Project ID** → This is your `VERCEL_PROJECT_ID`

#### **Get Railway Token**

1. **Install Railway CLI:**
   ```bash
   npm install -g @railway/cli
   ```

2. **Login to Railway:**
   ```bash
   railway login
   ```
   - This opens your browser
   - Login with your Railway account
   - Authorize the CLI

3. **Get your token:**
   - Go to [Railway Dashboard](https://railway.app/account/tokens)
   - Click "Create Token"
   - Name it "YourNxtWatch"
   - Copy the token → This is your `RAILWAY_TOKEN`

4. **Create Railway project:**
   ```bash
   cd server
   railway init
   ```
   
   Follow the prompts:
   - Project name? → **yournxtwatch-server**
   - Environment? → **Production**

#### **Get TMDb API Key (Optional)**

1. **Go to TMDb:**
   - Visit [TMDb API Settings](https://www.themoviedb.org/settings/api)
   - Create an account (free)

2. **Request API key:**
   - Click "Request API Key"
   - Select "Developer" option
   - Fill out the form:
     - **Application Name**: YourNxtWatch
     - **Application URL**: Your website (optional)
     - **Application Summary**: Multiplayer movie game
   - Submit the form

3. **Copy your API key:**
   - You'll receive an email with your API key
   - Copy the key → This is your `TMDB_API_KEY`

**Note**: This is optional - the app will use mock data without it.

### 1.3 Add Secrets to GitHub

1. **Go to Repository Secrets:**
   - Go to your GitHub repository
   - Click **Settings** tab
   - Click **Secrets and variables** → **Actions**
   - Click **Repository secrets** tab
   - Click **New repository secret**

2. **Add each secret:**
   - **Name**: `VERCEL_TOKEN`
   - **Value**: Your Vercel token
   - Click "Add secret"
   - Repeat for all secrets

3. **Verify all secrets are added:**
   - You should see all 4-5 secrets listed
   - Names should match exactly (case-sensitive)

### 1.4 Quick Verification Commands

```bash
# Test Vercel token
curl -H "Authorization: Bearer YOUR_VERCEL_TOKEN" https://api.vercel.com/v1/user

# Test Railway token
curl -H "Authorization: Bearer YOUR_RAILWAY_TOKEN" https://backboard.railway.app/graphql/v2

# Check Vercel projects
vercel projects ls

# Check Railway projects
railway projects ls
```

### 1.5 Troubleshooting Secrets

#### **If Vercel token doesn't work:**
```bash
# Re-login to Vercel
vercel logout
vercel login
```

#### **If Railway token doesn't work:**
```bash
# Re-login to Railway
railway logout
railway login
```

#### **If you get permission errors:**
- Make sure you're logged into the correct accounts
- Check that you have admin access to the projects
- Verify the tokens are copied correctly (no extra spaces)
- Ensure the secret names match exactly (case-sensitive)

### 1.6 Get Vercel Configuration

1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel:**
   ```bash
   vercel login
   ```

3. **Get your tokens:**
   ```bash
   vercel whoami
   ```

4. **Create a new Vercel project:**
   ```bash
   cd client
   vercel
   ```

5. **Get project details:**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Find your project
   - Copy the Project ID and Org ID

### 1.7 Get Railway Configuration

1. **Install Railway CLI:**
   ```bash
   npm i -g @railway/cli
   ```

2. **Login to Railway:**
   ```bash
   railway login
   ```

3. **Get your token:**
   ```bash
   railway whoami
   ```

4. **Create a new Railway project:**
   ```bash
   cd server
   railway init
   ```

## 🚀 Step 2: Deploy Backend (Railway)

### 2.1 Deploy to Railway

1. **Push your code to GitHub:**
   ```bash
   git add .
   git commit -m "Add deployment configuration"
   git push origin main
   ```

2. **Railway will automatically deploy** when it detects the `railway.json` file

3. **Set environment variables in Railway:**
   - Go to your Railway project dashboard
   - Navigate to Variables tab
   - Add these variables:
   ```
   PORT=3001
   NODE_ENV=production
   TMDB_API_KEY=your_tmdb_api_key (optional)
   CLIENT_URL=https://yournxtwatch.vercel.app
   ```

4. **Get your Railway URL:**
   - Copy the generated URL (e.g., `https://yournxtwatch-server.railway.app`)

### 2.2 Update Client Configuration

1. **Update the client environment:**
   ```bash
   cd client
   cp env.production.example .env.production
   ```

2. **Edit `.env.production`:**
   ```env
   VITE_SERVER_URL=https://yournxtwatch-server.railway.app
   ```

## 🌐 Step 3: Deploy Frontend (Vercel)

### 3.1 Deploy to Vercel

1. **The GitHub Actions workflow will automatically deploy** when you push to main

2. **Or deploy manually:**
   ```bash
   cd client
   vercel --prod
   ```

3. **Get your Vercel URL:**
   - Copy the generated URL (e.g., `https://yournxtwatch.vercel.app`)

### 3.2 Update Server Configuration

1. **Update the server environment:**
   ```bash
   cd server
   cp env.production.example .env
   ```

2. **Edit `.env`:**
   ```env
   PORT=3001
   NODE_ENV=production
   TMDB_API_KEY=your_tmdb_api_key
   CLIENT_URL=https://yournxtwatch.vercel.app
   ```

## 🔄 Step 4: Set up GitHub Actions

### 4.1 Automatic Deployment

The GitHub Actions workflow will automatically:

1. **Build and test** all packages
2. **Deploy frontend** to Vercel
3. **Deploy backend** to Railway

### 4.2 Manual Deployment

If you need to deploy manually:

```bash
# Deploy backend
cd server
railway up

# Deploy frontend
cd client
vercel --prod
```

## 🔍 Step 5: Verify Deployment

### 5.1 Check Backend Health

Visit your Railway URL + `/health`:
```
https://yournxtwatch-server.railway.app/health
```

You should see:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### 5.2 Test Frontend

1. **Visit your Vercel URL**
2. **Create a new game**
3. **Test the full flow**

### 5.3 Test Real-time Features

1. **Open multiple browser tabs**
2. **Join the same game**
3. **Test real-time updates**

## 🛠 Troubleshooting

### Common Issues

#### **1. Build Failures**
- Check that all dependencies are installed
- Verify TypeScript compilation
- Check for missing environment variables

#### **2. Connection Issues**
- Verify the server URL in client environment
- Check CORS configuration
- Ensure ports are correctly configured

#### **3. Real-time Issues**
- Check Socket.IO connection
- Verify WebSocket support
- Check firewall settings

### Debug Commands

```bash
# Check build locally
npm run build

# Test server locally
cd server && npm start

# Test client locally
cd client && npm run dev

# Check logs
railway logs
vercel logs
```

## 🔧 Environment Variables Reference

### **Client (.env.production)**
```env
VITE_SERVER_URL=https://yournxtwatch-server.railway.app
```

### **Server (.env)**
```env
PORT=3001
NODE_ENV=production
TMDB_API_KEY=your_tmdb_api_key
CLIENT_URL=https://yournxtwatch.vercel.app
```

## 📊 Monitoring

### **Vercel Analytics**
- Visit your Vercel dashboard
- Check Analytics tab for performance metrics

### **Railway Monitoring**
- Visit your Railway dashboard
- Check Metrics tab for server performance

### **GitHub Actions**
- Check Actions tab for deployment status
- Review logs for any issues

## 🔄 Continuous Deployment

Once set up, every push to `main` will automatically:

1. **Run tests and linting**
2. **Build all packages**
3. **Deploy to Vercel and Railway**
4. **Update your live application**

## 🎉 Success!

Your YourNxtWatch application is now deployed and ready for users! 

- **Frontend**: https://yournxtwatch.vercel.app
- **Backend**: https://yournxtwatch-server.railway.app
- **Health Check**: https://yournxtwatch-server.railway.app/health

Share your Vercel URL with friends and start playing! 