#!/bin/bash

# Script to push to both main GitHub repository and Azure DevOps repository
# Usage: ./push-to-both-repos.sh [commit_message]

echo "🚀 Pushing to both repositories..."

# Get commit message from argument or use default
if [ -n "$1" ]; then
    COMMIT_MSG="$1"
else
    COMMIT_MSG="Update from local development"
fi

# Add all changes
echo "📁 Adding all changes..."
git add .

# Commit changes
echo "💾 Committing changes: $COMMIT_MSG"
git commit -m "$COMMIT_MSG"

# Push to GitHub (origin)
echo "📤 Pushing to GitHub (origin)..."
git push origin main

# Push to Azure DevOps
echo "📤 Pushing to Azure DevOps..."
echo "⚠️  Note: You may need to enter your Azure DevOps credentials"
git push azure main

echo "✅ Push to both repositories completed!"
echo ""
echo "📋 Summary:"
echo "   GitHub: https://github.com/maheshbalan/incentiva.git"
echo "   Azure:  https://pravici@dev.azure.com/pravici/Rewards/_git/Rewards"
