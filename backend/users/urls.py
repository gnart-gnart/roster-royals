from django.urls import path
from . import views

urlpatterns = [
    path('register/', views.RegisterView.as_view()),
    path('login/', views.login_view),
    path('friends/', views.get_friends),
    path('users/search/', views.search_users, name='search-users'),
    path('friend-requests/', views.get_friend_requests),
    path('friend-request/<int:request_id>/handle/', views.handle_friend_request),
    path('friend-request/send/<int:user_id>/', views.send_friend_request),
    path('notifications/', views.get_notifications),
    path('notifications/mark-read/', views.mark_notifications_read),
    path('friends/remove/<int:friend_id>/', views.remove_friend),
    path('google-auth/', views.google_auth, name='google-auth'),
    path('profile/', views.user_profile, name='user-profile'),
    path('profile/<int:user_id>/', views.view_user_profile, name='view-user-profile'),
    path('profile/update/', views.update_profile, name='user-update'),
    path('profile/betting-stats/', views.get_user_betting_stats, name='user-betting-stats'),
    path('profile/bet-history/', views.get_user_bet_history, name='user-bet-history'),
    path('profile/<int:user_id>/betting-stats/', views.get_other_user_betting_stats, name='view-user-betting-stats'),
    path('update-password/', views.update_password, name='update-password'),
    path('delete-account/', views.delete_account, name='delete-account'),
] 