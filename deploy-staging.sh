#!/bin/bash

# Deploy JECO+ to Staging
# Triggers GitHub Actions workflow for staging deployment

set -e

echo "🚀 Deploying JECO+ to Staging"
echo "=============================="
echo ""

# Check if we're on develop branch
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "develop" ]; then
  echo "⚠️  Warning: You're on branch '$CURRENT_BRANCH', not 'develop'"
  echo "   Deployment workflow triggers on 'develop' branch only"
  read -p "Continue anyway? (y/N) " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Cancelled."
    exit 1
  fi
fi

echo "📋 Pre-deployment checklist:"
echo "  ✅ Artifact Registry API enabled"
echo "  ✅ Docker repository 'jecoplus' created"
echo "  ✅ Service account has 'Artifact Registry Writer' role"
echo ""
read -p "All items checked? (y/N) " -n 1 -r
echo

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo ""
  echo "Please complete the setup first:"
  echo "1. Create repository: https://console.cloud.google.com/artifacts?project=jecoplus-staging"
  echo "2. Grant IAM role: https://console.cloud.google.com/iam-admin/iam?project=jecoplus-staging"
  exit 1
fi

echo ""
echo "🔨 Creating deployment commit..."

# Create empty commit to trigger deployment
git commit --allow-empty -m "deploy: trigger staging deployment

Artifact Registry setup complete:
- Repository created: asia-southeast1-docker.pkg.dev/jecoplus-staging/jecoplus
- Service account permissions granted

Deploying Sprint 13 to staging"

echo "✅ Commit created"
echo ""
echo "📤 Pushing to origin/develop..."

git push origin develop

echo "✅ Push complete"
echo ""
echo "🎯 Deployment workflow triggered!"
echo ""
echo "Monitor deployment:"
echo "  gh run watch"
echo ""
echo "Or view in browser:"
echo "  gh run view --web"
echo ""
echo "Expected deployment URLs:"
echo "  Frontend: https://jecoplus-staging.web.app"
echo "  Backend:  https://jecoplus-api-xxx.run.app (will be displayed after deployment)"
