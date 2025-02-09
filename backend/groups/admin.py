from django.contrib import admin
from .models import BettingGroup, Bet, UserBet, GroupInvite

class BettingGroupAdmin(admin.ModelAdmin):
    list_display = ('name', 'sports', 'president', 'created_at')
    search_fields = ('name', 'president__username')
    filter_horizontal = ('members',)

class BetAdmin(admin.ModelAdmin):
    list_display = ('name', 'type', 'points', 'status', 'deadline')
    list_filter = ('status', 'type')
    search_fields = ('name',)

class UserBetAdmin(admin.ModelAdmin):
    list_display = ('user', 'bet', 'choice', 'points_wagered')
    list_filter = ('choice',)
    search_fields = ('user__username',)

admin.site.register(BettingGroup, BettingGroupAdmin)
admin.site.register(Bet, BetAdmin)
admin.site.register(UserBet, UserBetAdmin)
admin.site.register(GroupInvite) 