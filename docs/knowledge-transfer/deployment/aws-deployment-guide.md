# AWS Deployment Guide: React Todo App

## Overview

This document captures the complete journey of deploying a React application to AWS using S3 and CloudFront, including all the lessons learned, mistakes made, and solutions implemented.

**Final Result:** A React todo app deployed at `https://d3oisvzydii1gm.cloudfront.net` with HTTPS enabled, global CDN delivery, and minimal costs.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [AWS CLI Authentication Setup](#aws-cli-authentication-setup)
    - [Option A: IAM User with Access Keys (Free Tier Friendly)](#option-a-iam-user-with-access-keys-free-tier-friendly)
    - [Option B: IAM Identity Center (Recommended)](#option-b-iam-identity-center-recommended)
3. [S3 Bucket Configuration](#s3-bucket-configuration)
4. [CloudFront Distribution Setup](#cloudfront-distribution-setup)
5. [Deployment Workflow](#deployment-workflow)
6. [Lessons Learned](#lessons-learned)
7. [Cost Breakdown](#cost-breakdown)
8. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Tools

- AWS CLI v2 installed
- Node.js and npm
- A built React application (in `dist/` directory)
- AWS account with appropriate permissions

### AWS Services Used

- **S3**: Static file storage
- **CloudFront**: CDN for global delivery and HTTPS
- **IAM or IAM Identity Center**: Authentication for AWS CLI

---

## AWS CLI Authentication Setup

You have two options for authenticating with AWS CLI. Choose based on your needs:

| Feature                | IAM User (Access Keys)                       | IAM Identity Center (SSO)                                                                           |
| ---------------------- | -------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| **Free Tier Impact**   | ✅ No impact                                 | ⚠️ Requires AWS Organizations (triggers "paid plan" message, but doesn't affect Free Tier benefits) |
| **Setup Complexity**   | ✅ Simple (5 minutes)                        | ⚠️ Moderate (10-15 minutes)                                                                         |
| **Security**           | ⚠️ Long-term credentials                     | ✅ Temporary credentials that auto-rotate                                                           |
| **Best For**           | Learning, personal projects, Free Tier users | Professional use, multi-account setups                                                              |
| **AWS Recommendation** | Legacy approach                              | ✅ Modern best practice                                                                             |

**Recommendation:**

- **If you're on Free Tier and want to avoid any confusion:** Use Option A (IAM User)
- **If you want to learn AWS best practices:** Use Option B (IAM Identity Center)

---

## Option A: IAM User with Access Keys (Free Tier Friendly)

This is the traditional, simpler approach that doesn't require AWS Organizations.

### Step 1: Create IAM User

1. Log into AWS Console
2. Search for "IAM" in the search bar
3. Click "Users" in the left sidebar
4. Click "Create user"
5. Enter a username (e.g., "cli-user" or your name)
6. Click "Next"

### Step 2: Set Permissions

1. Choose "Attach policies directly"
2. Select policies based on your needs:
    - **For learning/full access**: Select "AdministratorAccess"
    - **For S3 and CloudFront only**: Select "AmazonS3FullAccess" and "CloudFrontFullAccess"
3. Click "Next"
4. Review and click "Create user"

### Step 3: Create Access Keys

1. Click on the username you just created
2. Go to the "Security credentials" tab
3. Scroll down to "Access keys"
4. Click "Create access key"
5. Select "Command Line Interface (CLI)"
6. Check the confirmation box
7. Click "Next"
8. (Optional) Add a description tag
9. Click "Create access key"

**Important:** You'll see your Access Key ID and Secret Access Key. **Save these securely** - you won't be able to see the secret key again!

### Step 4: Configure AWS CLI

```bash
aws configure
```

When prompted, enter:

- **AWS Access Key ID**: Paste your access key
- **AWS Secret Access Key**: Paste your secret key
- **Default region name**: Your preferred region (e.g., `ap-southeast-1`, `us-east-1`)
- **Default output format**: `json`

### Step 5: Test Configuration

```bash
aws sts get-caller-identity --no-cli-pager
```

You should see your user information. You're ready to proceed to [S3 Bucket Configuration](#s3-bucket-configuration)!

### Managing Profiles with IAM Users

If you need multiple profiles (work and personal):

**Create additional profiles:**

```bash
aws configure --profile personal
```

**Use specific profile:**

```bash
aws s3 ls --profile personal
```

**Set default profile:**

```bash
export AWS_PROFILE=personal
```

---

## Option B: IAM Identity Center (Recommended)

This is AWS's modern, recommended approach for CLI authentication.

### Why IAM Identity Center?

IAM Identity Center (formerly AWS SSO) offers:

- ✅ Temporary credentials that auto-rotate (more secure)
- ✅ No long-term access keys to manage
- ✅ Better for multi-account environments
- ✅ Follows AWS best practices
- ✅ Same approach used in enterprise environments

### Important Note About AWS Organizations

Enabling IAM Identity Center requires AWS Organizations, which triggers an email saying your account was "upgraded to a paid plan."

**Don't panic!** This is misleading:

- AWS Organizations is a **free service**
- Your **Free Tier benefits remain intact**
- You won't be charged anything extra
- Free Tier eligibility is based on usage and account age (12 months from creation)

### Step 1: Enable IAM Identity Center

1. Log into AWS Console
2. Search for "IAM Identity Center"
3. Click "Enable"
4. Choose your region (e.g., `ap-southeast-1`)
5. Select "Enable with AWS Organizations"

### Step 2: Create User in Identity Center

1. In IAM Identity Center, go to "Users"
2. Click "Add user"
3. Fill in:
    - Username
    - Email address (you'll receive a setup email)
    - First name / Last name
4. Click "Next" and "Add user"

### Step 3: Assign Permissions

1. Go to "AWS accounts" in the left sidebar
2. Select your AWS account
3. Click "Assign users or groups"
4. Select your user
5. Click "Next"
6. Create or select a permission set (e.g., "AdministratorAccess" for learning)
7. Click "Next" and "Submit"

### Step 4: Set Up Password

1. Check your email for "Invitation to join AWS IAM Identity Center"
2. Click "Accept invitation"
3. Set up your password
4. Save your portal URL (e.g., `https://d-xxxxxxxxxx.awsapps.com/start`)

### Step 5: Configure AWS CLI

```bash
aws configure sso
```

When prompted:

- **SSO session name**: `personal` (or any name you prefer)
- **SSO start URL**: Your portal URL from the email
- **SSO region**: The region where you enabled Identity Center (e.g., `ap-southeast-1`)
- **SSO registration scopes**: Press Enter for default (`sso:account:access`)

Then:

- **CLI default client Region**: Your preferred region (e.g., `ap-southeast-1`)
- **CLI default output format**: `json`
- **CLI profile name**: `default` or a custom name (e.g., `itsaldy`)

### Step 6: Login and Test

```bash
# Login to SSO session
aws sso login --profile itsaldy

# Test authentication
aws sts get-caller-identity --profile itsaldy --no-cli-pager
```

### Managing Multiple Profiles with IAM Identity Center

If you use your laptop for both work and personal projects:

**Option 1: Use `--profile` flag per command**

```bash
aws s3 ls --profile itsaldy --no-cli-pager
```

**Option 2: Set environment variable for session**

```bash
export AWS_PROFILE=itsaldy
aws s3 ls --no-cli-pager
```

**Option 3: Set default profile permanently**

```bash
echo 'export AWS_PROFILE=itsaldy' >> ~/.bashrc
source ~/.bashrc
```

---

## Which Authentication Method Was Used in This Guide?

This deployment used **Option B (IAM Identity Center)** because:

- We wanted to learn AWS best practices
- The temporary credentials are more secure
- It's the approach used in professional environments

However, **Option A (IAM User) works perfectly fine** for this deployment and is simpler if you want to avoid the AWS Organizations setup.

---

## S3 Bucket Configuration

### Step 1: Create S3 Buckets

Two buckets were created:

- `doable.io` - Primary bucket for hosting files
- `www.doable.io` - For potential www redirect (not used in final setup)

**Note:** Bucket names don't need to match a domain you own. They're just identifiers.

### Step 2: Upload Built Files

```bash
# Build your React app
npm run build

# Upload to S3
aws s3 sync dist/ s3://doable.io --delete --no-cli-pager
```

**What `--delete` does:** Removes files from S3 that don't exist locally, keeping the bucket clean.

### Step 3: Enable Static Website Hosting

```bash
aws s3 website s3://doable.io/ \
  --index-document index.html \
  --error-document index.html
```

**Why error-document is index.html:** React apps use client-side routing. When someone visits `/about`, S3 won't find an `about.html` file. By pointing errors to `index.html`, React Router can handle the routing.

### Step 4: Disable Block Public Access

```bash
aws s3api put-public-access-block \
  --bucket doable.io \
  --public-access-block-configuration \
  "BlockPublicAcls=false,IgnorePublicAcls=false,BlockPublicPolicy=false,RestrictPublicBuckets=false"
```

**Why this is needed:** AWS blocks public access by default for security. For a website, we want files to be publicly readable.

### Step 5: Add Bucket Policy for Public Read

```bash
aws s3api put-bucket-policy --bucket doable.io --policy '{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::doable.io/*"
    }
  ]
}'
```

**What this does:** Allows anyone to read (download) files from your bucket.

### S3 Website Endpoint

After configuration, your site is accessible at:

```
http://doable.io.s3-website-ap-southeast-1.amazonaws.com
```

**Limitation:** This is HTTP only (not secure). CloudFront is needed for HTTPS.

---

## CloudFront Distribution Setup

### Why CloudFront?

- **HTTPS Support**: S3 static websites don't support HTTPS directly
- **Global CDN**: Fast delivery from edge locations worldwide
- **Caching**: Reduces load on S3 and improves performance
- **Free Tier**: 1 TB data transfer out per month for 12 months

### Step 1: Create CloudFront Configuration

Create `cloudfront-config.json`:

```json
{
    "CallerReference": "doable-io-1760803286",
    "Comment": "CloudFront distribution for doable.io S3 website",
    "Enabled": true,
    "Origins": {
        "Quantity": 1,
        "Items": [
            {
                "Id": "S3-doable-io",
                "DomainName": "doable.io.s3-website-ap-southeast-1.amazonaws.com",
                "CustomOriginConfig": {
                    "HTTPPort": 80,
                    "HTTPSPort": 443,
                    "OriginProtocolPolicy": "http-only"
                }
            }
        ]
    },
    "DefaultRootObject": "index.html",
    "DefaultCacheBehavior": {
        "TargetOriginId": "S3-doable-io",
        "ViewerProtocolPolicy": "redirect-to-https",
        "AllowedMethods": {
            "Quantity": 2,
            "Items": ["GET", "HEAD"],
            "CachedMethods": {
                "Quantity": 2,
                "Items": ["GET", "HEAD"]
            }
        },
        "Compress": true,
        "ForwardedValues": {
            "QueryString": false,
            "Cookies": {
                "Forward": "none"
            }
        },
        "MinTTL": 0,
        "DefaultTTL": 86400,
        "MaxTTL": 31536000,
        "TrustedSigners": {
            "Enabled": false,
            "Quantity": 0
        }
    },
    "CustomErrorResponses": {
        "Quantity": 1,
        "Items": [
            {
                "ErrorCode": 404,
                "ResponsePagePath": "/index.html",
                "ResponseCode": "200",
                "ErrorCachingMinTTL": 300
            }
        ]
    },
    "PriceClass": "PriceClass_All"
}
```

**Key Configuration Explained:**

- **OriginProtocolPolicy: "http-only"**: CloudFront fetches from S3 website endpoint via HTTP
- **ViewerProtocolPolicy: "redirect-to-https"**: Users always get HTTPS
- **Compress: true**: Automatically compresses files for faster delivery
- **CustomErrorResponses**: Returns `index.html` for 404 errors (React Router support)
- **DefaultTTL: 86400**: Cache files for 24 hours by default

### Step 2: Create Distribution

```bash
aws cloudfront create-distribution --distribution-config file://cloudfront-config.json
```

**Output includes:**

- **Distribution ID**: `EZLPYGXJSN06R`
- **Domain Name**: `d3oisvzydii1gm.cloudfront.net`
- **Status**: `InProgress`

### Step 3: Wait for Deployment

```bash
aws cloudfront get-distribution --id EZLPYGXJSN06R --query 'Distribution.Status'
```

**Expected statuses:**

- `"InProgress"`: Still deploying (10-15 minutes)
- `"Deployed"`: Ready to use

### Step 4: Access Your Site

Once deployed, visit:

```
https://d3oisvzydii1gm.cloudfront.net
```

You now have:

- ✅ HTTPS enabled (secure padlock)
- ✅ Global CDN delivery
- ✅ Automatic compression
- ✅ React Router support

---

## Deployment Workflow

### Initial Deployment

1. Build your React app:

    ```bash
    npm run build
    ```

2. Upload to S3:

    ```bash
    aws s3 sync dist/ s3://doable.io --delete
    ```

3. Wait for CloudFront to serve new files (or invalidate cache)

### Updating Your App

When you make changes:

1. **Build:**

    ```bash
    npm run build
    ```

2. **Upload to S3:**

    ```bash
    aws s3 sync dist/ s3://doable.io --delete
    ```

3. **Invalidate CloudFront cache** (so it serves new files immediately):
    ```bash
    aws cloudfront create-invalidation \
      --distribution-id EZLPYGXJSN06R \
      --paths "/*"
    ```

**Note:** CloudFront caches files for 24 hours by default. Invalidation forces it to fetch fresh files from S3.

**Cost of invalidation:** First 1,000 paths per month are free, then $0.005 per path.

---

## Lessons Learned

### Lesson 1: Free Tier vs Paid Plan Confusion

**What happened:** Enabling AWS Organizations triggered an email saying the account was "upgraded to a paid plan."

**The truth:**

- AWS Organizations is a free service
- Enabling it does NOT remove Free Tier benefits
- Free Tier eligibility is based on usage and account age (12 months from creation)
- The "upgrade" message is misleading - it just means you can now use Organizations features

**Lesson:** Always verify AWS documentation before panicking about billing changes.

### Lesson 2: Domain Ownership is Required for Custom Domains

**What happened:** We set up Route 53 and requested an SSL certificate for `doable.io` without owning the domain.

**The problem:**

- SSL certificate validation requires proving domain ownership
- Route 53 hosted zones are useless without owning the domain
- No one can visit your site at a domain you don't own

**The solution:**

- Use CloudFront's default domain (`d3oisvzydii1gm.cloudfront.net`)
- CloudFront provides free HTTPS with its default certificate
- Buy a domain later if needed and point it to CloudFront

**Lesson:** Always verify domain ownership before setting up DNS and certificates.

### Lesson 3: CloudFront Certificates Must Be in us-east-1

**What happened:** Confusion about why certificates need to be in `us-east-1` when the bucket is in `ap-southeast-1`.

**The reason:**

- CloudFront is a global service
- Its control plane is in `us-east-1`
- Certificates for CloudFront MUST be in `us-east-1`
- This doesn't affect performance - CloudFront distributes certificates globally

**Lesson:** Some AWS services have region-specific requirements regardless of where your resources are.

### Lesson 4: Route 53 Costs Money Even When Unused

**What happened:** Created a Route 53 hosted zone that we couldn't use (no domain ownership).

**The cost:** $0.50/month per hosted zone, even if unused.

**The solution:** Delete unused hosted zones immediately to avoid charges.

**Lesson:** Clean up AWS resources you're not using to minimize costs.

### Lesson 5: S3 Block Public Access is Enabled by Default

**What happened:** Bucket policy failed with "AccessDenied" error.

**The reason:** AWS blocks public policies by default for security.

**The solution:** Explicitly disable block public access for website buckets.

**Lesson:** AWS prioritizes security by default. You must explicitly allow public access when needed.

### Lesson 6: Always Use --no-cli-pager

**What happened:** AWS CLI commands would hang waiting for user input in pagers.

**The solution:** Always add `--no-cli-pager` flag to CLI commands.

**Lesson:** Configure CLI tools for non-interactive use in scripts and automation.

---

## Cost Breakdown

### Monthly Costs (Estimated)

| Service                      | Cost             | Notes                                       |
| ---------------------------- | ---------------- | ------------------------------------------- |
| S3 Storage                   | ~$0.01           | For ~10MB of files                          |
| S3 Requests                  | ~$0.00           | Minimal GET requests (CloudFront caches)    |
| CloudFront                   | $0.00            | Within Free Tier (1 TB/month for 12 months) |
| CloudFront (after Free Tier) | ~$0.85           | For 10 GB data transfer                     |
| **Total (Year 1)**           | **~$0.01/month** |                                             |
| **Total (After Year 1)**     | **~$0.86/month** |                                             |

### One-Time Costs

| Item                  | Cost        | Notes                       |
| --------------------- | ----------- | --------------------------- |
| Domain (if purchased) | $12-15/year | For .com or .io domains     |
| Route 53 Hosted Zone  | $0.50/month | Only if using custom domain |

### Cost Optimization Tips

1. **Use CloudFront Free Tier**: 1 TB/month is generous for small projects
2. **Avoid Route 53**: Use CloudFront default domain to save $0.50/month
3. **Enable compression**: Reduces data transfer costs
4. **Set appropriate cache TTLs**: Reduces S3 requests
5. **Delete unused resources**: Hosted zones, distributions, buckets

---

## Troubleshooting

### Issue: "No AWS accounts are available to you"

**Cause:** User not assigned to AWS account in IAM Identity Center (only applies to Option B).

**Solution:**

1. Go to IAM Identity Center console
2. Click "AWS accounts"
3. Select your account
4. Click "Assign users or groups"
5. Select your user and assign a permission set

### Issue: "InvalidAccessKeyId" or "SignatureDoesNotMatch"

**Cause:** Incorrect access keys configured (only applies to Option A).

**Solution:**

1. Verify your access keys in `~/.aws/credentials`
2. Regenerate access keys in IAM console if needed
3. Run `aws configure` again with correct keys

### Issue: "AccessDenied" when setting bucket policy

**Cause:** Block Public Access is enabled on the bucket.

**Solution:**

```bash
aws s3api put-public-access-block \
  --bucket doable.io \
  --public-access-block-configuration \
  "BlockPublicAcls=false,IgnorePublicAcls=false,BlockPublicPolicy=false,RestrictPublicBuckets=false"
```

### Issue: CloudFront shows old content after update

**Cause:** CloudFront caches files for 24 hours by default.

**Solution:** Create an invalidation:

```bash
aws cloudfront create-invalidation \
  --distribution-id EZLPYGXJSN06R \
  --paths "/*"
```

### Issue: React Router routes return 404

**Cause:** CloudFront doesn't know about client-side routes.

**Solution:** Configure custom error responses to return `index.html` for 404 errors (already done in our config).

### Issue: Certificate validation stuck on "PENDING_VALIDATION"

**Cause:** DNS records not properly configured or domain not owned.

**Solution:**

- Verify you own the domain
- Check DNS records are correct in Route 53
- Wait up to 30 minutes for DNS propagation

### Issue: "Profile not found" error

**Cause:** AWS CLI profile name mismatch.

**Solution:** Check your profile name in `~/.aws/config` and use it consistently:

```bash
cat ~/.aws/config | grep "profile"
aws s3 ls --profile YOUR_PROFILE_NAME
```

---

## Quick Reference Commands

### AWS CLI Authentication

**For IAM Identity Center (Option B):**

```bash
# Login to SSO
aws sso login --profile itsaldy

# Check current identity
aws sts get-caller-identity --no-cli-pager

# Set default profile
export AWS_PROFILE=itsaldy
```

**For IAM User (Option A):**

```bash
# Check current identity (no login needed)
aws sts get-caller-identity --no-cli-pager

# Set default profile (if using multiple profiles)
export AWS_PROFILE=personal
```

### S3 Operations

```bash
# Upload files
aws s3 sync dist/ s3://doable.io --delete

# List bucket contents
aws s3 ls s3://doable.io/

# Enable website hosting
aws s3 website s3://doable.io/ \
  --index-document index.html \
  --error-document index.html
```

### CloudFront Operations

```bash
# Check distribution status
aws cloudfront get-distribution \
  --id EZLPYGXJSN06R \
  --query 'Distribution.Status'

# Create invalidation
aws cloudfront create-invalidation \
  --distribution-id EZLPYGXJSN06R \
  --paths "/*"

# List distributions
aws cloudfront list-distributions \
  --query 'DistributionList.Items[*].[Id,DomainName,Status]' \
  --output table
```

---

## Resources

### AWS Documentation

- [IAM User Guide](https://docs.aws.amazon.com/IAM/latest/UserGuide/)
- [AWS CLI Configuration Basics](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-quickstart.html)
- [IAM Identity Center User Guide](https://docs.aws.amazon.com/singlesignon/latest/userguide/)
- [AWS CLI Configuration with SSO](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-sso.html)
- [S3 Static Website Hosting](https://docs.aws.amazon.com/AmazonS3/latest/userguide/WebsiteHosting.html)
- [CloudFront Developer Guide](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/)

### Useful Tools

- [AWS Pricing Calculator](https://calculator.aws/)
- [AWS Free Tier](https://aws.amazon.com/free/)

---

## Conclusion

This deployment journey taught valuable lessons about:

- AWS CLI authentication options (IAM User vs IAM Identity Center)
- S3 static website hosting
- CloudFront CDN configuration
- Cost optimization strategies
- The importance of verifying assumptions (like domain ownership)
- Free Tier considerations and AWS Organizations impact

The final setup provides a professional, secure, and cost-effective hosting solution for React applications, with room to add a custom domain in the future if needed.

**Live Site:** https://d3oisvzydii1gm.cloudfront.net

**Total Monthly Cost:** ~$0.01 (within Free Tier)

**Authentication Method Used:** IAM Identity Center (but IAM User works equally well)
