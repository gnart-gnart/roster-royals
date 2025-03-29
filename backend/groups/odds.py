import os
from dotenv import load_dotenv
import requests
from django.conf import settings
import logging

# Load environment variables
load_dotenv()

logger = logging.getLogger(__name__)

class OddsApiClient:
    SUPPORTED_SPORTS_GROUPS = {
        'American Football': ['NFL', 'NCAAF'],
        'Basketball': ['NBA', 'NCAAB'],
        'Baseball': ['MLB'],
        'Hockey': ['NHL'],
        'Soccer': ['EPL', 'UEFA Champions League', 'MLS'],
    }

    def __init__(self):
        self.base_url = settings.ODDS_API_BASE_URL.rstrip('/')
        api_key = os.getenv('ODDS_API_KEY') or settings.ODDS_API_KEY
        self.api_key = api_key
        self.regions = 'us'  # Default to US odds
        self.odds_format = 'american'  # Default to american odds format
        self.date_format = 'iso'  # Default to ISO date format

    def get_sports(self, all_sports=False):
        """
        Get list of available sports
        
        Parameters:
        all_sports (bool): If True, returns all sports including out-of-season
        
        Returns:
        list: List of sport objects with keys, groups, titles, etc.
        """
        url = f'{self.base_url}/v4/sports'
        params = {
            'api_key': self.api_key,
            'all': all_sports
        }
        
        logger.debug(f"Fetching sports from Odds API: {url}")
        
        response = requests.get(url, params=params)
        response.raise_for_status()
        
        sports_data = response.json()
        
        # Group sports by their group attribute
        grouped_sports = {}
        for sport in sports_data:
            if sport['active']:  # Only include active sports
                group = sport['group']
                if group not in grouped_sports:
                    grouped_sports[group] = []
                grouped_sports[group].append(sport)
        
        return {
            'grouped_sports': grouped_sports,
            'sports': sports_data
        }

    def get_sport_events(self, sport_key):
        """
        Get events for a specific sport
        
        Parameters:
        sport_key (str): The key of the sport to fetch events for
        
        Returns:
        list: List of events for the specified sport
        """
        url = f'{self.base_url}/v4/sports/{sport_key}/odds'
        params = {
            'api_key': self.api_key,
            'regions': self.regions,
            'markets': 'h2h,spreads,totals',  # Common betting markets
            'oddsFormat': self.odds_format,
            'dateFormat': self.date_format
        }
        
        logger.debug(f"Fetching events for sport {sport_key} from Odds API: {url}")
        
        response = requests.get(url, params=params)
        response.raise_for_status()
        
        events_data = response.json()
        
        # Format events data with necessary information
        formatted_events = []
        for event in events_data:
            formatted_event = {
                'id': event['id'],
                'sport_key': event['sport_key'],
                'sport_title': sport_key,  # We might want to fetch this separately
                'commence_time': event['commence_time'],
                'home_team': event['home_team'],
                'away_team': event['away_team'],
                'event_name': f"{event['away_team']} @ {event['home_team']}",
                'bookmakers': event['bookmakers']
            }
            formatted_events.append(formatted_event)
        
        return formatted_events

    def get_event_odds(self, event_id):
        """
        Get detailed odds for a specific event
        
        Parameters:
        event_id (str): The ID of the event to fetch odds for
        
        Returns:
        dict: Detailed odds information for the event
        """
        # First we need to find which sport this event belongs to
        # Since the Odds API doesn't have a direct endpoint for event by ID,
        # we would need to search across sports
        
        # As a workaround, we can extract the sport key from the event ID
        # or require the caller to provide the sport key along with the event ID
        
        # For simplicity, we'll use the /sports/upcoming endpoint which returns
        # events across all sports, and filter for our event ID
        
        url = f'{self.base_url}/v4/sports/upcoming/odds'
        params = {
            'api_key': self.api_key,
            'regions': self.regions,
            'markets': 'h2h,spreads,totals',
            'oddsFormat': self.odds_format,
            'dateFormat': self.date_format
        }
        
        logger.debug(f"Searching for event {event_id} across all sports from Odds API")
        
        response = requests.get(url, params=params)
        response.raise_for_status()
        
        events_data = response.json()
        event_detail = None
        
        # Find the specific event
        for event in events_data:
            if event['id'] == event_id:
                event_detail = event
                break
        
        if not event_detail:
            logger.error(f"Event with ID {event_id} not found")
            raise ValueError(f"Event with ID {event_id} not found")
        
        return event_detail

    def format_event_for_display(self, event):
        """
        Format event data for display in the frontend
        
        Parameters:
        event (dict): The event data from the API
        
        Returns:
        dict: Formatted event data
        """
        # Extract the first bookmaker's odds (could improve to average or select preferred bookmaker)
        bookmaker = event['bookmakers'][0] if event['bookmakers'] else None
        markets = {}
        
        if bookmaker:
            for market in bookmaker['markets']:
                market_key = market['key']
                markets[market_key] = {
                    'key': market_key,
                    'outcomes': market['outcomes']
                }
        
        return {
            'id': event['id'],
            'sport_key': event['sport_key'],
            'commence_time': event['commence_time'],
            'home_team': event['home_team'],
            'away_team': event['away_team'],
            'event_name': f"{event['away_team']} @ {event['home_team']}",
            'bookmaker': bookmaker['key'] if bookmaker else None,
            'last_update': bookmaker['last_update'] if bookmaker else None,
            'markets': markets
        } 