from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, Friendship, FriendRequest, Notification

# Note: Django's built-in Group model (for permissions) is separate from our BettingGroup model
admin.site.register(User, UserAdmin)
admin.site.register(Friendship)
admin.site.register(FriendRequest)
admin.site.register(Notification) 