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
] 