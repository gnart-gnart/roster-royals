from django.urls import path
from . import views

urlpatterns = [
    path('groups/', views.get_groups),
    path('groups/create/', views.CreateGroupView.as_view()),
    path('groups/<int:group_id>/', views.get_group),
    path('groups/<int:group_id>/add-member/<int:user_id>/', views.add_group_member, name='add_group_member'),
    path('groups/<int:group_id>/invite/<int:user_id>/', views.invite_to_group),
    path('group-invites/<int:invite_id>/handle/', views.handle_group_invite),
] 