# AWS Deployment Options for Frontend-Only Web Applications

## Task Summary & Goal

**Objective:** Provide comprehensive recommendations for deploying the Todo List frontend-only web application using viable AWS services, with analysis of trade-offs, costs, and implementation strategies.

**Date:** October 18, 2025

**Context:** The Todo List application is a static frontend application built with React, TypeScript, and Tailwind CSS. It uses localStorage for data persistence and requires no backend infrastructure. This document explores AWS deployment options suitable for this architecture.

---

## Analysis & Rationale

### Application Characteristics

**Current Architecture:**

- **Type:** Single Page Application (SPA)
- **Framework:** React 18 + TypeScript
- **Build Output:** Static HTML, CSS, and JavaScript files
- **Data Storage:** Browser localStorage (client-side only)
- **API Requirements:** None (fully client-side)
- **Build Size:** ~500KB (estimated after optimization)

**Deployment Requirements:**

- ✅ Serve static files (HTML, CSS, JS)
- ✅ HTTPS support
- ✅ Custom domain support (optional)
- ✅ Fast global delivery (CDN)
- ✅ Automatic HTTPS certificate management
- ✅ Cost-effective for low-traffic applications
- ✅ Easy deployment and updates
- ✅ Rollback capability

**Non-Requirements:**

- ❌ Server-side rendering (SSR)
- ❌ Backend API
- ❌ Database
- ❌ Authentication service (currently)
- ❌ Server-side logic

---

## Deliverables & Outcomes

## Option 1: Amazon S3 + CloudFront (Recommended)

### Architecture Overview

```
┌─────────────┐
│   User      │
└──────┬──────┘
       │ HTTPS
       ▼
┌─────────────────────┐
│   CloudFront CDN    │  ← Global edge locations
│   (Distribution)    │  ← SSL/TLS termination
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│   S3 Bucket         │  ← Static file storage
│   (Origin)          │  ← Versioning enabled
└─────────────────────┘
```

### Implementation Steps

#### Step 1: Build Application

```bash
# Build optimized production bundle
npm run build

# Output directory: dist/
# Contains: index.html, assets/*.js, assets/*.css
```

#### Step 2: Create S3 Bucket

```bash
# Create bucket (replace with your bucket name)
aws s3 mb s3://my-todo-app-frontend --region us-east-1

# Enable versioning for rollback capability
aws s3api put-bucket-versioning \
  --bucket my-todo-app-frontend \
  --versioning-configuration Status=Enabled

# Block public access (CloudFront will access via OAI)
aws s3api put-public-access-block \
  --bucket my-todo-app-frontend \
  --public-access-block-configuration \
    "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true"
```

#### Step 3: Upload Build Files

```bash
# Sync build files to S3
aws s3 sync dist/ s3://my-todo-app-frontend/ \
  --delete \
  --cache-control "public, max-age=31536000, immutable" \
  --exclude "index.html"

# Upload index.html with shorter cache (for updates)
aws s3 cp dist/index.html s3://my-todo-app-frontend/index.html \
  --cache-control "public, max-age=0, must-revalidate"
```

#### Step 4: Create CloudFront Distribution

```bash
# Create Origin Access Identity (OAI)
aws cloudfront create-cloud-front-origin-access-identity \
  --cloud-front-origin-access-identity-config \
    CallerReference="my-todo-app-$(date +%s)",Comment="OAI for Todo App"

# Note the OAI ID from output, then create distribution
# (Use AWS Console or CloudFormation for easier setup)
```

**CloudFront Configuration (via Console):**

1. **Origin Settings:**
    - Origin Domain: `my-todo-app-frontend.s3.us-east-1.amazonaws.com`
    - Origin Access: Origin Access Identity (OAI)
    - Restrict Bucket Access: Yes

2. **Default Cache Behavior:**
    - Viewer Protocol Policy: Redirect HTTP to HTTPS
    - Allowed HTTP Methods: GET, HEAD, OPTIONS
    - Cache Policy: CachingOptimized
    - Compress Objects: Yes

3. **Distribution Settings:**
    - Price Class: Use All Edge Locations (or select based on audience)
    - Alternate Domain Names (CNAMEs): `todo.yourdomain.com` (optional)
    - SSL Certificate: Default CloudFront Certificate or Custom ACM Certificate
    - Default Root Object: `index.html`

4. **Error Pages (for SPA routing):**
    - 403 Error → `/index.html` (200 response)
    - 404 Error → `/index.html` (200 response)

#### Step 5: Update S3 Bucket Policy

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "AllowCloudFrontOAI",
            "Effect": "Allow",
            "Principal": {
                "AWS": "arn:aws:iam::cloudfront:user/CloudFront Origin Access Identity YOUR_OAI_ID"
            },
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::my-todo-app-frontend/*"
        }
    ]
}
```

#### Step 6: Configure Custom Domain (Optional)

```bash
# Request ACM certificate in us-east-1 (required for CloudFront)
aws acm request-certificate \
  --domain-name todo.yourdomain.com \
  --validation-method DNS \
  --region us-east-1

# Validate certificate via DNS (add CNAME records)
# Then add CNAME to CloudFront distribution

# Create Route 53 alias record
aws route53 change-resource-record-sets \
  --hosted-zone-id YOUR_ZONE_ID \
  --change-batch file://route53-change.json
```

**route53-change.json:**

```json
{
    "Changes": [
        {
            "Action": "CREATE",
            "ResourceRecordSet": {
                "Name": "todo.yourdomain.com",
                "Type": "A",
                "AliasTarget": {
                    "HostedZoneId": "Z2FDTNDATAQYW2",
                    "DNSName": "d1234567890.cloudfront.net",
                    "EvaluateTargetHealth": false
                }
            }
        }
    ]
}
```

### Deployment Automation Script

```bash
#!/bin/bash
# deploy.sh

set -e

BUCKET_NAME="my-todo-app-frontend"
DISTRIBUTION_ID="E1234567890ABC"

echo "Building application..."
npm run build

echo "Uploading to S3..."
aws s3 sync dist/ s3://$BUCKET_NAME/ \
  --delete \
  --cache-control "public, max-age=31536000, immutable" \
  --exclude "index.html"

aws s3 cp dist/index.html s3://$BUCKET_NAME/index.html \
  --cache-control "public, max-age=0, must-revalidate"

echo "Invalidating CloudFront cache..."
aws cloudfront create-invalidation \
  --distribution-id $DISTRIBUTION_ID \
  --paths "/*"

echo "Deployment complete!"
echo "URL: https://d1234567890.cloudfront.net"
```

### Cost Estimation

**Monthly Costs (Low Traffic - 10,000 requests/month):**

| Service                  | Usage         | Cost             |
| ------------------------ | ------------- | ---------------- |
| S3 Storage               | 1 GB          | $0.023           |
| S3 Requests              | 10,000 GET    | $0.004           |
| CloudFront Data Transfer | 10 GB         | $0.85            |
| CloudFront Requests      | 10,000        | $0.01            |
| Route 53 (optional)      | 1 hosted zone | $0.50            |
| ACM Certificate          | Free          | $0.00            |
| **Total**                |               | **~$1.40/month** |

**Monthly Costs (Medium Traffic - 100,000 requests/month):**

| Service                  | Usage         | Cost             |
| ------------------------ | ------------- | ---------------- |
| S3 Storage               | 1 GB          | $0.023           |
| S3 Requests              | 100,000 GET   | $0.04            |
| CloudFront Data Transfer | 100 GB        | $8.50            |
| CloudFront Requests      | 100,000       | $0.10            |
| Route 53 (optional)      | 1 hosted zone | $0.50            |
| **Total**                |               | **~$9.20/month** |

### Pros & Cons

**Advantages:**

- ✅ **Highly Scalable:** Handles traffic spikes automatically
- ✅ **Global Performance:** CloudFront edge locations worldwide
- ✅ **Cost-Effective:** Pay only for what you use
- ✅ **Secure:** HTTPS by default, DDoS protection
- ✅ **Reliable:** 99.99% SLA for S3 and CloudFront
- ✅ **Simple:** No server management required
- ✅ **Versioning:** Easy rollbacks with S3 versioning
- ✅ **Free Tier:** 50 GB data transfer/month for first year

**Disadvantages:**

- ⚠️ **Cache Invalidation:** CloudFront cache can delay updates (mitigated with invalidations)
- ⚠️ **Setup Complexity:** Initial setup requires multiple services
- ⚠️ **Propagation Time:** CloudFront distribution takes 15-20 minutes to deploy

**Best For:**

- Production applications
- Global audience
- High availability requirements
- Cost-conscious projects
- Applications requiring CDN performance

---

## Option 2: AWS Amplify Hosting

### Architecture Overview

```
┌─────────────┐
│   User      │
└──────┬──────┘
       │ HTTPS
       ▼
┌─────────────────────┐
│  Amplify Hosting    │  ← Managed hosting service
│  (CDN + CI/CD)      │  ← Automatic builds
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│   Git Repository    │  ← GitHub/GitLab/Bitbucket
│   (Source)          │  ← Automatic deployments
└─────────────────────┘
```

### Implementation Steps

#### Step 1: Connect Git Repository

```bash
# Install Amplify CLI
npm install -g @aws-amplify/cli

# Initialize Amplify project
amplify init

# Add hosting
amplify add hosting

# Select: Hosting with Amplify Console
# Select: Continuous deployment
```

#### Step 2: Configure Build Settings

**amplify.yml:**

```yaml
version: 1
frontend:
    phases:
        preBuild:
            commands:
                - npm ci
        build:
            commands:
                - npm run build
    artifacts:
        baseDirectory: dist
        files:
            - '**/*'
    cache:
        paths:
            - node_modules/**/*
```

#### Step 3: Deploy

```bash
# Push to Git repository
git add .
git commit -m "Initial commit"
git push origin main

# Amplify automatically detects and deploys
# Or manually trigger:
amplify publish
```

#### Step 4: Configure Custom Domain

```bash
# Add custom domain via Amplify Console
# Amplify automatically provisions ACM certificate
# DNS verification required
```

### Cost Estimation

**Monthly Costs (Low Traffic):**

| Service                 | Usage             | Cost              |
| ----------------------- | ----------------- | ----------------- |
| Build Minutes           | 10 builds × 5 min | $0.01/min = $0.50 |
| Hosting (Data Transfer) | 10 GB             | $0.15/GB = $1.50  |
| Hosting (Requests)      | 10,000            | Free (included)   |
| **Total**               |                   | **~$2.00/month**  |

**Free Tier:**

- 1,000 build minutes/month
- 15 GB data transfer/month
- 5 GB storage

### Pros & Cons

**Advantages:**

- ✅ **Fully Managed:** No infrastructure management
- ✅ **CI/CD Built-in:** Automatic deployments from Git
- ✅ **Preview Deployments:** Branch previews for testing
- ✅ **Easy Setup:** Minimal configuration required
- ✅ **Custom Domains:** Automatic SSL certificate provisioning
- ✅ **Rollbacks:** Easy rollback to previous deployments
- ✅ **Environment Variables:** Built-in secrets management
- ✅ **Monitoring:** Built-in analytics and logs

**Disadvantages:**

- ⚠️ **Higher Cost:** More expensive than S3 + CloudFront for high traffic
- ⚠️ **Less Control:** Limited customization options
- ⚠️ **Vendor Lock-in:** Amplify-specific configuration
- ⚠️ **Build Time:** Requires build on every deployment

**Best For:**

- Rapid prototyping
- Teams wanting CI/CD out of the box
- Projects with frequent deployments
- Developers new to AWS
- Applications with moderate traffic

---

## Option 3: Amazon S3 Static Website Hosting (Basic)

### Architecture Overview

```
┌─────────────┐
│   User      │
└──────┬──────┘
       │ HTTP
       ▼
┌─────────────────────┐
│   S3 Bucket         │  ← Static website hosting
│   (Public)          │  ← No CDN
└─────────────────────┘
```

### Implementation Steps

#### Step 1: Create and Configure Bucket

```bash
# Create bucket
aws s3 mb s3://my-todo-app-website --region us-east-1

# Enable static website hosting
aws s3 website s3://my-todo-app-website \
  --index-document index.html \
  --error-document index.html

# Make bucket public
aws s3api put-bucket-policy \
  --bucket my-todo-app-website \
  --policy file://bucket-policy.json
```

**bucket-policy.json:**

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::my-todo-app-website/*"
        }
    ]
}
```

#### Step 2: Upload Files

```bash
# Upload build files
aws s3 sync dist/ s3://my-todo-app-website/ --delete

# Website URL: http://my-todo-app-website.s3-website-us-east-1.amazonaws.com
```

### Cost Estimation

**Monthly Costs (Low Traffic):**

| Service          | Usage      | Cost             |
| ---------------- | ---------- | ---------------- |
| S3 Storage       | 1 GB       | $0.023           |
| S3 Requests      | 10,000 GET | $0.004           |
| S3 Data Transfer | 10 GB      | $0.90            |
| **Total**        |            | **~$0.93/month** |

### Pros & Cons

**Advantages:**

- ✅ **Cheapest Option:** Minimal costs
- ✅ **Simple Setup:** Single service
- ✅ **Fast Deployment:** No CDN propagation time

**Disadvantages:**

- ❌ **No HTTPS:** HTTP only (not recommended for production)
- ❌ **No CDN:** Slower for global users
- ❌ **No Custom Domain:** S3 URL only (or requires CloudFront)
- ❌ **Limited Performance:** No edge caching
- ❌ **Security Concerns:** Public bucket required

**Best For:**

- Development/testing environments
- Internal tools
- Proof of concepts
- **NOT recommended for production**

---

## Option 4: AWS App Runner (Containerized)

### Architecture Overview

```
┌─────────────┐
│   User      │
└──────┬──────┘
       │ HTTPS
       ▼
┌─────────────────────┐
│   App Runner        │  ← Managed container service
│   (Auto-scaling)    │  ← Built-in load balancer
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│   Container Image   │  ← Nginx serving static files
│   (ECR)             │  ← Docker image
└─────────────────────┘
```

### Implementation Steps

#### Step 1: Create Dockerfile

```dockerfile
# Dockerfile
FROM nginx:alpine

# Copy build files
COPY dist/ /usr/share/nginx/html/

# Copy nginx configuration for SPA routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
```

**nginx.conf:**

```nginx
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    # SPA routing - serve index.html for all routes
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

#### Step 2: Build and Push Image

```bash
# Build image
docker build -t my-todo-app .

# Create ECR repository
aws ecr create-repository --repository-name my-todo-app

# Login to ECR
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin \
  123456789012.dkr.ecr.us-east-1.amazonaws.com

# Tag and push
docker tag my-todo-app:latest \
  123456789012.dkr.ecr.us-east-1.amazonaws.com/my-todo-app:latest

docker push 123456789012.dkr.ecr.us-east-1.amazonaws.com/my-todo-app:latest
```

#### Step 3: Create App Runner Service

```bash
# Create service (via Console or CLI)
aws apprunner create-service \
  --service-name my-todo-app \
  --source-configuration file://source-config.json
```

### Cost Estimation

**Monthly Costs (Low Traffic):**

| Service               | Usage            | Cost                             |
| --------------------- | ---------------- | -------------------------------- |
| App Runner (Compute)  | 1 vCPU, 2 GB RAM | $0.064/hour × 730 hours = $46.72 |
| App Runner (Requests) | 10,000           | Free (included)                  |
| ECR Storage           | 1 GB             | $0.10                            |
| **Total**             |                  | **~$47/month**                   |

### Pros & Cons

**Advantages:**

- ✅ **Fully Managed:** No server management
- ✅ **Auto-scaling:** Scales based on traffic
- ✅ **HTTPS Built-in:** Automatic SSL certificates
- ✅ **Container-based:** Flexible deployment options

**Disadvantages:**

- ❌ **Expensive:** Overkill for static sites
- ❌ **Complex Setup:** Requires Docker knowledge
- ❌ **Always Running:** Pays for idle time
- ❌ **No CDN:** Slower for global users

**Best For:**

- Applications that will add backend later
- Teams familiar with containers
- Applications requiring server-side logic
- **NOT recommended for static-only sites**

---

## Comparison Matrix

| Feature                | S3 + CloudFront | Amplify Hosting | S3 Static  | App Runner    |
| ---------------------- | --------------- | --------------- | ---------- | ------------- |
| **Cost (Low Traffic)** | ~$1.40/mo       | ~$2.00/mo       | ~$0.93/mo  | ~$47/mo       |
| **Setup Complexity**   | Medium          | Low             | Low        | High          |
| **HTTPS**              | ✅ Yes          | ✅ Yes          | ❌ No      | ✅ Yes        |
| **CDN**                | ✅ Yes          | ✅ Yes          | ❌ No      | ❌ No         |
| **CI/CD**              | Manual          | ✅ Built-in     | Manual     | Manual        |
| **Custom Domain**      | ✅ Yes          | ✅ Yes          | ⚠️ Limited | ✅ Yes        |
| **Global Performance** | ✅ Excellent    | ✅ Excellent    | ⚠️ Poor    | ⚠️ Regional   |
| **Scalability**        | ✅ Unlimited    | ✅ High         | ✅ High    | ✅ Auto-scale |
| **Rollback**           | ✅ Easy         | ✅ Easy         | Manual     | Manual        |
| **Production Ready**   | ✅ Yes          | ✅ Yes          | ❌ No      | ✅ Yes        |

---

## Synthesis & Future Implications

### Recommended Approach

**For This Project: S3 + CloudFront**

**Rationale:**

1. **Cost-Effective:** ~$1-10/month depending on traffic
2. **Production-Ready:** Enterprise-grade reliability and security
3. **Global Performance:** CloudFront CDN for fast delivery worldwide
4. **Scalable:** Handles traffic spikes automatically
5. **Industry Standard:** Well-documented, widely used pattern

**Implementation Timeline:**

- **Week 1:** Set up S3 bucket and CloudFront distribution
- **Week 2:** Configure custom domain and SSL certificate
- **Week 3:** Create deployment automation script
- **Week 4:** Test and document deployment process

### Migration Path for Future Backend

**If Backend is Added Later:**

```
Current: Frontend (S3 + CloudFront)
         ↓
Future:  Frontend (S3 + CloudFront) → API Gateway → Lambda → DynamoDB
```

**Steps:**

1. Keep frontend deployment unchanged
2. Add API Gateway for backend endpoints
3. Create Lambda functions for business logic
4. Add DynamoDB for data persistence
5. Update frontend to call API instead of localStorage
6. Configure CORS on API Gateway

**Cost Impact:**

- API Gateway: ~$3.50/million requests
- Lambda: ~$0.20/million requests
- DynamoDB: ~$1.25/million reads
- Total: Still very cost-effective for low-medium traffic

### Alternative: Serverless Framework

**For Rapid Backend Addition:**

```bash
# Install Serverless Framework
npm install -g serverless

# Create serverless.yml
service: todo-app-backend

provider:
  name: aws
  runtime: nodejs18.x
  region: us-east-1

functions:
  getTodos:
    handler: handler.getTodos
    events:
      - http:
          path: todos
          method: get
          cors: true

resources:
  Resources:
    TodosTable:
      Type: AWS::DynamoDB::Table
      Properties:
        TableName: todos
        AttributeDefinitions:
          - AttributeName: id
            AttributeType: S
        KeySchema:
          - AttributeName: id
            KeyType: HASH
        BillingMode: PAY_PER_REQUEST
```

### Infrastructure as Code

**Recommended: AWS CDK**

```typescript
// lib/todo-app-stack.ts
import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';

export class TodoAppStack extends cdk.Stack {
    constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        // S3 bucket for static files
        const bucket = new s3.Bucket(this, 'TodoAppBucket', {
            versioned: true,
            removalPolicy: cdk.RemovalPolicy.DESTROY,
            autoDeleteObjects: true,
        });

        // CloudFront distribution
        const distribution = new cloudfront.CloudFrontWebDistribution(
            this,
            'TodoAppDistribution',
            {
                originConfigs: [
                    {
                        s3OriginSource: {
                            s3BucketSource: bucket,
                        },
                        behaviors: [{ isDefaultBehavior: true }],
                    },
                ],
                errorConfigurations: [
                    {
                        errorCode: 403,
                        responseCode: 200,
                        responsePagePath: '/index.html',
                    },
                    {
                        errorCode: 404,
                        responseCode: 200,
                        responsePagePath: '/index.html',
                    },
                ],
            }
        );

        // Deploy build files
        new s3deploy.BucketDeployment(this, 'DeployWebsite', {
            sources: [s3deploy.Source.asset('./dist')],
            destinationBucket: bucket,
            distribution,
            distributionPaths: ['/*'],
        });

        // Output CloudFront URL
        new cdk.CfnOutput(this, 'DistributionUrl', {
            value: distribution.distributionDomainName,
        });
    }
}
```

**Deploy:**

```bash
npm install -g aws-cdk
cdk init app --language typescript
cdk deploy
```

---

## Next Steps

### Immediate Actions (Week 1)

1. ✅ Document deployment options (this document)
2. 📋 Choose deployment strategy (S3 + CloudFront recommended)
3. 📋 Set up AWS account and configure credentials
4. 📋 Create S3 bucket and CloudFront distribution

### Short-term Goals (Month 1)

- Deploy application to production
- Configure custom domain (if desired)
- Set up deployment automation script
- Document deployment process for team
- Monitor costs and performance

### Long-term Goals (Months 2-6)

- Implement CI/CD pipeline (GitHub Actions or AWS CodePipeline)
- Add monitoring and alerting (CloudWatch)
- Consider adding backend API if needed
- Implement analytics (CloudWatch RUM or Google Analytics)
- Optimize performance (bundle size, caching)

---

## Security Best Practices

### S3 Bucket Security

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "DenyInsecureTransport",
            "Effect": "Deny",
            "Principal": "*",
            "Action": "s3:*",
            "Resource": [
                "arn:aws:s3:::my-todo-app-frontend",
                "arn:aws:s3:::my-todo-app-frontend/*"
            ],
            "Condition": {
                "Bool": {
                    "aws:SecureTransport": "false"
                }
            }
        }
    ]
}
```

### CloudFront Security Headers

```javascript
// Lambda@Edge function for security headers
exports.handler = async (event) => {
    const response = event.Records[0].cf.response;
    const headers = response.headers;

    headers['strict-transport-security'] = [
        {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubdomains; preload',
        },
    ];

    headers['x-content-type-options'] = [
        {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
        },
    ];

    headers['x-frame-options'] = [
        {
            key: 'X-Frame-Options',
            value: 'DENY',
        },
    ];

    headers['x-xss-protection'] = [
        {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
        },
    ];

    return response;
};
```

### Content Security Policy

```html
<!-- Add to index.html -->
<meta
    http-equiv="Content-Security-Policy"
    content="default-src 'self';
               script-src 'self' 'unsafe-inline';
               style-src 'self' 'unsafe-inline';
               img-src 'self' data:;"
/>
```

---

## Monitoring & Observability

### CloudWatch Metrics

**Key Metrics to Monitor:**

- CloudFront: Requests, Bytes Downloaded, Error Rate
- S3: Bucket Size, Request Count
- Cost: Daily spend alerts

**CloudWatch Alarm Example:**

```bash
aws cloudwatch put-metric-alarm \
  --alarm-name high-error-rate \
  --alarm-description "Alert when error rate exceeds 5%" \
  --metric-name 5xxErrorRate \
  --namespace AWS/CloudFront \
  --statistic Average \
  --period 300 \
  --threshold 5 \
  --comparison-operator GreaterThanThreshold \
  --evaluation-periods 2
```

### Cost Monitoring

```bash
# Set up billing alert
aws budgets create-budget \
  --account-id 123456789012 \
  --budget file://budget.json \
  --notifications-with-subscribers file://notifications.json
```

---

## References & Resources

### AWS Documentation

- [S3 Static Website Hosting](https://docs.aws.amazon.com/AmazonS3/latest/userguide/WebsiteHosting.html)
- [CloudFront Documentation](https://docs.aws.amazon.com/cloudfront/)
- [AWS Amplify Hosting](https://docs.amplify.aws/)
- [AWS App Runner](https://docs.aws.amazon.com/apprunner/)

### Tutorials

- [Host a Static Website on AWS](https://aws.amazon.com/getting-started/hands-on/host-static-website/)
- [Deploy React App to S3 and CloudFront](https://aws.amazon.com/blogs/networking-and-content-delivery/amazon-s3-amazon-cloudfront-a-match-made-in-the-cloud/)

### Tools

- [AWS CLI](https://aws.amazon.com/cli/)
- [AWS CDK](https://aws.amazon.com/cdk/)
- [Serverless Framework](https://www.serverless.com/)

---

## Conclusion

For the Todo List frontend-only application, **Amazon S3 + CloudFront** is the recommended deployment solution. It provides:

- ✅ **Production-grade reliability and security**
- ✅ **Global CDN performance**
- ✅ **Cost-effective pricing** (~$1-10/month)
- ✅ **Easy scalability** for future growth
- ✅ **Industry-standard architecture**

The implementation is straightforward, well-documented, and provides a solid foundation for future enhancements, including potential backend integration.

**Status:** Recommendations Complete ✅ | Ready for Implementation ✅ | Cost Analysis Provided ✅
