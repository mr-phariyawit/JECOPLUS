#!/bin/bash

# Setup Artifact Registry for JECO+ Staging Deployment
# This script grants the necessary permissions for GitHub Actions to push Docker images

set -e

PROJECT_ID="jecoplus-staging"
REGION="asia-southeast1"
REPOSITORY="jecoplus"

echo "🔧 Setting up Artifact Registry for JECO+ Staging"
echo "=================================================="
echo ""
echo "Project: $PROJECT_ID"
echo "Region: $REGION"
echo "Repository: $REPOSITORY"
echo ""

# Get the service account email from GitHub secrets
# Note: You need to know the service account email
# It should be in your GitHub secrets as GCP_SA_KEY_STAGING

echo "📋 Instructions:"
echo ""
echo "1. Find your service account email:"
echo "   - Go to: https://console.cloud.google.com/iam-admin/serviceaccounts?project=$PROJECT_ID"
echo "   - Look for the service account used for GitHub Actions"
echo "   - Copy the email (should look like: github-actions@PROJECT.iam.gserviceaccount.com)"
echo ""
echo "2. Grant Artifact Registry Writer role:"
echo "   Run this command (replace SERVICE_ACCOUNT_EMAIL):"
echo ""
echo "   gcloud projects add-iam-policy-binding $PROJECT_ID \\"
echo "     --member='serviceAccount:SERVICE_ACCOUNT_EMAIL' \\"
echo "     --role='roles/artifactregistry.writer'"
echo ""
echo "3. Alternatively, use the GCP Console:"
echo "   - Go to: https://console.cloud.google.com/iam-admin/iam?project=$PROJECT_ID"
echo "   - Find the service account"
echo "   - Click 'Edit Principal' (pencil icon)"
echo "   - Click 'ADD ANOTHER ROLE'"
echo "   - Search for 'Artifact Registry Writer'"
echo "   - Click 'SAVE'"
echo ""
echo "✅ After completing these steps, your deployment should work!"
