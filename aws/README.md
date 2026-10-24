# AWS Deployment Guide for SchemeSaathi AI

## Overview
This document describes how to deploy the SchemeSaathi AI backend to AWS.

### Prerequisites
- AWS CLI configured
- Docker installed
- Terraform or AWS CDK (optional, for IaC)

## 1. ECS Fargate Setup
- Create an ECR repository and push the FastAPI docker image.
- Create an ECS Task Definition using AWS Fargate.
- Expose port 8000 for FastAPI.

## 2. RDS PostgreSQL Setup
- Create an RDS PostgreSQL instance.
- Update `DATABASE_URL` in your `.env` or AWS Secrets Manager.
- Ensure the ECS task's security group can access the RDS security group on port 5432.

## 3. S3 Bucket Policy
- Create an S3 bucket (e.g., `schemesaathi-documents-prod`).
- Ensure Block Public Access is ON.
- Set a bucket policy that only allows the ECS Task Role to `s3:PutObject` and `s3:GetObject`.

## 4. Bedrock Access
- Go to the Amazon Bedrock console.
- Ensure Model Access is requested and approved for:
  - `anthropic.claude-3-haiku-20240307-v1:0`
  - `amazon.titan-embed-text-v1`

## 5. IAM Policy (Task Role)
Attach this policy to your ECS Task Role:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["bedrock:InvokeModel"],
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": ["s3:PutObject", "s3:GetObject"],
      "Resource": ["arn:aws:s3:::schemesaathi-documents-prod/*"]
    },
    {
      "Effect": "Allow",
      "Action": ["textract:DetectDocumentText"],
      "Resource": "*"
    }
  ]
}
```

## 6. API Gateway (Optional)
- Setup an API Gateway HTTP API.
- Create an integration routing traffic to an internal ALB or directly via Cloud Map (Service Connect).

## 7. CloudWatch Logs
- Create a CloudWatch log group `/ecs/schemesaathi-backend`.
- Configure `awslogs` driver in your ECS task definition.
