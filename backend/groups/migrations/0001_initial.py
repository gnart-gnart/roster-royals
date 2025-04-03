# Generated by Django 4.2.19 on 2025-04-03 23:32

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='League',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100)),
                ('description', models.TextField(blank=True, null=True)),
                ('sports', models.JSONField(blank=True, default=list)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('image', models.ImageField(blank=True, default='league_images/logo.png', upload_to='league_images/')),
                ('captain', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='owned_leagues', to=settings.AUTH_USER_MODEL)),
                ('members', models.ManyToManyField(related_name='leagues', to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='LeagueEvent',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('event_key', models.CharField(max_length=255)),
                ('event_id', models.CharField(blank=True, max_length=255, null=True)),
                ('event_name', models.CharField(max_length=255)),
                ('sport', models.CharField(max_length=100)),
                ('commence_time', models.DateTimeField(blank=True, null=True)),
                ('home_team', models.CharField(blank=True, max_length=255, null=True)),
                ('away_team', models.CharField(blank=True, max_length=255, null=True)),
                ('market_data', models.JSONField(blank=True, null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('completed', models.BooleanField(default=False)),
                ('league', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='league_events', to='groups.league')),
            ],
        ),
        migrations.CreateModel(
            name='Bet',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=200)),
                ('type', models.CharField(max_length=50)),
                ('points', models.IntegerField()),
                ('status', models.CharField(choices=[('open', 'Open'), ('closed', 'Closed'), ('settled', 'Settled')], default='open', max_length=20)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('deadline', models.DateTimeField()),
                ('league', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='bets', to='groups.league')),
            ],
        ),
        migrations.CreateModel(
            name='UserBet',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('choice', models.CharField(max_length=50)),
                ('points_wagered', models.IntegerField()),
                ('result', models.CharField(choices=[('pending', 'Pending'), ('won', 'Won'), ('lost', 'Lost')], default='pending', max_length=20)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('bet', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='user_bets', to='groups.bet')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='bets', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'unique_together': {('user', 'bet')},
            },
        ),
        migrations.CreateModel(
            name='LeagueInvite',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('status', models.CharField(choices=[('pending', 'Pending'), ('accepted', 'Accepted'), ('rejected', 'Rejected')], default='pending', max_length=20)),
                ('league', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='invites', to='groups.league')),
                ('to_user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='league_invites', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'unique_together': {('league', 'to_user')},
            },
        ),
    ]
