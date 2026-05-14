import asyncio
import os
import sys

# Add backend to sys.path to import core.config
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from core.config import settings
from google import genai

async def list_models():
    client = genai.Client(api_key=settings.GEMINI_API_KEY)
    try:
        print("Available models:")
        for model in client.models.list():
            print(f"- {model.name}")
        return True
    except Exception as e:
        print(f"Error: {e}")
        return False

if __name__ == "__main__":
    asyncio.run(list_models())
