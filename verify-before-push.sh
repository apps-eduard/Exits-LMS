#!/bin/bash
# GitHub Push Verification Script
# Run this before pushing to verify .env files are not exposed

echo "🔍 Checking for exposed environment files..."
echo ""

# Check for .env files
echo "❌ Checking for .env files that should NOT be committed:"
for file in .env .env.local backend/.env backend/.env.local frontend/.env frontend/.env.local; do
    if git ls-files --cached | grep -q "^$file$"; then
        echo "   ❌ DANGER: $file is staged for commit!"
        HAS_DANGER=1
    else
        echo "   ✅ $file is not staged"
    fi
done

echo ""
echo "✅ Checking for .env.example files that SHOULD be committed:"
for file in .env.example backend/.env.example frontend/.env.example; do
    if git ls-files --cached | grep -q "^$file$"; then
        echo "   ✅ $file is staged"
    elif [ -f "$file" ]; then
        echo "   ⚠️  $file exists but is NOT staged (add it!)"
        echo "      Run: git add $file"
        HAS_WARNING=1
    else
        echo "   ⚠️  $file does not exist"
    fi
done

echo ""
echo "📋 Checking for secrets in staged files:"
if git diff --cached | grep -i "password\|secret\|api_key\|token" > /dev/null; then
    echo "   ❌ DANGER: Secrets found in staged files!"
    git diff --cached | grep -i "password\|secret\|api_key\|token"
    HAS_DANGER=1
else
    echo "   ✅ No secrets detected in staged files"
fi

echo ""
echo "📁 Staged files summary:"
git diff --cached --name-only | head -20

if [ $HAS_DANGER ]; then
    echo ""
    echo "❌ PUSH BLOCKED: Dangerous files detected!"
    echo "   Remove them from staging:"
    echo "   git reset HEAD <filename>"
    exit 1
elif [ $HAS_WARNING ]; then
    echo ""
    echo "⚠️  WARNINGS: Some files need attention"
    exit 1
else
    echo ""
    echo "✅ ALL CHECKS PASSED - Ready to push!"
    exit 0
fi
