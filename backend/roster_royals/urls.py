from django.contrib import admin
from django.urls import path
from users import views as user_views
from groups import views as group_views

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/register/', user_views.RegisterView.as_view()),
    path('api/login/', user_views.login_view),
    path('api/friends/', user_views.get_friends),
    path('api/groups/', group_views.get_groups),
    path('api/groups/create/', group_views.CreateGroupView.as_view()),
    path('api/users/search/', user_views.search_users, name='search-users'),
    path('api/friend-requests/', user_views.get_friend_requests),
    path('api/friend-request/<int:request_id>/handle/', user_views.handle_friend_request),
    path('api/friend-request/send/<int:user_id>/', user_views.send_friend_request),
    path('api/notifications/', user_views.get_notifications),
    path('api/notifications/mark-read/', user_views.mark_notifications_read),
    path('api/friends/remove/<int:friend_id>/', user_views.remove_friend),
    path('api/groups/<int:group_id>/invite/<int:user_id>/', group_views.invite_to_group),
    path('api/group-invites/<int:invite_id>/handle/', group_views.handle_group_invite),
] 