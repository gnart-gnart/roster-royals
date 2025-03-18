from django.urls import path
from . import views

urlpatterns = [
    path('groups/', views.get_groups),
    path('groups/create/', views.CreateGroupView.as_view()),
    path('groups/<int:group_id>/', views.get_group),
    path('groups/<int:group_id>/add-member/<int:user_id>/', views.add_group_member, name='add_group_member'),
    path('groups/<int:group_id>/invite/<int:user_id>/', views.invite_to_group),
    path('group-invites/<int:invite_id>/handle/', views.handle_group_invite),
    
    # Move bets under groups/
    path('groups/bets/test/', views.test_bets_endpoint, name='test_bets'),
    path('groups/bets/', views.get_available_bets, name='get_available_bets'),
    path('groups/bets/<str:sport>/', views.get_available_bets, name='get_sport_bets'),
    path('groups/bets/competition/<str:competition_key>/', views.get_competition_events, name='get_competition_events'),
    path('groups/bets/events/<str:event_key>/', views.get_event_details, name='get_event_details'),
    path('groups/bets/place/', views.place_bet, name='place_bet'),
    
    # New bet-related URLs
    path('bets/add/', views.add_group_bet, name='add_group_bet'),
    path('bets/place/', views.place_member_bet, name='place_member_bet'),
    path('groups/<int:group_id>/bets/', views.get_group_bets, name='get_group_bets'),
    path('groups/<int:group_id>/member-bets/', views.get_member_bets, name='get_member_bets'),
] 