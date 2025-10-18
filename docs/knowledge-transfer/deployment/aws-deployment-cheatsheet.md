# AWS Deployment Cheat Sheet

Quick reference for deploying and updating the React Todo app on AWS.

---

## Project Information

- **Live URL:** https://d3oisvzydii1gm.cloudfront.net
- **S3 Bucket:** doable.io
- **CloudFront Distribution ID:** EZLPYGXJSN06R
- **AWS Profile:** itsaldy
- **Region:** ap-southeast-1

---

## Daily Commands

### Login to AWS

```bash
aws sso login --profile itsaldy
```

### Deploy Updates

```bash
# 1. Build the app
npm run build

# 2. Upload to S3
aws s3 sync dist/ s3://doable.io --delete

# 3. Invalidate CloudFront cache (optional, for immediate updates)
aws cloudfront create-invalidation --distribution-id EZLPYGXJSN06R --paths "/*"
```

### Check Deployment Status

```bash
# Check CloudFront status
aws cloudfront get-distribution --id EZLPYGXJSN06R --query 'Distribution.Status'

# List S3 files
aws s3 ls s3://doable.io/
```

---

## Configuration Files

### CloudFront Config

Location: `cloudfront-config.json`

Key settings:

- Origin: S3 website endpoint
- HTTPS: Redirect HTTP to HTTPS
- Caching: 24 hours default
- Error handling: Return index.html for 404s

### AWS CLI Config

Location: `~/.aws/config`

Profile: `itsaldy`

- SSO session: personal
- Region: ap-southeast-1
- Output: json

---

## Cost Tracking

### Current Setup

- S3 storage: ~$0.01/month
- CloudFront: FREE (within Free Tier)
- Total: ~$0.01/month

### After Free Tier (12 months)

- CloudFront data transfer: ~$0.85/month for 10GB
- Total: ~$0.86/month

---

## Troubleshooting

### Site shows old content

```bash
# Invalidate CloudFront cache
aws cloudfront create-invalidation --distribution-id EZLPYGXJSN06R --paths "/*"
```

### Authentication expired

```bash
# Re-login to SSO
aws sso login --profile itsaldy
```

### Check if files uploaded correctly

```bash
# List S3 bucket contents
aws s3 ls s3://doable.io/ --recursive
```

---

## Important Notes

1. **Always build before deploying:** `npm run build`
2. **CloudFront caches for 24 hours:** Use invalidation for immediate updates
3. **First 1,000 invalidations per month are free**
4. **Use `--no-cli-pager` flag** to avoid CLI hanging
5. **Set AWS_PROFILE environment variable** to avoid typing `--profile` every time:
    ```bash
    export AWS_PROFILE=itsaldy
    ```

---

## Emergency Commands

### Delete CloudFront distribution (if needed)

```bash
# 1. Disable distribution first
aws cloudfront get-distribution-config --id EZLPYGXJSN06R > dist-config.json
# Edit dist-config.json: set "Enabled": false
aws cloudfront update-distribution --id EZLPYGXJSN06R --if-match ETAG --distribution-config file://dist-config.json

# 2. Wait for deployment (status: Deployed)
# 3. Delete distribution
aws cloudfront delete-distribution --id EZLPYGXJSN06R --if-match ETAG
```

### Empty and delete S3 bucket

```bash
# Empty bucket
aws s3 rm s3://doable.io --recursive

# Delete bucket
aws s3 rb s3://doable.io
```

---

## Useful Links

- [AWS Console](https://console.aws.amazon.com/)
- [CloudFront Console](https://console.aws.amazon.com/cloudfront/)
- [S3 Console](https://console.aws.amazon.com/s3/)
- [IAM Identity Center](https://console.aws.amazon.com/singlesignon/)
- [AWS Billing Dashboard](https://console.aws.amazon.com/billing/)
