from django.urls import path
from . import views

urlpatterns = [
    path('leagues/', views.get_leagues),
    path('leagues/create/', views.CreateLeagueView.as_view()),
    path('leagues/<int:league_id>/', views.get_league),
    path('leagues/<int:league_id>/update/', views.update_league, name='update_league'),
    path('leagues/<int:league_id>/add-member/<int:user_id>/', views.add_league_member, name='add_league_member'),
    path('leagues/<int:league_id>/invite/<int:user_id>/', views.invite_to_league),
    path('league-invites/<int:invite_id>/handle/', views.handle_league_invite),
    
    # Circuits
    path('leagues/<int:league_id>/circuits/', views.get_league_circuits, name='get_league_circuits'),
    path('leagues/<int:league_id>/circuits/create/', views.CreateCircuitView.as_view(), name='create_circuit'),
    path('circuits/<int:circuit_id>/', views.GetCircuitDetailView.as_view(), name='get_circuit_detail'),
    path('circuits/<int:circuit_id>/join/', views.join_circuit, name='join_circuit'),
    path('circuits/<int:circuit_id>/complete/', views.complete_circuit, name='complete_circuit'),
    path('circuits/<int:circuit_id>/complete-with-tiebreaker/', views.complete_circuit_with_tiebreaker, name='complete_circuit_with_tiebreaker'),
    path('circuits/<int:circuit_id>/events/<int:event_id>/complete/', views.complete_circuit_event, name='circuit_event_complete'),
    path('circuits/<int:circuit_id>/events/<int:event_id>/complete-event/', views.complete_circuit_event, name='circuit_event_complete_alt'),
    path('circuits/<int:circuit_id>/events/<int:event_id>/bets/', views.get_circuit_event_bets, name='get_circuit_event_bets'),
    path('circuits/<int:circuit_id>/completed-bets/', views.get_circuit_completed_bets, name='get_circuit_completed_bets'),
    
    # Market browsing endpoints
    path('market/browse/', views.browse_market, name='browse_market'),
    
    # Specific endpoints first
    path('leagues/bets/post_league_event/', views.post_league_event, name='post_league_event'),
    path('leagues/bets/competition/<str:competition_key>/', views.get_competition_events, name='get_competition_events'),
    path('leagues/bets/events/<int:event_id>/', views.get_event_details, name='get_event_details'),
    path('leagues/bets/place/', views.place_bet, name='place_bet'),
    path('leagues/bets/<str:sport>/', views.get_available_bets, name='get_sport_bets'),
    path('leagues/bets/test/', views.test_bets_endpoint, name='test_bets'),
    path('leagues/bets/', views.get_available_bets, name='get_available_bets'),
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

    # Chat endpoints
    path('leagues/<int:league_id>/chat/messages/', views.get_league_chat_messages, name='get-league-chat-messages'),
    path('leagues/<int:league_id>/chat/send/', views.send_chat_message, name='send-chat-message'),

    path('leagues/<int:league_id>/members/<int:user_id>/add/', views.add_league_member, name='add_league_member'),
    path('leagues/<int:league_id>/members/<int:user_id>/remove/', views.remove_league_member, name='remove_league_member'),
] 