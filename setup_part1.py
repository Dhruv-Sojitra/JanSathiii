import os

files = {
    r"c:\Users\ASUS\Desktop\CloudNova\schemesaathi-ai\backend\requirements.txt": """fastapi==0.111.0
uvicorn[standard]==0.30.1
sqlalchemy==2.0.31
alembic==1.13.2
pydantic==2.7.4
pydantic-settings==2.3.4
python-multipart==0.0.9
python-dotenv==1.0.1
boto3==1.34.144
botocore==1.34.144
aiofiles==23.2.1
pillow==10.4.0
numpy==1.26.4
psycopg2-binary==2.9.9
httpx==0.27.0
python-jose[cryptography]==3.3.0
bcrypt==4.1.3
passlib[bcrypt]==1.7.4""",
    r"c:\Users\ASUS\Desktop\CloudNova\schemesaathi-ai\backend\.env.example": """# Database
DATABASE_URL=sqlite:///./schemesaathi.db
# For PostgreSQL: postgresql://user:password@localhost:5432/schemesaathi

# AWS
AWS_REGION=ap-south-1
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_SESSION_TOKEN=

# Amazon Bedrock
AWS_BEDROCK_MODEL_ID=anthropic.claude-3-haiku-20240307-v1:0
AWS_BEDROCK_EMBEDDING_MODEL_ID=amazon.titan-embed-text-v1

# Amazon S3
AWS_S3_BUCKET=schemesaathi-documents

# App
APP_ENV=development
SECRET_KEY=changeme-in-production
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
MAX_UPLOAD_SIZE_MB=10

# Mock mode (set to true to skip AWS calls)
USE_MOCK_AI=true
USE_MOCK_S3=true
USE_MOCK_TEXTRACT=true"""
}

for path, content in files.items():
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)

print("Created first batch of files")
