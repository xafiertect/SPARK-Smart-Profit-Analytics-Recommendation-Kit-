import asyncio
import os
import sys

# Add backend to sys.path to import core.config
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from core.config import settings
from google import genai

async def test_key():
    print(f"Testing Gemini API Key: {settings.GEMINI_API_KEY[:8]}...{settings.GEMINI_API_KEY[-4:]}")
    print(f"Model: {settings.GEMINI_MODEL}")
    
    client = genai.Client(api_key=settings.GEMINI_API_KEY)
    try:
        response = client.models.generate_content(
            model=settings.GEMINI_MODEL,
            contents="Say 'API Key Working' in Bahasa Indonesia"
        )
        print(f"Response: {response.text}")
        return True
    except Exception as e:
        print(f"Error: {e}")
        return False

if __name__ == "__main__":
    success = asyncio.run(test_key())
    sys.exit(0 if success else 1)
