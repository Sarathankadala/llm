# Deployment Instructions

Your AI Legal Document Simplifier is ready to deploy! Choose one of the following methods:

---

## Method 1: Vercel (Recommended) 🚀

### Option A: Using Vercel CLI (Requires PowerShell Permission)

1. **Enable PowerShell Scripts** (if needed):
   ```powershell
   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
   ```

2. **Deploy with Vercel**:
   ```bash
   npx vercel
   ```
   - Follow the prompts to login/signup
   - Accept defaults for configuration
   - Your site will be live in seconds!

### Option B: Using Vercel Dashboard (Easiest - No CLI needed)

1. Visit https://vercel.com and sign up/login
2. Click **"Add New Project"**
3. Click **"Import Git Repository"**
4. Initialize a GitHub repo or use **"Deploy from Git"**
5. Or simply drag and drop the `legal-simplifier` folder
6. Vercel will auto-detect it's a static site
7. Click **"Deploy"** - Done! ✅

---

## Method 2: Netlify Drop (No Account Needed) 📦

1. Visit https://app.netlify.com/drop
2. **Drag and drop** the entire `legal-simplifier` folder
3. Your site goes live instantly!
4. You get a random URL like `random-name-123.netlify.app`

---

## Method 3: GitHub Pages (Free Forever) 🌐

1. **Create GitHub Repository**:
   ```bash
   # In the legal-simplifier directory
   git remote add origin https://github.com/YOUR_USERNAME/legal-simplifier.git
   git branch -M main
   git push -u origin main
   ```

2. **Enable GitHub Pages**:
   - Go to repository Settings → Pages
   - Source: Deploy from `main` branch
   - Root directory: `/` 
   - Click Save
   - Your site will be at: `https://YOUR_USERNAME.github.io/legal-simplifier/`

---

## Method 4: Render Static Site 🎨

1. Visit https://render.com and sign up/login
2. Click **"New +"** → **"Static Site"**
3. Connect your GitHub repo or upload files
4. Build command: (leave empty)
5. Publish directory: `.`
6. Click **"Create Static Site"**

---

## Quick Test Before Deployment ✅

You can test locally by opening the file directly:
- Open `index.html` in any browser
- Or use a local server:
  ```bash
  npx serve .
  ```
  Then visit http://localhost:3000

---

## Files Ready for Deployment

All necessary files are in: `d:\LLM\legal-simplifier\`

```
legal-simplifier/
├── index.html       # Main application
├── style.css        # Premium styling
├── app.js          # Application logic
├── package.json    # Project metadata
├── vercel.json     # Vercel configuration
├── README.md       # Documentation
└── .gitignore      # Git ignore rules
```

---

## Post-Deployment Checklist

After deploying, verify:
- ✅ Page loads with premium dark UI
- ✅ "Load Sample" button works
- ✅ "Simplify Document" processes text
- ✅ All output sections visible
- ✅ Copy buttons function
- ✅ Disclaimer always shown
- ✅ Responsive on mobile

---

## Custom Domain (Optional)

Once deployed, you can add a custom domain:
- **Vercel**: Project Settings → Domains
- **Netlify**: Site Settings → Domain Management
- **GitHub Pages**: Repository Settings → Pages → Custom Domain

---

## Recommended: Vercel Dashboard Method

**The easiest way right now**:
1. Go to https://vercel.com/new
2. Sign in with GitHub/Email
3. Click "Browse" and select `d:\LLM\legal-simplifier` folder
4. Click "Deploy"
5. Done! Get your live URL instantly 🎉

Your site will be live at: `https://your-project-name.vercel.app`
