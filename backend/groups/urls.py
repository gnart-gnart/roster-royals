from django.urls import path
from . import views

urlpatterns = [
    # League management
    path('leagues/', views.get_leagues, name='get-leagues'),
    path('leagues/create/', views.CreateLeagueView.as_view(), name='create-league'),
    path('leagues/<int:league_id>/', views.get_league, name='get-league'),
    path('leagues/<int:league_id>/add-member/<int:user_id>/', views.add_league_member, name='add-league-member'),
    path('leagues/<int:league_id>/invite/<int:user_id>/', views.invite_to_league, name='invite-to-league'),
    path('league-invites/<int:invite_id>/handle/', views.handle_league_invite, name='handle-league-invite'),
    
    # League events
    path('leagues/<int:league_id>/events/', views.get_league_events, name='get-league-events'),
    path('leagues/events/create/', views.create_custom_event, name='create-custom-event'),
    path('leagues/events/<int:event_id>/complete/', views.complete_league_event, name='complete-league-event'),
    path('leagues/events/<str:event_id>/', views.get_event_details, name='get-event-details'),
    
    # Market browsing 
    path('market/browse/', views.browse_market, name='browse-market'),
    path('leagues/bets/competition/<str:competition_key>/', views.get_competition_events, name='get-competition-events'),
    
    # Betting
    path('leagues/bets/post_league_event/', views.post_league_event, name='post-league-event'),
    path('leagues/bets/place/', views.place_bet, name='place-bet'),
    path('leagues/bets/<str:sport>/', views.get_available_bets, name='get-sport-bets'),
    path('leagues/bets/', views.get_available_bets, name='get-available-bets'),
    
    # Testing
    path('leagues/bets/test/', views.test_bets_endpoint, name='test-bets'),
] 