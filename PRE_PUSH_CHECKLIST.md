# GitHub Push Preparation Checklist

## ✅ Pre-Push Requirements

### Step 1: Verify Environment Files
- [ ] `.env` file exists and contains LOCAL secrets
- [ ] `.env.local` file exists and contains LOCAL secrets
- [ ] `backend/.env.local` exists with DB credentials
- [ ] `frontend/.env.local` exists with API URL
- [ ] NO `.env` files in git staging area

### Step 2: Verify Example Files
- [ ] `.env.example` exists (root level)
- [ ] `backend/.env.example` exists
- [ ] `frontend/.env.example` exists
- [ ] Example files have PLACEHOLDER values only (no real secrets)
- [ ] All `.env.example` files are ready to commit

### Step 3: Check .gitignore
- [ ] `.gitignore` includes `.env`
- [ ] `.gitignore` includes `.env.local`
- [ ] `.gitignore` includes `.env.*.local`
- [ ] `.gitignore` allows `!.env.example` (negation)
- [ ] Run: `cat .gitignore` to verify

### Step 4: Clean Git Staging
```bash
# Remove any .env files from staging
git reset HEAD .env .env.local backend/.env backend/.env.local frontend/.env frontend/.env.local

# Verify nothing is staged except what you want
git status
```

### Step 5: Verify No Secrets in Diffs
```bash
# Check for secrets in staged changes
git diff --cached | grep -i "password\|secret\|token\|api_key"

# Should return NOTHING
```

### Step 6: Stage Safe Files
```bash
# Add documentation
git add .gitignore
git add ENV_SETUP_GUIDE.md
git add GITHUB_PUSH_GUIDE.md
git add README.md
git add verify-before-push.sh
git add verify-before-push.bat

# Add example files
git add .env.example
git add backend/.env.example
git add frontend/.env.example

# Add other project files
git add backend/
git add frontend/
git add .editorconfig
git add .prettierrc
# ... any other non-secret files
```

### Step 7: Final Review Before Commit
```bash
# Review all staged changes
git diff --cached --stat

# Should show only:
# - .env.example files (with placeholders)
# - Documentation files
# - Source code files
# - Configuration files (no .env)
```

### Step 8: Run Verification Script
**On Windows:**
```powershell
.\verify-before-push.bat
```

**On macOS/Linux:**
```bash
bash verify-before-push.sh
```

Expected output:
```
✅ ALL CHECKS PASSED - Ready to push!
```

### Step 9: Create Commit
```bash
git commit -m "docs: add environment setup guides and initial project structure"

# Or if first push:
git commit -m "Initial commit: multi-tenant LMS with theme system"
```

### Step 10: Verify Commit
```bash
# Review what's in the commit
git log -1 --stat

# Should show .env.example files, NOT .env files
```

### Step 11: Push to GitHub
```bash
# First time setup
git remote add origin https://github.com/YOUR_USERNAME/Exits-LMS.git
git branch -M main
git push -u origin main

# Subsequent pushes
git push origin main
```

## 🔍 Final Security Checklist

**CRITICAL - Run Before Every Push:**

| Check | Command | Expected Result |
|-------|---------|-----------------|
| No .env files staged | `git diff --cached --name-only \| grep "\.env$"` | No output |
| No .env.local staged | `git diff --cached --name-only \| grep "\.env\.local"` | No output |
| No secrets in diff | `git diff --cached \| grep -i "password\|secret"` | No output |
| Example files present | `ls -la *.example */.example` | Files exist |
| .gitignore correct | `cat .gitignore \| grep "\.env"` | Shows .env exclusions |

## ⚠️ If You Accidentally Committed .env

**IMMEDIATE ACTION REQUIRED:**

```bash
# 1. Remove from git history (CRITICAL!)
git rm --cached .env .env.local
git commit -m "remove: accidentally committed .env files"
git push

# 2. IMMEDIATELY change all secrets in production!
# - Rotate JWT secrets
# - Change database passwords
# - Update API keys
# - Invalidate any exposed tokens

# 3. Force update git history (advanced)
git filter-branch --tree-filter 'rm -f .env .env.local' -- --all
git push --force-with-lease
```

## 📋 Post-Push Verification

After successful push:

1. ✅ Visit GitHub repository
2. ✅ Check that `.env.example` files are visible
3. ✅ Check that `.env` files are NOT present
4. ✅ Review file contents to ensure no secrets
5. ✅ Test that new developers can clone and follow ENV_SETUP_GUIDE.md

## 🎯 Git Workflow Summary

```bash
# 1. Create branch
git checkout -b feature/my-feature

# 2. Make changes (including .env.local for local development)
# ... edit files ...

# 3. Verify no secrets before staging
./verify-before-push.bat  # or .sh on Unix

# 4. Stage safe files only
git add .
git reset HEAD .env .env.local backend/.env backend/.env.local frontend/.env frontend/.env.local

# 5. Verify again
git diff --cached | grep -i "password"  # Should be empty

# 6. Commit
git commit -m "feature: add my feature"

# 7. Push
git push origin feature/my-feature

# 8. Create Pull Request on GitHub
```

## 📚 Reference Documents

- **[ENV_SETUP_GUIDE.md](./ENV_SETUP_GUIDE.md)** - Setup instructions for new developers
- **[GITHUB_PUSH_GUIDE.md](./GITHUB_PUSH_GUIDE.md)** - GitHub push instructions
- **[README.md](./README.md)** - Project overview

## 🆘 Troubleshooting

**Q: I see "git: 'ls-files' is not a git command"**
A: Make sure you're in a git repository. Run `git status` first.

**Q: "fatal: not a git repository"**
A: Initialize git first:
```bash
git init
git remote add origin https://github.com/YOUR_USERNAME/Exits-LMS.git
```

**Q: I accidentally deleted .env.example**
A: Restore it:
```bash
git restore .env.example
git restore backend/.env.example
git restore frontend/.env.example
```

**Q: "Permission denied" when pushing**
A: Setup SSH or use HTTPS:
```bash
# Use HTTPS (recommended for first time)
git remote set-url origin https://github.com/YOUR_USERNAME/Exits-LMS.git
```

---

**✅ Ready to Push?** Run the verification script first!
