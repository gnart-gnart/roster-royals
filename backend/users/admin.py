from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, FriendRequest, Notification, Friendship

class CustomUserAdmin(UserAdmin):
    list_display = ('username', 'email', 'points', 'date_joined')
    search_fields = ('username', 'email')
    ordering = ('-date_joined',)
    
    # Remove 'friends' from fieldsets since it's handled through Friendship model
    fieldsets = UserAdmin.fieldsets + (
        ('Custom Fields', {'fields': ('points',)}),
    )

class FriendshipAdmin(admin.ModelAdmin):
    list_display = ('user', 'friend', 'created_at')
    search_fields = ('user__username', 'friend__username')

class FriendRequestAdmin(admin.ModelAdmin):
    list_display = ('from_user', 'to_user', 'status', 'created_at')
    list_filter = ('status',)
    search_fields = ('from_user__username', 'to_user__username')

class NotificationAdmin(admin.ModelAdmin):
    list_display = ('user', 'message', 'notification_type', 'is_read', 'created_at')
    list_filter = ('notification_type', 'is_read')
    search_fields = ('user__username', 'message')

admin.site.register(User, CustomUserAdmin)
admin.site.register(Friendship, FriendshipAdmin)
admin.site.register(FriendRequest, FriendRequestAdmin)
admin.site.register(Notification, NotificationAdmin) 