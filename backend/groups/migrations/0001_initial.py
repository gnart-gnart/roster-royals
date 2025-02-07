# Generated by Django 4.2.19 on 2025-02-07 18:32

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
            name='BettingGroup',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100)),
                ('sport', models.CharField(max_length=50)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('members', models.ManyToManyField(related_name='joined_groups', to=settings.AUTH_USER_MODEL)),
                ('president', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='owned_groups', to=settings.AUTH_USER_MODEL)),
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
                ('group', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='bets', to='groups.bettinggroup')),
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
    ]
