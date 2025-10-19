# GitHub Push Preparation Guide

## Pre-Push Checklist

### 1. Verify `.env` Files Are NOT Staged
```bash
git status
```
**Expected output:** Should NOT show `.env` or `.env.local` files

If they appear:
```bash
git reset HEAD .env .env.local backend/.env backend/.env.local frontend/.env frontend/.env.local
```

### 2. Verify `.env.example` Files ARE Tracked
```bash
git status
```
**Should include:**
- `.env.example`
- `backend/.env.example`
- `frontend/.env.example`

### 3. Add All `.env.example` Files
```bash
git add .env.example backend/.env.example frontend/.env.example
git add .gitignore
git add ENV_SETUP_GUIDE.md
```

### 4. Review Staged Changes
```bash
git diff --cached
```
Verify no secret values are exposed.

### 5. Commit with Descriptive Message
```bash
git commit -m "docs: add environment configuration templates and setup guides"
```

### 6. Push to Repository
```bash
git push origin main
```

## Quick Commands Reference

```bash
# Initialize git if not already done
git init

# Add remote repository
git remote add origin https://github.com/YOUR_USERNAME/Exits-LMS.git

# Stage environment files (SAFE)
git add .env.example backend/.env.example frontend/.env.example
git add .gitignore
git add ENV_SETUP_GUIDE.md

# Verify nothing dangerous is staged
git diff --cached | grep -i "password\|secret\|token"  # Should return nothing

# Commit
git commit -m "docs: initial commit with environment templates"

# Push
git push -u origin main
```

## Files to Include in GitHub

### ✅ SAFE - Include These
- `.env.example` - template file
- `backend/.env.example` - template file
- `frontend/.env.example` - template file
- `.gitignore` - with proper exclusions
- `ENV_SETUP_GUIDE.md` - setup documentation
- All source code
- `README.md` - project documentation
- `package.json` - dependencies

### ❌ DO NOT INCLUDE - These Will Be Ignored
- `.env` - your actual secrets
- `.env.local` - your local development secrets
- `backend/.env` - backend production/dev secrets
- `backend/.env.local` - backend local secrets
- `frontend/.env` - frontend secrets
- `frontend/.env.local` - frontend local secrets
- `node_modules/` - dependencies (run `npm install` instead)
- `dist/` - build output
- `.angular/` - cache files

## After Pushing to GitHub

### For New Developers Cloning the Repository

1. **Clone the repository:**
   ```bash
   git clone https://github.com/YOUR_USERNAME/Exits-LMS.git
   cd Exits-LMS
   ```

2. **Follow the ENV_SETUP_GUIDE.md:**
   ```bash
   cat ENV_SETUP_GUIDE.md
   ```

3. **Create local environment files:**
   ```bash
   # Backend
   cp backend/.env.example backend/.env.local
   nano backend/.env.local  # Edit with their values
   
   # Frontend
   cp frontend/.env.example frontend/.env.local
   nano frontend/.env.local  # Edit with their values
   ```

4. **Install dependencies and run:**
   ```bash
   # Backend
   cd backend
   npm install
   npm start
   
   # Frontend (in new terminal)
   cd frontend
   npm install
   npm start
   ```

## Security Reminders

⚠️ **CRITICAL:**
- Never commit actual `.env` files
- Never commit files with passwords or API keys
- Never commit files with JWT secrets
- Use `.env.example` files as templates only
- Each developer/environment should have their own `.env.local` file
- For production, use environment-specific configuration management

## Troubleshooting Push Issues

### "Permission denied (publickey)"
```bash
# Add your SSH key to GitHub or use HTTPS
git remote set-url origin https://github.com/YOUR_USERNAME/Exits-LMS.git
```

### Large files rejected
```bash
# Check file sizes
git ls-files -s | sort -k 4 -n -r | head -10

# Remove if needed and recommit
git rm --cached large_file
```

### "Nothing to commit"
```bash
# Verify you've staged files
git status
git add .
git commit -m "your message"
```

## Next Steps

1. ✅ Verify all files are properly configured
2. ✅ Test local setup works with these files
3. ✅ Push to GitHub
4. ✅ Test that new developers can clone and set up
5. ✅ Document any additional setup steps
