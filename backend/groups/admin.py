from django.contrib import admin
from .models import League, Bet, UserBet, LeagueInvite, LeagueEvent

class LeagueAdmin(admin.ModelAdmin):
    list_display = ('name', 'sports', 'captain', 'created_at')
    search_fields = ('name', 'captain__username')
    filter_horizontal = ('members',)

class BetAdmin(admin.ModelAdmin):
    list_display = ('name', 'type', 'points', 'status', 'deadline')
    list_filter = ('status', 'type')
    search_fields = ('name',)

class UserBetAdmin(admin.ModelAdmin):
    list_display = ('user', 'bet', 'choice', 'points_wagered')
    list_filter = ('choice',)
    search_fields = ('user__username',)

class LeagueEventAdmin(admin.ModelAdmin):
    list_display = ('event_name', 'sport', 'league', 'created_at')
    search_fields = ('event_name', 'league__name')
    list_filter = ('sport',)

admin.site.register(League, LeagueAdmin)
admin.site.register(Bet, BetAdmin)
admin.site.register(UserBet, UserBetAdmin)
admin.site.register(LeagueInvite)
admin.site.register(LeagueEvent, LeagueEventAdmin) 