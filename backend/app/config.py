from pydantic_settings import BaseSettings
from functools import lru_cache
import os

class Settings(BaseSettings):
    database_url: str = "sqlite:///./schemesaathi.db"  # overridden by Render's DATABASE_URL in production
    aws_region: str = "ap-south-1"
    aws_access_key_id: str = ""
    aws_secret_access_key: str = ""
    aws_session_token: str = ""
    aws_bedrock_model_id: str = "anthropic.claude-3-haiku-20240307-v1:0"
    aws_bedrock_embedding_model_id: str = "amazon.titan-embed-text-v1"
    aws_s3_bucket: str = "schemesaathi-documents"
    app_env: str = "development"
    secret_key: str = "changeme-in-production"
    allowed_origins: str = "http://localhost:5173,http://localhost:3000"
    max_upload_size_mb: int = 10
    use_mock_ai: bool = True
    use_mock_s3: bool = True
    use_mock_textract: bool = True

    class Config:
        env_file = ".env"
        extra = "ignore"

    @property
    def origins_list(self) -> list[str]:
        if self.allowed_origins.strip() == '*':
            return ['*']
        return [o.strip() for o in self.allowed_origins.split(",")]

    @property
    def is_aws_configured(self) -> bool:
        return bool(self.aws_access_key_id and self.aws_secret_access_key)

@lru_cache()
def get_settings() -> Settings:
    return Settings()
