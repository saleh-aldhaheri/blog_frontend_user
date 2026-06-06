#!/usr/bin/env bash
#
# Build the SPA and deploy it to S3 (+ optional CloudFront invalidation).
#
# Usage:
#   S3_BUCKET=my-bucket \
#   CLOUDFRONT_DISTRIBUTION_ID=E123ABC \
#   ./infra/deploy.sh
#
# Requires the AWS CLI configured (`aws configure`). Set your production
# VITE_* values in .env.production before running.

set -euo pipefail

: "${S3_BUCKET:?Set S3_BUCKET to your target bucket name}"
CLOUDFRONT_DISTRIBUTION_ID="${CLOUDFRONT_DISTRIBUTION_ID:-}"

cd "$(dirname "$0")/.."

echo "==> Building (vite build)"
npm run build

echo "==> Uploading hashed assets with a long cache"
aws s3 sync dist/assets "s3://$S3_BUCKET/assets" \
  --delete \
  --cache-control "public,max-age=31536000,immutable"

echo "==> Uploading index.html and other files with no-cache"
aws s3 sync dist "s3://$S3_BUCKET" \
  --delete \
  --exclude "assets/*" \
  --cache-control "public,max-age=0,must-revalidate"

if [ -n "$CLOUDFRONT_DISTRIBUTION_ID" ]; then
  echo "==> Invalidating CloudFront distribution $CLOUDFRONT_DISTRIBUTION_ID"
  aws cloudfront create-invalidation \
    --distribution-id "$CLOUDFRONT_DISTRIBUTION_ID" \
    --paths "/*" >/dev/null
fi

echo "==> Done."
