import os
from dotenv import load_dotenv
import requests
from django.conf import settings

# Load environment variables
load_dotenv()

class CloudbetClient:
    def __init__(self):
        self.base_url = 'https://sports-api.cloudbet.com/pub/v2/odds'
        api_key = os.getenv('CLOUDBET_API_KEY') or settings.CLOUDBET_API_KEY
        self.headers = {
            'X-API-Key': api_key,
            'Accept': 'application/json',
            'cache-control': 'max-age=600'
        }

    def get_sports(self):
        """Get list of available sports"""
        url = f'{self.base_url}/sports'
        print("\nDEBUG Cloudbet API Request:")
        print(f"URL: {url}")
        print(f"API Key (first 20 chars): {self.headers['X-API-Key'][:20]}...")
        print(f"Full headers being sent: {self.headers}")
        
        response = requests.get(url, headers=self.headers)
        print(f"\nDEBUG Response:")
        print(f"Status Code: {response.status_code}")
        print(f"Response Headers: {dict(response.headers)}")
        print(f"Response Body: {response.text[:500]}...")  # First 500 chars
        
        if response.ok:
            data = response.json()
            return data.get('sports', [])
        response.raise_for_status()

    def get_events(self, sport):
        """Get events for a specific sport"""
        url = f'{self.base_url}/sports/{sport}'
        response = requests.get(url, headers=self.headers)
        response.raise_for_status()
        return response.json() 