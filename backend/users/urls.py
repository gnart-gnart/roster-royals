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
    path('profile/update/', views.update_profile, name='user-update'),
    path('profile/betting-stats/', views.get_user_betting_stats, name='user-betting-stats'),
] 