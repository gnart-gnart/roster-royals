from django.contrib import admin
from django.urls import path, include
from users.views import RegisterView, login_view, send_friend_request

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/register/', RegisterView.as_view(), name='register'),
    path('api/login/', login_view, name='login'),
    path('api/friend-request/<int:user_id>/', send_friend_request, name='friend-request'),
] 