from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, FriendRequest

class CustomUserAdmin(UserAdmin):
    list_display = ('username', 'email', 'points', 'date_joined')
    search_fields = ('username', 'email')
    ordering = ('-date_joined',)
    
    # Add points to the fieldsets
    fieldsets = UserAdmin.fieldsets + (
        ('Custom Fields', {'fields': ('points', 'friends')}),
    )

class FriendRequestAdmin(admin.ModelAdmin):
    list_display = ('from_user', 'to_user', 'status', 'created_at')
    list_filter = ('status',)
    search_fields = ('from_user__username', 'to_user__username')

admin.site.register(User, CustomUserAdmin)
admin.site.register(FriendRequest, FriendRequestAdmin) 