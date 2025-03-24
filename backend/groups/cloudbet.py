import os
from dotenv import load_dotenv
import requests
from django.conf import settings

# Load environment variables
load_dotenv()

class CloudbetClient:
    SUPPORTED_SPORTS = {
        'american-football': 'NFL',
        'basketball': 'NBA',
        'baseball': 'MLB',
        'soccer': 'Soccer',
        'ice-hockey': 'NHL'
    }

    def __init__(self):
        self.base_url = settings.CLOUDBET_API_BASE_URL.rstrip('/')
        api_key = os.getenv('CLOUDBET_API_KEY') or settings.CLOUDBET_API_KEY
        self.headers = {
            'X-API-Key': api_key,
            'Accept': 'application/json',
            'cache-control': 'max-age=600'
        }

    def get_sports(self):
        """Get list of available sports"""
        url = f'{self.base_url}/odds/sports'
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
            # Filter for only our supported sports with events
            return [
                sport for sport in data.get('sports', [])
                if sport['key'] in self.SUPPORTED_SPORTS 
                and sport['eventCount'] > 0
            ]
        response.raise_for_status()

    def get_competitions_for_sport(self, sport_key):
        """Get competitions for a specific sport, grouped by categories using the endpoint /odds/sports/{key}"""
        url = f'{self.base_url}/odds/sports/{sport_key}'
        print(f"\nDEBUG: Fetching competitions for sport: {sport_key} from {url}")
        response = requests.get(url, headers=self.headers)
        response.raise_for_status()
        return response.json()

    def get_competition_events(self, competition_key):
        """Get events for a specific competition"""
        url = f'{self.base_url}/odds/competitions/{competition_key}'
        print(f"Fetching competition events from: {url}")
        response = requests.get(url, headers=self.headers)
        response.raise_for_status()
        return response.json()

    def get_event_details(self, event_id):
        """Get detailed information for a specific event using the endpoint /odds/events/{id}"""
        url = f'{self.base_url}/odds/events/{event_id}'
        print(f"Fetching event details from: {url}")
        response = requests.get(url, headers=self.headers)
        response.raise_for_status()
        return response.json()